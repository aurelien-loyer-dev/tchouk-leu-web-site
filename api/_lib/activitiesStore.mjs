import crypto from "node:crypto";
import { list, put } from "@vercel/blob";

const STORE_PATH = "planning/activities.json";
const AUTH_COOKIE_NAME = "__Host-tchoukleu_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";
const RECURRING_ID_PREFIX = "recurring";
const RECURRING_DAYS_BEHIND = 14;
const RECURRING_WEEKS_AHEAD = 52;

const defaultActivities = [
  {
    id: "training-wed-all",
    title: "Entrainement toutes categories",
    category: "entrainement",
    date: "2026-03-18",
    startTime: "14:00",
    endTime: "17:00",
    location: "Gymnase de Stella",
    audience: "Toutes categories",
    description: "Session collective en salle pour tous les groupes du club.",
  },
  {
    id: "training-sat-u12-u15",
    title: "Entrainement M12 / M15",
    category: "entrainement",
    date: "2026-03-21",
    startTime: "15:30",
    endTime: "17:00",
    location: "Terrain de Beach de Saint-Leu",
    audience: "M12 / M15",
    description: "Travail technique, jeu collectif et preparation physique adaptee.",
  },
  {
    id: "training-sat-senior",
    title: "Entrainement seniors",
    category: "entrainement",
    date: "2026-03-21",
    startTime: "17:00",
    endTime: "19:00",
    location: "Terrain de Beach de Saint-Leu",
    audience: "Seniors",
    description: "Seance competition et perfectionnement pour le groupe senior.",
  },
  {
    id: "tournament-regional",
    title: "Tournoi regional de Saint-Leu",
    category: "tournoi",
    date: "2026-04-11",
    startTime: "09:00",
    endTime: "18:00",
    location: "Gymnase de Stella",
    audience: "Club et public",
    description: "Journee de competition avec equipes invitees et matchs tout au long de la journee.",
  },
  {
    id: "event-open-day",
    title: "Journee decouverte du club",
    category: "evenement",
    date: "2026-04-25",
    startTime: "10:00",
    endTime: "15:00",
    location: "Front de mer de Saint-Leu",
    audience: "Debutants et familles",
    description: "Initiations, demonstrations et rencontre avec les membres du club.",
  },
];

function toSortedActivities(activities) {
  return [...activities].sort((left, right) => {
    const leftValue = `${left.date}T${left.startTime}`;
    const rightValue = `${right.date}T${right.startTime}`;
    return leftValue.localeCompare(rightValue);
  });
}

function getDefaultActivities() {
  return toSortedActivities(defaultActivities);
}

function parseIsoDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function formatIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addUtcDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getTodayUtc() {
  const currentDate = new Date();
  return new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
}

function isWednesdayOrSaturday(isoDate) {
  const weekDay = parseIsoDate(isoDate).getUTCDay();
  return weekDay === 3 || weekDay === 6;
}

function getRecurringTemplates() {
  return defaultActivities.filter((activity) => activity.category === "entrainement" && isWednesdayOrSaturday(activity.date));
}

function getDefaultManualActivities() {
  const recurringTemplateIds = new Set(getRecurringTemplates().map((template) => template.id));
  return defaultActivities.filter((activity) => !recurringTemplateIds.has(activity.id));
}

function toRecurringActivityId(templateId, isoDate) {
  return `${RECURRING_ID_PREFIX}:${templateId}:${isoDate}`;
}

function buildRecurringOccurrence(template, isoDate) {
  return {
    ...template,
    id: toRecurringActivityId(template.id, isoDate),
    date: isoDate,
  };
}

function generateRecurringActivities(referenceDate = getTodayUtc()) {
  const startWindow = addUtcDays(referenceDate, -RECURRING_DAYS_BEHIND);
  const endWindow = addUtcDays(referenceDate, RECURRING_WEEKS_AHEAD * 7);
  const recurringActivities = [];

  for (const template of getRecurringTemplates()) {
    let occurrenceDate = parseIsoDate(template.date);

    while (occurrenceDate < startWindow) {
      occurrenceDate = addUtcDays(occurrenceDate, 7);
    }

    while (occurrenceDate <= endWindow) {
      recurringActivities.push(buildRecurringOccurrence(template, formatIsoDate(occurrenceDate)));
      occurrenceDate = addUtcDays(occurrenceDate, 7);
    }
  }

  return toSortedActivities(recurringActivities);
}

function areActivitiesEqual(leftActivity, rightActivity) {
  return (
    leftActivity?.id === rightActivity?.id &&
    leftActivity?.title === rightActivity?.title &&
    leftActivity?.category === rightActivity?.category &&
    leftActivity?.date === rightActivity?.date &&
    leftActivity?.startTime === rightActivity?.startTime &&
    leftActivity?.endTime === rightActivity?.endTime &&
    leftActivity?.location === rightActivity?.location &&
    leftActivity?.audience === rightActivity?.audience &&
    leftActivity?.description === rightActivity?.description
  );
}

function normalizeStorePayload(rawPayload) {
  if (Array.isArray(rawPayload)) {
    return {
      manualActivities: rawPayload,
      deletedRecurringIds: [],
    };
  }

  if (rawPayload && typeof rawPayload === "object") {
    const manualActivities = Array.isArray(rawPayload.manualActivities)
      ? rawPayload.manualActivities
      : Array.isArray(rawPayload.activities)
        ? rawPayload.activities
        : [];

    const deletedRecurringIds = Array.isArray(rawPayload.deletedRecurringIds)
      ? rawPayload.deletedRecurringIds.filter((id) => typeof id === "string")
      : [];

    return {
      manualActivities,
      deletedRecurringIds,
    };
  }

  return {
    manualActivities: [],
    deletedRecurringIds: [],
  };
}

function buildStorePayload(manualActivities, deletedRecurringIds) {
  return {
    manualActivities: toSortedActivities(manualActivities),
    deletedRecurringIds: [...new Set(deletedRecurringIds)].sort(),
  };
}

function mergeActivities(manualActivities, deletedRecurringIds) {
  const deletedIds = new Set(deletedRecurringIds);
  const recurringActivities = generateRecurringActivities().filter((activity) => !deletedIds.has(activity.id));
  const activityMap = new Map();

  for (const activity of recurringActivities) {
    activityMap.set(activity.id, activity);
  }

  for (const activity of manualActivities) {
    activityMap.set(activity.id, activity);
  }

  return toSortedActivities(Array.from(activityMap.values()));
}

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || `${getAdminPassword()}::session-secret`;
}

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME;
}

export function parseCookies(rawCookieHeader = "") {
  return rawCookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, currentCookie) => {
      const separatorIndex = currentCookie.indexOf("=");
      if (separatorIndex <= 0) {
        return accumulator;
      }

      const key = currentCookie.slice(0, separatorIndex).trim();
      const value = currentCookie.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function getRequestIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (!forwardedFor) {
    return "";
  }

  const firstSegment = String(forwardedFor).split(",")[0];
  return firstSegment.trim();
}

function getAllowedIps() {
  return (process.env.ADMIN_ALLOWED_IPS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isIpAllowedRequest(request) {
  const allowedIps = getAllowedIps();
  if (allowedIps.length === 0) {
    return true;
  }

  const requestIp = getRequestIp(request);
  return allowedIps.includes(requestIp);
}

function toBase64Url(rawValue) {
  return Buffer.from(rawValue, "utf8").toString("base64url");
}

function fromBase64Url(base64Value) {
  return Buffer.from(base64Value, "base64url").toString("utf8");
}

function signPayload(payloadSegment) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payloadSegment).digest("base64url");
}

function createSessionToken() {
  const payload = {
    username: getAdminUsername(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const signatureSegment = signPayload(payloadSegment);
  return `${payloadSegment}.${signatureSegment}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  const [payloadSegment, signatureSegment] = token.split(".");

  if (!payloadSegment || !signatureSegment) {
    return false;
  }

  const expectedSignature = signPayload(payloadSegment);
  const providedSignatureBuffer = Buffer.from(signatureSegment);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadSegment));
    return payload?.username === getAdminUsername() && Number(payload?.expiresAt || 0) > Date.now();
  } catch {
    return false;
  }
}

export function isAuthenticatedRequest(request) {
  if (!isIpAllowedRequest(request)) {
    return false;
  }

  const cookies = parseCookies(request.headers.cookie || "");
  const cookieValue = cookies[AUTH_COOKIE_NAME];
  return verifySessionToken(cookieValue);
}

export function getSessionCookieValue() {
  const maxAgeInSeconds = Math.floor(SESSION_DURATION_MS / 1000);
  const sessionToken = createSessionToken();
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${maxAgeInSeconds}`;
}

export function clearSessionCookieValue() {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0`;
}

export async function ensureActivitiesInitialized() {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const allBlobs = await list({ prefix: "planning/", limit: 20 });
  const existingBlob = allBlobs.blobs.find((blob) => blob.pathname === STORE_PATH);

  if (existingBlob) {
    return existingBlob.url;
  }

  const createdBlob = await put(STORE_PATH, JSON.stringify(buildStorePayload(getDefaultManualActivities(), [])), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return createdBlob.url;
}

export async function readActivities() {
  if (!isBlobConfigured()) {
    return mergeActivities(getDefaultManualActivities(), []);
  }

  try {
    const blobUrl = await ensureActivitiesInitialized();
    const response = await fetch(blobUrl, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Blob fetch failed with status ${response.status}`);
    }

    const parsedPayload = await response.json();
    const { manualActivities, deletedRecurringIds } = normalizeStorePayload(parsedPayload);
    return mergeActivities(manualActivities, deletedRecurringIds);
  } catch (error) {
    console.error("Unable to read activities from Vercel Blob", error);
    return mergeActivities(getDefaultManualActivities(), []);
  }
}

export async function writeActivities(activities) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const safeActivities = Array.isArray(activities) ? activities : getDefaultActivities();
  const recurringActivities = generateRecurringActivities();
  const recurringById = new Map(recurringActivities.map((activity) => [activity.id, activity]));
  const selectedRecurringIds = new Set();
  const manualActivities = [];

  for (const activity of safeActivities) {
    if (!activity || typeof activity.id !== "string") {
      continue;
    }

    const recurringActivity = recurringById.get(activity.id);

    if (!recurringActivity) {
      manualActivities.push(activity);
      continue;
    }

    selectedRecurringIds.add(activity.id);

    if (!areActivitiesEqual(activity, recurringActivity)) {
      manualActivities.push(activity);
    }
  }

  const deletedRecurringIds = recurringActivities
    .map((activity) => activity.id)
    .filter((id) => !selectedRecurringIds.has(id));

  const payload = buildStorePayload(manualActivities, deletedRecurringIds);

  await put(STORE_PATH, JSON.stringify(payload), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return mergeActivities(payload.manualActivities, payload.deletedRecurringIds);
}

export async function resetActivities() {
  await writeActivities(mergeActivities(getDefaultManualActivities(), []));
  return mergeActivities(getDefaultManualActivities(), []);
}

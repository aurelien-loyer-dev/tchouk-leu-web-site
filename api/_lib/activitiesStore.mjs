import crypto from "node:crypto";
import { list, put } from "@vercel/blob";

const STORE_PATH = "planning/activities.json";
const AUTH_COOKIE_NAME = "__Host-tchoukleu_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";

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
    title: "Entrainement U12 / U15",
    category: "entrainement",
    date: "2026-03-21",
    startTime: "15:30",
    endTime: "17:00",
    location: "Terrain de Beach de Saint-Leu",
    audience: "U12 / U15",
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

  const createdBlob = await put(STORE_PATH, JSON.stringify(defaultActivities), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return createdBlob.url;
}

export async function readActivities() {
  if (!isBlobConfigured()) {
    return getDefaultActivities();
  }

  try {
    const blobUrl = await ensureActivitiesInitialized();
    const response = await fetch(blobUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Blob fetch failed with status ${response.status}`);
    }

    const parsedActivities = await response.json();

    if (!Array.isArray(parsedActivities)) {
      return getDefaultActivities();
    }

    return toSortedActivities(parsedActivities);
  } catch (error) {
    console.error("Unable to read activities from Vercel Blob", error);
    return getDefaultActivities();
  }
}

export async function writeActivities(activities) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const safeActivities = Array.isArray(activities) ? activities : defaultActivities;
  await put(STORE_PATH, JSON.stringify(toSortedActivities(safeActivities)), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return toSortedActivities(safeActivities);
}

export async function resetActivities() {
  await writeActivities(defaultActivities);
  return getDefaultActivities();
}

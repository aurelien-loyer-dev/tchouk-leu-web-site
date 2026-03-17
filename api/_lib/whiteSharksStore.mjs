import crypto from "node:crypto";
import { list, put } from "@vercel/blob";

const STORE_PATH = "club/white-sharks.json";
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";
const ALLOWED_MEMBER_TYPES = new Set(["joueur", "capitaine", "coach", "benevole"]);
const MEMBER_TYPE_ORDER = ["coach", "benevole", "capitaine", "joueur"];

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizePalmaresEntry(entry) {
  if (!isObject(entry)) {
    return null;
  }

  const id = typeof entry.id === "string" ? entry.id : "";
  const title = typeof entry.title === "string" ? entry.title.trim() : "";
  const year = typeof entry.year === "string" ? entry.year.trim() : "";
  const description = typeof entry.description === "string" ? entry.description.trim() : "";
  const createdAt = typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString();

  if (!id || !title || !year) {
    return null;
  }

  return {
    id,
    title,
    year,
    description,
    createdAt,
  };
}

function normalizePlayer(entry) {
  if (!isObject(entry)) {
    return null;
  }

  const id = typeof entry.id === "string" ? entry.id : "";
  const firstName = typeof entry.firstName === "string" ? entry.firstName.trim() : "";
  const lastName = typeof entry.lastName === "string" ? entry.lastName.trim() : "";
  const club = typeof entry.club === "string" ? entry.club.trim() : "";
  const position = typeof entry.position === "string" ? entry.position.trim() : "";
  const memberType = typeof entry.memberType === "string" && ALLOWED_MEMBER_TYPES.has(entry.memberType)
    ? entry.memberType
    : "joueur";
  const birthYear = typeof entry.birthYear === "number" && Number.isInteger(entry.birthYear) && entry.birthYear >= 1900 && entry.birthYear <= 2100
    ? entry.birthYear
    : null;
  const createdAt = typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString();

  if (!id || !firstName || !lastName || !club) {
    return null;
  }

  return {
    id,
    firstName,
    lastName,
    club,
    position,
    memberType,
    ...(birthYear !== null ? { birthYear } : {}),
    createdAt,
  };
}

function parseYearValue(value) {
  if (!value) {
    return Number.MIN_SAFE_INTEGER;
  }

  if (/^\d{4}$/.test(value)) {
    return Number(value);
  }

  const yearMatch = value.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? Number(yearMatch[0]) : Number.MIN_SAFE_INTEGER;
}

function comparePalmares(left, right) {
  const leftYear = parseYearValue(left.year);
  const rightYear = parseYearValue(right.year);

  if (leftYear !== rightYear) {
    return rightYear - leftYear;
  }

  return right.createdAt.localeCompare(left.createdAt);
}

function comparePlayers(left, right) {
  const leftTypeIndex = MEMBER_TYPE_ORDER.indexOf(left.memberType);
  const rightTypeIndex = MEMBER_TYPE_ORDER.indexOf(right.memberType);

  if (leftTypeIndex !== rightTypeIndex) {
    return leftTypeIndex - rightTypeIndex;
  }

  const leftName = `${left.lastName} ${left.firstName}`.toLocaleLowerCase("fr-FR");
  const rightName = `${right.lastName} ${right.firstName}`.toLocaleLowerCase("fr-FR");

  if (leftName !== rightName) {
    return leftName.localeCompare(rightName);
  }

  return right.createdAt.localeCompare(left.createdAt);
}

function buildPayload(data) {
  return {
    palmares: [...data.palmares].sort(comparePalmares),
    players: [...data.players].sort(comparePlayers),
  };
}

function normalizePayload(rawPayload) {
  if (!isObject(rawPayload)) {
    return buildPayload({ palmares: [], players: [] });
  }

  const palmares = Array.isArray(rawPayload.palmares)
    ? rawPayload.palmares.map(normalizePalmaresEntry).filter(Boolean)
    : [];

  const players = Array.isArray(rawPayload.players)
    ? rawPayload.players.map(normalizePlayer).filter(Boolean)
    : [];

  return buildPayload({ palmares, players });
}

async function ensureInitialized() {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const allBlobs = await list({ prefix: "club/", limit: 30 });
  const existingBlob = allBlobs.blobs.find((blob) => blob.pathname === STORE_PATH);

  if (existingBlob) {
    return existingBlob.url;
  }

  const createdBlob = await put(STORE_PATH, JSON.stringify(buildPayload({ palmares: [], players: [] })), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return createdBlob.url;
}

async function writeData(data) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const normalizedData = buildPayload(data);

  await put(STORE_PATH, JSON.stringify(normalizedData), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return normalizedData;
}

export async function readWhiteSharksData() {
  if (!isBlobConfigured()) {
    return buildPayload({ palmares: [], players: [] });
  }

  try {
    const blobUrl = await ensureInitialized();
    const response = await fetch(blobUrl, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Blob fetch failed with status ${response.status}`);
    }

    const payload = await response.json();
    return normalizePayload(payload);
  } catch (error) {
    console.error("Unable to read White Sharks data", error);
    return buildPayload({ palmares: [], players: [] });
  }
}

function validatePalmaresInput(input) {
  if (!isObject(input)) {
    throw new Error("Palmarès invalide.");
  }

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const year = typeof input.year === "string" ? input.year.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";

  if (!title) {
    throw new Error("Le titre du palmarès est obligatoire.");
  }

  if (!year) {
    throw new Error("L'année du palmarès est obligatoire.");
  }

  return {
    title,
    year,
    description,
  };
}

function validatePlayerInput(input) {
  if (!isObject(input)) {
    throw new Error("Joueur invalide.");
  }

  const firstName = typeof input.firstName === "string" ? input.firstName.trim() : "";
  const lastName = typeof input.lastName === "string" ? input.lastName.trim() : "";
  const club = typeof input.club === "string" ? input.club.trim() : "";
  const position = typeof input.position === "string" ? input.position.trim() : "";
  const memberType = typeof input.memberType === "string" && ALLOWED_MEMBER_TYPES.has(input.memberType)
    ? input.memberType
    : "joueur";

  if (!firstName || !lastName) {
    throw new Error("Le prénom et le nom du joueur sont obligatoires.");
  }

  if (!club) {
    throw new Error("Le club d'origine est obligatoire.");
  }

  return {
    firstName,
    lastName,
    club,
    position,
    memberType,
  };
}

export async function addWhiteSharksPalmares(input) {
  const fields = validatePalmaresInput(input);
  const data = await readWhiteSharksData();

  const nextData = {
    ...data,
    palmares: [
      {
        id: crypto.randomUUID(),
        ...fields,
        createdAt: new Date().toISOString(),
      },
      ...data.palmares,
    ],
  };

  return writeData(nextData);
}

export async function updateWhiteSharksPalmares(input) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const id = typeof input?.id === "string" ? input.id : "";

  if (!id) {
    throw new Error("Identifiant de palmarès manquant.");
  }

  const fields = validatePalmaresInput(input);
  const data = await readWhiteSharksData();
  const existing = data.palmares.find((entry) => entry.id === id);

  if (!existing) {
    throw new Error("Palmarès introuvable.");
  }

  const nextData = {
    ...data,
    palmares: data.palmares.map((entry) => (entry.id === id ? { ...entry, ...fields } : entry)),
  };

  return writeData(nextData);
}

export async function removeWhiteSharksPalmares(idInput) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const id = typeof idInput === "string" ? idInput : "";
  const data = await readWhiteSharksData();
  const nextData = {
    ...data,
    palmares: data.palmares.filter((entry) => entry.id !== id),
  };

  return writeData(nextData);
}

export async function addWhiteSharksPlayer(input) {
  const fields = validatePlayerInput(input);
  const data = await readWhiteSharksData();

  const nextData = {
    ...data,
    players: [
      {
        id: crypto.randomUUID(),
        ...fields,
        createdAt: new Date().toISOString(),
      },
      ...data.players,
    ],
  };

  return writeData(nextData);
}

export async function updateWhiteSharksPlayer(input) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const id = typeof input?.id === "string" ? input.id : "";

  if (!id) {
    throw new Error("Identifiant de joueur manquant.");
  }

  const fields = validatePlayerInput(input);
  const data = await readWhiteSharksData();
  const existing = data.players.find((entry) => entry.id === id);

  if (!existing) {
    throw new Error("Joueur introuvable.");
  }

  const nextData = {
    ...data,
    players: data.players.map((entry) => (entry.id === id ? { ...entry, ...fields } : entry)),
  };

  return writeData(nextData);
}

export async function removeWhiteSharksPlayer(idInput) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const id = typeof idInput === "string" ? idInput : "";
  const data = await readWhiteSharksData();
  const nextData = {
    ...data,
    players: data.players.filter((entry) => entry.id !== id),
  };

  return writeData(nextData);
}

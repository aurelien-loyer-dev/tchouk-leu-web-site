import crypto from "node:crypto";
import { list, put } from "@vercel/blob";
import { deleteImage, uploadImage } from "./cloudinaryUpload.mjs";

const STORE_PATH = "club/wall-of-fame.json";
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";
const MAX_DATA_URL_LENGTH = 8_000_000;
const ALLOWED_FUNCTIONS = new Set(["coach", "joueur", "benevole", "president"]);

// Write-through cache: prevents stale reads after rapid sequential writes
// (Vercel Blob CDN has an eventual-consistency window between put() and the next fetch)
let _blobUrlCache = null;
let _membersCache = null;
let _membersCacheWrittenAt = 0;
const MEMBERS_CACHE_TTL_MS = 90_000;

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toMemberSinceTimestamp(memberSince) {
  const normalizedValue = typeof memberSince === "string" ? memberSince.trim() : "";
  if (!normalizedValue) return Number.POSITIVE_INFINITY;
  if (/^\d{4}$/.test(normalizedValue)) return Date.UTC(Number(normalizedValue), 0, 1);
  const parsedTimestamp = Date.parse(normalizedValue);
  if (!Number.isNaN(parsedTimestamp)) return parsedTimestamp;
  const yearMatch = normalizedValue.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) return Date.UTC(Number(yearMatch[0]), 0, 1);
  return Number.POSITIVE_INFINITY;
}

const FUNCTION_PRIORITY = ["president", "coach", "joueur", "benevole"];

function getMemberFunctionPriority(member) {
  const priorities = member.functions
    .map((fn) => FUNCTION_PRIORITY.indexOf(fn))
    .filter((i) => i !== -1);
  return priorities.length > 0 ? Math.min(...priorities) : FUNCTION_PRIORITY.length;
}

function compareMembersBySeniority(left, right) {
  const leftSince = toMemberSinceTimestamp(left.memberSince);
  const rightSince = toMemberSinceTimestamp(right.memberSince);
  if (leftSince !== rightSince) return leftSince - rightSince;
  const leftPriority = getMemberFunctionPriority(left);
  const rightPriority = getMemberFunctionPriority(right);
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;
  return right.createdAt.localeCompare(left.createdAt);
}

function normalizePalmaresByFunction(functions, inputPalmaresByFunction, fallbackPalmares = "") {
  const normalized = {};
  if (isObject(inputPalmaresByFunction)) {
    for (const fn of functions) {
      const raw = inputPalmaresByFunction[fn];
      const val = typeof raw === "string" ? raw.trim() : "";
      if (val) normalized[fn] = val;
    }
  }
  if (Object.keys(normalized).length === 0 && fallbackPalmares) {
    for (const fn of functions) normalized[fn] = fallbackPalmares;
  }
  return normalized;
}

function buildLegacyPalmares(palmaresByFunction) {
  const first = Object.values(palmaresByFunction).find((v) => typeof v === "string" && v.trim());
  return typeof first === "string" ? first : "";
}

function normalizeMember(member) {
  if (!isObject(member)) return null;
  const id = typeof member.id === "string" ? member.id : "";
  const firstName = typeof member.firstName === "string" ? member.firstName.trim() : "";
  const lastName = typeof member.lastName === "string" ? member.lastName.trim() : "";
  const legacyPalmares = typeof member.palmares === "string" ? member.palmares.trim() : "";
  const memberSince = typeof member.memberSince === "string" ? member.memberSince.trim() : "";
  const photoSrc = typeof member.photoSrc === "string" ? member.photoSrc : "";
  const functions = Array.isArray(member.functions)
    ? member.functions.filter((e) => typeof e === "string" && ALLOWED_FUNCTIONS.has(e))
    : [];
  const palmaresByFunction = normalizePalmaresByFunction(functions, member.palmaresByFunction, legacyPalmares);
  const createdAt = typeof member.createdAt === "string" ? member.createdAt : new Date().toISOString();

  if (!id || !firstName || !lastName || !memberSince || !photoSrc || functions.length === 0) return null;

  return {
    id, firstName, lastName,
    palmares: buildLegacyPalmares(palmaresByFunction),
    palmaresByFunction, memberSince, photoSrc, functions, createdAt,
  };
}

function normalizePayload(rawPayload) {
  if (!isObject(rawPayload) || !Array.isArray(rawPayload.members)) return [];
  return rawPayload.members.map(normalizeMember).filter(Boolean).sort(compareMembersBySeniority);
}

function buildPayload(members) {
  return { members };
}

async function ensureInitialized() {
  if (!isBlobConfigured()) throw new Error(BLOB_CONFIG_ERROR);
  if (_blobUrlCache !== null) return _blobUrlCache;

  const allBlobs = await list({ prefix: "club/", limit: 20 });
  const existingBlob = allBlobs.blobs.find((blob) => blob.pathname === STORE_PATH);

  if (existingBlob) {
    _blobUrlCache = existingBlob.url;
    return _blobUrlCache;
  }

  const createdBlob = await put(STORE_PATH, JSON.stringify(buildPayload([])), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  _blobUrlCache = createdBlob.url;
  return _blobUrlCache;
}

export async function readWallOfFameMembers() {
  if (!isBlobConfigured()) return [];

  if (_membersCache !== null && Date.now() - _membersCacheWrittenAt < MEMBERS_CACHE_TTL_MS) {
    return _membersCache;
  }

  try {
    const blobUrl = await ensureInitialized();
    const response = await fetch(blobUrl, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });

    if (!response.ok) throw new Error(`Blob fetch failed with status ${response.status}`);

    const parsedPayload = await response.json();
    const members = normalizePayload(parsedPayload);
    _membersCache = members;
    _membersCacheWrittenAt = Date.now();
    return members;
  } catch (error) {
    console.error("Unable to read Wall of Fame members", error);
    return [];
  }
}

function validateNewMember(memberInput) {
  if (!isObject(memberInput)) throw new Error("Membre invalide.");

  const firstName = typeof memberInput.firstName === "string" ? memberInput.firstName.trim() : "";
  const lastName = typeof memberInput.lastName === "string" ? memberInput.lastName.trim() : "";
  const legacyPalmares = typeof memberInput.palmares === "string" ? memberInput.palmares.trim() : "";
  const memberSince = typeof memberInput.memberSince === "string" ? memberInput.memberSince.trim() : "";
  const photoSrc = typeof memberInput.photoSrc === "string" ? memberInput.photoSrc : "";
  const functions = Array.isArray(memberInput.functions)
    ? [...new Set(memberInput.functions.filter((e) => typeof e === "string" && ALLOWED_FUNCTIONS.has(e)))]
    : [];
  const palmaresByFunction = normalizePalmaresByFunction(functions, memberInput.palmaresByFunction, legacyPalmares);

  if (!firstName || !lastName) throw new Error("Le prénom et le nom sont obligatoires.");
  if (!memberSince) throw new Error("Le champ 'adhérent depuis' est obligatoire.");
  if (functions.length === 0) throw new Error("Sélectionnez au moins une fonction.");
  if (!photoSrc.startsWith("data:image/")) throw new Error("Le format de photo est invalide.");
  if (photoSrc.length > MAX_DATA_URL_LENGTH) throw new Error("La photo est trop volumineuse.");

  return {
    id: crypto.randomUUID(),
    firstName, lastName,
    palmares: buildLegacyPalmares(palmaresByFunction),
    palmaresByFunction, memberSince, photoSrc, functions,
    createdAt: new Date().toISOString(),
  };
}

function validateMemberFields(memberInput) {
  if (!isObject(memberInput)) throw new Error("Membre invalide.");

  const firstName = typeof memberInput.firstName === "string" ? memberInput.firstName.trim() : "";
  const lastName = typeof memberInput.lastName === "string" ? memberInput.lastName.trim() : "";
  const legacyPalmares = typeof memberInput.palmares === "string" ? memberInput.palmares.trim() : "";
  const memberSince = typeof memberInput.memberSince === "string" ? memberInput.memberSince.trim() : "";
  const functions = Array.isArray(memberInput.functions)
    ? [...new Set(memberInput.functions.filter((e) => typeof e === "string" && ALLOWED_FUNCTIONS.has(e)))]
    : [];
  const palmaresByFunction = normalizePalmaresByFunction(functions, memberInput.palmaresByFunction, legacyPalmares);

  if (!firstName || !lastName) throw new Error("Le prénom et le nom sont obligatoires.");
  if (!memberSince) throw new Error("Le champ 'adhérent depuis' est obligatoire.");
  if (functions.length === 0) throw new Error("Sélectionnez au moins une fonction.");

  return {
    firstName, lastName,
    palmares: buildLegacyPalmares(palmaresByFunction),
    palmaresByFunction, memberSince, functions,
  };
}

async function writeMembers(members) {
  if (!isBlobConfigured()) throw new Error(BLOB_CONFIG_ERROR);

  await put(STORE_PATH, JSON.stringify(buildPayload(members)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  _membersCache = members;
  _membersCacheWrittenAt = Date.now();
  return members;
}

export async function addWallOfFameMember(memberInput) {
  const nextMember = validateNewMember(memberInput);
  // Upload photo to Cloudinary — returns a public CDN URL
  nextMember.photoSrc = await uploadImage(nextMember.photoSrc, nextMember.id, "tchouk-leu/waf");
  const existingMembers = await readWallOfFameMembers();
  const nextMembers = [nextMember, ...existingMembers].sort(compareMembersBySeniority);
  return writeMembers(nextMembers);
}

export async function updateWallOfFameMember(memberInput) {
  if (!isBlobConfigured()) throw new Error(BLOB_CONFIG_ERROR);

  const memberId = typeof memberInput?.id === "string" ? memberInput.id : "";
  if (!memberId) throw new Error("Identifiant de profil manquant.");

  const validatedFields = validateMemberFields(memberInput);
  const nextPhotoSrc = typeof memberInput.photoSrc === "string" ? memberInput.photoSrc : "";

  if (nextPhotoSrc && !nextPhotoSrc.startsWith("data:image/")) throw new Error("Le format de photo est invalide.");
  if (nextPhotoSrc && nextPhotoSrc.length > MAX_DATA_URL_LENGTH) throw new Error("La photo est trop volumineuse.");

  const existingMembers = await readWallOfFameMembers();
  const existingMember = existingMembers.find((m) => m.id === memberId);
  if (!existingMember) throw new Error("Profil introuvable.");

  // Upload new photo to Cloudinary if provided
  let resolvedPhotoSrc = existingMember.photoSrc;
  if (nextPhotoSrc) {
    resolvedPhotoSrc = await uploadImage(nextPhotoSrc, memberId, "tchouk-leu/waf");
  }

  const updatedMembers = existingMembers
    .map((m) => m.id !== memberId ? m : { ...m, ...validatedFields, photoSrc: resolvedPhotoSrc })
    .sort(compareMembersBySeniority);

  return writeMembers(updatedMembers);
}

export async function removeWallOfFameMember(memberId) {
  if (!isBlobConfigured()) throw new Error(BLOB_CONFIG_ERROR);

  const normalizedId = typeof memberId === "string" ? memberId : "";
  const existingMembers = await readWallOfFameMembers();
  const memberToDelete = existingMembers.find((m) => m.id === normalizedId);
  const nextMembers = existingMembers.filter((m) => m.id !== normalizedId);

  // Delete photo from Cloudinary (non-blocking)
  if (memberToDelete?.photoSrc) {
    void deleteImage(memberToDelete.photoSrc);
  }

  return writeMembers(nextMembers);
}


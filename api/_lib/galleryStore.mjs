import crypto from "node:crypto";
import { del, list, put } from "@vercel/blob";

const STORE_PATH = "gallery/photos.json";
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";
const ALLOWED_CATEGORIES = new Set(["matches", "training", "events"]);
const MAX_DATA_URL_LENGTH = 8_000_000;

let _blobUrlCache = null;
let _photosCache = null;
let _photosCacheWrittenAt = 0;
const PHOTOS_CACHE_TTL_MS = 60_000;

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// Upload a base64 data URL as a real image file in Vercel Blob.
// Returns the public CDN URL.
async function dataUrlToBlob(dataUrl, photoId) {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) throw new Error("data URL invalide.");

  const header = dataUrl.slice(0, commaIndex);
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const ext = mimeType === "image/jpeg" ? "jpg" : (mimeType.split("/")[1] || "jpg");

  const buffer = Buffer.from(dataUrl.slice(commaIndex + 1), "base64");

  const blob = await put(`gallery/images/${photoId}.${ext}`, buffer, {
    access: "private",
    contentType: mimeType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return blob.url;
}

function normalizePhoto(photo) {
  if (!isObject(photo)) {
    return null;
  }

  const id = typeof photo.id === "string" ? photo.id : "";
  const src = typeof photo.src === "string" ? photo.src : "";
  const alt = typeof photo.alt === "string" ? photo.alt : "";
  const category = typeof photo.category === "string" ? photo.category : "";
  const createdAt = typeof photo.createdAt === "string" ? photo.createdAt : new Date().toISOString();
  const albumTitle = typeof photo.albumTitle === "string" ? photo.albumTitle.trim() : "";

  if (!id || !src || !alt || !ALLOWED_CATEGORIES.has(category)) {
    return null;
  }

  return {
    id,
    src,
    alt,
    category,
    createdAt,
    ...(albumTitle ? { albumTitle } : {}),
  };
}

function normalizeGalleryPayload(rawPayload) {
  if (!isObject(rawPayload) || !Array.isArray(rawPayload.photos)) {
    return [];
  }

  return rawPayload.photos
    .map(normalizePhoto)
    .filter(Boolean)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function buildStorePayload(photos) {
  return { photos };
}

async function ensureGalleryInitialized() {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  if (_blobUrlCache !== null) {
    return _blobUrlCache;
  }

  const allBlobs = await list({ prefix: "gallery/", limit: 20 });
  const existingBlob = allBlobs.blobs.find((blob) => blob.pathname === STORE_PATH);

  if (existingBlob) {
    _blobUrlCache = existingBlob.url;
    return _blobUrlCache;
  }

  const createdBlob = await put(STORE_PATH, JSON.stringify(buildStorePayload([])), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  _blobUrlCache = createdBlob.url;
  return _blobUrlCache;
}

export async function readGalleryPhotos() {
  if (!isBlobConfigured()) {
    return [];
  }

  if (_photosCache !== null && Date.now() - _photosCacheWrittenAt < PHOTOS_CACHE_TTL_MS) {
    return _photosCache;
  }

  try {
    const blobUrl = await ensureGalleryInitialized();
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
    const photos = normalizeGalleryPayload(parsedPayload);
    _photosCache = photos;
    _photosCacheWrittenAt = Date.now();
    return photos;
  } catch (error) {
    console.error("Unable to read gallery photos from Vercel Blob", error);
    return [];
  }
}

function validateNewPhotoInput(photoInput) {
  if (!isObject(photoInput)) {
    throw new Error("Photo invalide.");
  }

  const alt = typeof photoInput.alt === "string" ? photoInput.alt.trim() : "";
  const category = typeof photoInput.category === "string" ? photoInput.category : "";
  const src = typeof photoInput.src === "string" ? photoInput.src : "";

  if (!alt) {
    throw new Error("Le texte alternatif est obligatoire.");
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new Error("Categorie de photo invalide.");
  }

  if (!src.startsWith("data:image/")) {
    throw new Error("Le format de photo est invalide.");
  }

  if (src.length > MAX_DATA_URL_LENGTH) {
    throw new Error("La photo est trop volumineuse.");
  }

  const albumTitle = typeof photoInput.albumTitle === "string" ? photoInput.albumTitle.trim() : "";

  return {
    id: crypto.randomUUID(),
    src,
    alt,
    category,
    createdAt: new Date().toISOString(),
    ...(albumTitle ? { albumTitle } : {}),
  };
}

function validatePhotoSource(photoSourceInput, fallbackAlt) {
  if (!isObject(photoSourceInput)) {
    throw new Error("Photo invalide.");
  }

  const src = typeof photoSourceInput.src === "string" ? photoSourceInput.src : "";
  const altRaw = typeof photoSourceInput.alt === "string" ? photoSourceInput.alt.trim() : "";
  const alt = altRaw || fallbackAlt;

  if (!alt) {
    throw new Error("Le texte alternatif est obligatoire.");
  }

  if (!src.startsWith("data:image/")) {
    throw new Error("Le format de photo est invalide.");
  }

  if (src.length > MAX_DATA_URL_LENGTH) {
    throw new Error("Une des photos est trop volumineuse.");
  }

  return { src, alt };
}

async function writeGalleryPhotos(photos) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  await put(STORE_PATH, JSON.stringify(buildStorePayload(photos)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  _photosCache = photos;
  _photosCacheWrittenAt = Date.now();
  return photos;
}

export async function addGalleryPhoto(photoInput) {
  const nextPhoto = validateNewPhotoInput(photoInput);
  // Store image as a separate public blob file — keeps the JSON metadata tiny
  nextPhoto.src = await dataUrlToBlob(nextPhoto.src, nextPhoto.id);
  const existingPhotos = await readGalleryPhotos();
  const nextPhotos = [nextPhoto, ...existingPhotos].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return writeGalleryPhotos(nextPhotos);
}

export async function addGalleryAlbum(albumInput) {
  if (!isObject(albumInput)) {
    throw new Error("Album invalide.");
  }

  const title = typeof albumInput.title === "string" ? albumInput.title.trim() : "";
  const category = typeof albumInput.category === "string" ? albumInput.category : "";
  const photosInput = Array.isArray(albumInput.photos) ? albumInput.photos : [];

  if (!title) {
    throw new Error("Le titre de l'album est obligatoire.");
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new Error("Categorie de photo invalide.");
  }

  if (photosInput.length === 0) {
    throw new Error("Ajoutez au moins une photo dans l'album.");
  }

  const createdAt = new Date().toISOString();

  // Upload all album images in parallel to blob storage
  const nextAlbumPhotos = await Promise.all(
    photosInput.map(async (photoInput, index) => {
      const validated = validatePhotoSource(photoInput, `${title} ${index + 1}`);
      const photoId = crypto.randomUUID();
      const blobUrl = await dataUrlToBlob(validated.src, photoId);
      return {
        id: photoId,
        src: blobUrl,
        alt: validated.alt,
        category,
        createdAt,
        albumTitle: title,
      };
    })
  );

  const existingPhotos = await readGalleryPhotos();
  const nextPhotos = [...nextAlbumPhotos, ...existingPhotos].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return writeGalleryPhotos(nextPhotos);
}

export async function removeGalleryPhoto(photoId) {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const normalizedId = typeof photoId === "string" ? photoId : "";
  const existingPhotos = await readGalleryPhotos();
  const photoToDelete = existingPhotos.find((p) => p.id === normalizedId);
  const nextPhotos = existingPhotos.filter((photo) => photo.id !== normalizedId);

  // Delete the actual image file from blob storage if it was stored as a URL
  if (photoToDelete && photoToDelete.src.startsWith("https://")) {
    try {
      await del(photoToDelete.src);
    } catch {
      // Non-blocking: log but don't fail the delete operation
      console.warn("Could not delete image blob:", photoToDelete.src);
    }
  }

  return writeGalleryPhotos(nextPhotos);
}

// Migrate existing data URL entries to separate blob files.
// Safe to call multiple times (skips already-migrated entries).
// Returns { total, migrated, errors[] } so callers can surface failures.
export async function migrateGalleryPhotos() {
  const photos = await readGalleryPhotos();
  const toMigrate = photos.filter((p) => p.src.startsWith("data:image/") || p.src.startsWith("data:"));

  if (toMigrate.length === 0) {
    return { total: photos.length, migrated: 0, errors: [] };
  }

  // Upload all images in parallel — much faster than sequential, avoids timeout
  const results = await Promise.allSettled(
    toMigrate.map(async (photo) => {
      const blobUrl = await dataUrlToBlob(photo.src, photo.id);
      return { id: photo.id, blobUrl };
    })
  );

  const updatedPhotos = [...photos];
  let migrated = 0;
  const errors = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { id, blobUrl } = result.value;
      const idx = updatedPhotos.findIndex((p) => p.id === id);
      if (idx !== -1) {
        updatedPhotos[idx] = { ...updatedPhotos[idx], src: blobUrl };
        migrated++;
      }
    } else {
      const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error("Failed to migrate gallery photo:", msg);
      errors.push({ error: msg });
    }
  }

  if (migrated > 0) {
    await writeGalleryPhotos(updatedPhotos);
  }

  return { total: photos.length, migrated, errors };
}

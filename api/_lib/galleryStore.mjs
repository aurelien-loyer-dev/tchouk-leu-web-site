import crypto from "node:crypto";
import { list, put } from "@vercel/blob";

const STORE_PATH = "gallery/photos.json";
const BLOB_CONFIG_ERROR = "Le stockage Vercel Blob n'est pas configure. Ajoutez BLOB_READ_WRITE_TOKEN dans le projet Vercel.";
const ALLOWED_CATEGORIES = new Set(["matches", "training", "events"]);
const MAX_DATA_URL_LENGTH = 8_000_000;

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
  return {
    photos,
  };
}

async function ensureGalleryInitialized() {
  if (!isBlobConfigured()) {
    throw new Error(BLOB_CONFIG_ERROR);
  }

  const allBlobs = await list({ prefix: "gallery/", limit: 20 });
  const existingBlob = allBlobs.blobs.find((blob) => blob.pathname === STORE_PATH);

  if (existingBlob) {
    return existingBlob.url;
  }

  const createdBlob = await put(STORE_PATH, JSON.stringify(buildStorePayload([])), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return createdBlob.url;
}

export async function readGalleryPhotos() {
  if (!isBlobConfigured()) {
    return [];
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
    return normalizeGalleryPayload(parsedPayload);
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

  return {
    src,
    alt,
  };
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

  return photos;
}

export async function addGalleryPhoto(photoInput) {
  const nextPhoto = validateNewPhotoInput(photoInput);
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
  const nextAlbumPhotos = photosInput.map((photoInput, index) => {
    const normalizedPhotoSource = validatePhotoSource(photoInput, `${title} ${index + 1}`);

    return {
      id: crypto.randomUUID(),
      src: normalizedPhotoSource.src,
      alt: normalizedPhotoSource.alt,
      category,
      createdAt,
      albumTitle: title,
    };
  });

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
  const nextPhotos = existingPhotos.filter((photo) => photo.id !== normalizedId);
  return writeGalleryPhotos(nextPhotos);
}

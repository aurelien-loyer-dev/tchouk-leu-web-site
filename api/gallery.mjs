import { addGalleryAlbum, addGalleryPhoto, readGalleryPhotos, removeGalleryPhoto } from "./_lib/galleryStore.mjs";
import { isAuthenticatedRequest } from "./_lib/adminAuth.mjs";

function sendJson(response, statusCode, body) {
  response.setHeader("Cache-Control", "no-store");
  response.status(statusCode).json(body);
}

// Convert private blob URLs to proxy URLs the browser can load without auth.
// Data URLs (legacy) and already-proxied URLs are passed through unchanged.
function toClientSrc(src) {
  if (typeof src === "string" && src.startsWith("https://") && src.includes(".blob.vercel-storage.com")) {
    return `/api/image?url=${encodeURIComponent(src)}`;
  }
  return src;
}

function toClientPhotos(photos) {
  return photos.map((p) => ({ ...p, src: toClientSrc(p.src) }));
}

function parseBody(requestBody) {
  if (!requestBody) {
    return {};
  }

  if (typeof requestBody === "string") {
    return JSON.parse(requestBody);
  }

  return requestBody;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "GET") {
    response.setHeader("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
    const photos = await readGalleryPhotos();
    return sendJson(response, 200, { photos: toClientPhotos(photos) });
  }

  if (request.method === "POST") {
    if (!isAuthenticatedRequest(request)) {
      return sendJson(response, 401, { error: "Unauthorized" });
    }

    let parsedBody = {};
    try {
      parsedBody = parseBody(request.body);
    } catch {
      return sendJson(response, 400, { error: "Invalid JSON body" });
    }

    try {
      const photos = Array.isArray(parsedBody.photos)
        ? await addGalleryAlbum(parsedBody)
        : await addGalleryPhoto(parsedBody);
      return sendJson(response, 200, { photos });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add photo";
      return sendJson(response, 503, { error: message });
    }
  }

  if (request.method === "DELETE") {
    if (!isAuthenticatedRequest(request)) {
      return sendJson(response, 401, { error: "Unauthorized" });
    }

    let parsedBody = {};
    try {
      parsedBody = parseBody(request.body);
    } catch {
      return sendJson(response, 400, { error: "Invalid JSON body" });
    }

    try {
      const photos = await removeGalleryPhoto(parsedBody.id);
      return sendJson(response, 200, { photos });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete photo";
      return sendJson(response, 503, { error: message });
    }
  }

  return sendJson(response, 405, { error: "Method not allowed" });
}

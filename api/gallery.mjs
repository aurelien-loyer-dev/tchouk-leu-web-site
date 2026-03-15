import { addGalleryPhoto, readGalleryPhotos, removeGalleryPhoto } from "./_lib/galleryStore.mjs";
import { isAuthenticatedRequest } from "./_lib/adminAuth.mjs";

function sendJson(response, statusCode, body) {
  response.setHeader("Cache-Control", "no-store");
  response.status(statusCode).json(body);
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
    const photos = await readGalleryPhotos();
    return sendJson(response, 200, { photos });
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
      const photos = await addGalleryPhoto(parsedBody);
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

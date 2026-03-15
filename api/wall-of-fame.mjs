import { addWallOfFameMember, readWallOfFameMembers, removeWallOfFameMember, updateWallOfFameMember } from "./_lib/wallOfFameStore.mjs";
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
    const members = await readWallOfFameMembers();
    return sendJson(response, 200, { members });
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
      const members = await addWallOfFameMember(parsedBody);
      return sendJson(response, 200, { members });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add member";
      return sendJson(response, 503, { error: message });
    }
  }

  if (request.method === "PUT") {
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
      const members = await updateWallOfFameMember(parsedBody);
      return sendJson(response, 200, { members });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update member";
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
      const members = await removeWallOfFameMember(parsedBody.id);
      return sendJson(response, 200, { members });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete member";
      return sendJson(response, 503, { error: message });
    }
  }

  return sendJson(response, 405, { error: "Method not allowed" });
}

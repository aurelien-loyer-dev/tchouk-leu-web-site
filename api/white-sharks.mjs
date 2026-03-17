import {
  addWhiteSharksPalmares,
  addWhiteSharksPlayer,
  readWhiteSharksData,
  removeWhiteSharksPalmares,
  removeWhiteSharksPlayer,
  updateWhiteSharksPalmares,
  updateWhiteSharksPlayer,
} from "./_lib/whiteSharksStore.mjs";
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
    const data = await readWhiteSharksData();
    return sendJson(response, 200, data);
  }

  if (!isAuthenticatedRequest(request)) {
    return sendJson(response, 401, { error: "Unauthorized" });
  }

  let body = {};
  try {
    body = parseBody(request.body);
  } catch {
    return sendJson(response, 400, { error: "Invalid JSON body" });
  }

  try {
    if (request.method === "POST") {
      if (body.entity === "palmares") {
        const data = await addWhiteSharksPalmares(body);
        return sendJson(response, 200, data);
      }

      if (body.entity === "player") {
        const data = await addWhiteSharksPlayer(body);
        return sendJson(response, 200, data);
      }

      return sendJson(response, 400, { error: "Entity must be 'palmares' or 'player'." });
    }

    if (request.method === "PUT") {
      if (body.entity === "palmares") {
        const data = await updateWhiteSharksPalmares(body);
        return sendJson(response, 200, data);
      }

      if (body.entity === "player") {
        const data = await updateWhiteSharksPlayer(body);
        return sendJson(response, 200, data);
      }

      return sendJson(response, 400, { error: "Entity must be 'palmares' or 'player'." });
    }

    if (request.method === "DELETE") {
      if (body.entity === "palmares") {
        const data = await removeWhiteSharksPalmares(body.id);
        return sendJson(response, 200, data);
      }

      if (body.entity === "player") {
        const data = await removeWhiteSharksPlayer(body.id);
        return sendJson(response, 200, data);
      }

      return sendJson(response, 400, { error: "Entity must be 'palmares' or 'player'." });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save White Sharks data";
    return sendJson(response, 503, { error: message });
  }

  return sendJson(response, 405, { error: "Method not allowed" });
}

import { readActivities, writeActivities } from "./_lib/activitiesStore.mjs";
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
    const activities = await readActivities();
    return sendJson(response, 200, { activities });
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

    const savedActivities = await writeActivities(parsedBody.activities);
    return sendJson(response, 200, { activities: savedActivities });
  }

  return sendJson(response, 405, { error: "Method not allowed" });
}

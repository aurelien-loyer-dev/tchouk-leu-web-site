import { readActivities, writeActivities, isAuthenticatedRequest } from "./_lib/activitiesStore.mjs";

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

export default async function handler(request) {
  if (request.method === "GET") {
    const activities = await readActivities();
    return jsonResponse(200, { activities });
  }

  if (request.method === "PUT") {
    if (!isAuthenticatedRequest(request)) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const parsedBody = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const savedActivities = await writeActivities(parsedBody.activities);
    return jsonResponse(200, { activities: savedActivities });
  }

  return jsonResponse(405, { error: "Method not allowed" });
}

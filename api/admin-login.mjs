import { getAdminPassword, getAdminUsername, getSessionCookieValue, isIpAllowedRequest } from "./_lib/activitiesStore.mjs";

function jsonResponse(statusCode, body, additionalHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...additionalHeaders,
    },
    body: JSON.stringify(body),
  };
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  if (!isIpAllowedRequest(request)) {
    return jsonResponse(403, { error: "Forbidden" });
  }

  const parsedBody = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const providedUsername = parsedBody.username || "";
  const providedPassword = parsedBody.password || "";

  if (providedUsername !== getAdminUsername() || providedPassword !== getAdminPassword()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return jsonResponse(401, { error: "Invalid credentials" });
  }

  return jsonResponse(200, { ok: true }, { "Set-Cookie": getSessionCookieValue() });
}

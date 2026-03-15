import { getAdminPassword, getAdminUsername, getSessionCookieValue, isIpAllowedRequest } from "./_lib/adminAuth.mjs";

function sendJson(response, statusCode, body, additionalHeaders = {}) {
  response.setHeader("Cache-Control", "no-store");

  for (const [headerName, headerValue] of Object.entries(additionalHeaders)) {
    response.setHeader(headerName, headerValue);
  }

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
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  if (!isIpAllowedRequest(request)) {
    return sendJson(response, 403, { error: "Forbidden" });
  }

  let parsedBody = {};
  try {
    parsedBody = parseBody(request.body);
  } catch {
    return sendJson(response, 400, { error: "Invalid JSON body" });
  }

  const providedUsername = parsedBody.username || "";
  const providedPassword = parsedBody.password || "";

  if (providedUsername !== getAdminUsername() || providedPassword !== getAdminPassword()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return sendJson(response, 401, { error: "Invalid credentials" });
  }

  return sendJson(response, 200, { ok: true }, { "Set-Cookie": getSessionCookieValue() });
}

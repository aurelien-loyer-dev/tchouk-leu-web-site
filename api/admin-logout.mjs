import { clearSessionCookieValue } from "./_lib/adminAuth.mjs";

function sendJson(response, statusCode, body, additionalHeaders = {}) {
  response.setHeader("Cache-Control", "no-store");

  for (const [headerName, headerValue] of Object.entries(additionalHeaders)) {
    response.setHeader(headerName, headerValue);
  }

  response.status(statusCode).json(body);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  return sendJson(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookieValue() });
}

import { clearSessionCookieValue } from "./_lib/activitiesStore.mjs";

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

  return jsonResponse(200, { ok: true }, { "Set-Cookie": clearSessionCookieValue() });
}

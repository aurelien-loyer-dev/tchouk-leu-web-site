import { isAuthenticatedRequest } from "./_lib/activitiesStore.mjs";

export default async function handler(request) {
  if (request.method !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const authenticated = isAuthenticatedRequest(request);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ authenticated }),
  };
}

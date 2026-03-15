import { isAuthenticatedRequest } from "./_lib/adminAuth.mjs";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const authenticated = isAuthenticatedRequest(request);
  return response.status(200).json({ authenticated });
}

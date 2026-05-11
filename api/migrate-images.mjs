import { migrateGalleryPhotos } from "./_lib/galleryStore.mjs";
import { migrateWallOfFamePhotos } from "./_lib/wallOfFameStore.mjs";
import { isAuthenticatedRequest } from "./_lib/adminAuth.mjs";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthenticatedRequest(request)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [gallery, wallOfFame] = await Promise.all([
      migrateGalleryPhotos(),
      migrateWallOfFamePhotos(),
    ]);

    return response.status(200).json({ gallery, wallOfFame });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Migration failed";
    return response.status(500).json({ error: message });
  }
}

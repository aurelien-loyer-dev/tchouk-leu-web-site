import { list, put } from "@vercel/blob";
import { migrateGalleryPhotos, readGalleryPhotos } from "./_lib/galleryStore.mjs";
import { migrateWallOfFamePhotos, readWallOfFameMembers } from "./_lib/wallOfFameStore.mjs";
import { isAuthenticatedRequest } from "./_lib/adminAuth.mjs";

// ── helpers ───────────────────────────────────────────────────────────────────

function srcKind(src) {
  if (typeof src !== "string") return "not-a-string";
  if (src.startsWith("https://")) return "https";
  if (src.startsWith("data:image/")) return "data:image";
  if (src.startsWith("data:")) return "data:other";
  if (src === "") return "empty";
  return `unknown(${src.slice(0, 40)})`;
}

// Read the raw blob JSON without going through the normalizer
async function readRawBlobJson(storePath) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const allBlobs = await list({ prefix: storePath.split("/")[0] + "/", limit: 50 });
  const blob = allBlobs.blobs.find((b) => b.pathname === storePath);
  if (!blob) return null;
  const res = await fetch(blob.url, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// ── handler ───────────────────────────────────────────────────────────────────

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (!isAuthenticatedRequest(request)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  // GET → diagnostic: tell us what formats are actually stored
  if (request.method === "GET") {
    try {
      const [rawGallery, rawWaf] = await Promise.all([
        readRawBlobJson("gallery/photos.json"),
        readRawBlobJson("club/wall-of-fame.json"),
      ]);

      const galleryPhotos = Array.isArray(rawGallery?.photos) ? rawGallery.photos : [];
      const wafMembers = Array.isArray(rawWaf?.members) ? rawWaf.members : [];

      const gallerySample = galleryPhotos.slice(0, 5).map((p) => ({
        id: p.id,
        srcKind: srcKind(p.src),
        srcPreview: typeof p.src === "string" ? p.src.slice(0, 80) : null,
        srcLength: typeof p.src === "string" ? p.src.length : 0,
      }));

      const wafSample = wafMembers.slice(0, 5).map((m) => ({
        id: m.id,
        name: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(),
        srcKind: srcKind(m.photoSrc),
        srcPreview: typeof m.photoSrc === "string" ? m.photoSrc.slice(0, 80) : null,
        srcLength: typeof m.photoSrc === "string" ? m.photoSrc.length : 0,
      }));

      const galleryKinds = galleryPhotos.reduce((acc, p) => {
        const k = srcKind(p.src);
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {});

      const wafKinds = wafMembers.reduce((acc, m) => {
        const k = srcKind(m.photoSrc);
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {});

      return response.status(200).json({
        gallery: { total: galleryPhotos.length, kinds: galleryKinds, sample: gallerySample },
        wallOfFame: { total: wafMembers.length, kinds: wafKinds, sample: wafSample },
      });
    } catch (error) {
      return response.status(500).json({ error: error instanceof Error ? error.message : "Diagnostic failed" });
    }
  }

  // POST → run migration (sequential: gallery first, then WAF to avoid hammering blob in parallel)
  if (request.method === "POST") {
    try {
      const gallery = await migrateGalleryPhotos();
      const wallOfFame = await migrateWallOfFamePhotos();
      return response.status(200).json({ gallery, wallOfFame });
    } catch (error) {
      return response.status(500).json({ error: error instanceof Error ? error.message : "Migration failed" });
    }
  }

  return response.status(405).json({ error: "Method not allowed" });
}

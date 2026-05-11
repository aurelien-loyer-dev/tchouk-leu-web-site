// Proxy for private Vercel Blob images.
// The browser cannot load private blobs directly (no auth header possible).
// This endpoint fetches the image server-side with the token and returns it
// with aggressive CDN cache headers — after the first hit, subsequent requests
// are served from Vercel Edge Cache (instant, no function invocation).
export default async function handler(request, response) {
  const rawUrl = typeof request.query?.url === "string" ? request.query.url : "";

  if (!rawUrl) {
    return response.status(400).end("Missing url parameter");
  }

  // Security: only proxy images from our Vercel Blob store
  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return response.status(400).end("Invalid URL");
  }

  if (!parsedUrl.hostname.endsWith(".blob.vercel-storage.com")) {
    return response.status(403).end("Forbidden: only Vercel Blob URLs are allowed");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return response.status(503).end("Blob storage not configured");
  }

  try {
    const imageRes = await fetch(rawUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!imageRes.ok) {
      return response.status(imageRes.status).end();
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await imageRes.arrayBuffer());

    // Cache for 1 year at CDN level — private blob URLs are immutable
    // (content at a given URL never changes; new uploads get new paths)
    response.setHeader("Content-Type", contentType);
    response.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
    response.setHeader("Vary", "Accept-Encoding");
    return response.status(200).send(buffer);
  } catch (error) {
    console.error("Image proxy error:", error);
    return response.status(502).end("Failed to fetch image");
  }
}

import { isAuthenticatedRequest } from "./_lib/adminAuth.mjs";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (!isAuthenticatedRequest(request)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  return response.status(200).json({
    cloudinary: {
      cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
      apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
    },
    blob: {
      token: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    },
  });
}

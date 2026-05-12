import { v2 as cloudinary } from "cloudinary";

let _configured = false;

function configure() {
  if (_configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  _configured = true;
}

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Upload a base64 data URL to Cloudinary.
// Returns a public CDN URL with automatic format + quality optimisation.
export async function uploadImage(dataUrl, publicId, folder) {
  configure();
  const result = await cloudinary.uploader.upload(dataUrl, {
    public_id: publicId,
    folder,
    resource_type: "image",
    overwrite: true,
    // f_auto: serves WebP/AVIF to browsers that support it (-40 to -60% size)
    // q_auto: automatic quality reduction with no visible loss
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });

  // Store the URL with optimisation params baked in so the browser gets
  // the best format without extra configuration.
  return result.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
}

// Delete an image from Cloudinary by its CDN URL.
// Non-blocking — errors are logged but do not throw.
export async function deleteImage(url) {
  if (!isCloudinaryConfigured() || !url || !url.includes("res.cloudinary.com")) return;

  configure();
  try {
    // Extract public_id from URL:
    // https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto/v{n}/{folder}/{id}.{ext}
    const match = url.match(/\/upload\/(?:[^/]+\/)?(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (match?.[1]) {
      await cloudinary.uploader.destroy(match[1], { resource_type: "image" });
    }
  } catch (err) {
    console.warn("Could not delete Cloudinary image:", url, err?.message);
  }
}

export { isCloudinaryConfigured };

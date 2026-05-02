/**
 * Cloudinary uploader for AI-generated images
 * Falls back to Base64 data URL if Cloudinary is not configured
 */

import { v2 as cloudinary } from "cloudinary";

let configured = false;

function configure() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export function isCloudinaryReady(): boolean {
  configure();
  return configured;
}

/**
 * Upload an image buffer to Cloudinary
 * @param buffer Image bytes
 * @param folder Subfolder (e.g. 'ai-generated', 'articles')
 * @returns Secure HTTPS URL of the uploaded image
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder = "ai-generated"
): Promise<string> {
  configure();

  if (!configured) {
    throw new Error("Cloudinary غير مهيأ — أضف المفاتيح في Vercel");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `ajelsa/${folder}`,
          resource_type: "image",
          format: "webp",
          quality: "auto:good",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"));
            return;
          }
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

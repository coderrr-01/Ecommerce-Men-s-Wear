import { ValidationError } from "@/lib/errors";

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGE_REQUEST_BYTES = MAX_PRODUCT_IMAGE_BYTES + 64 * 1024;

export type SupportedImageMime = "image/jpeg" | "image/png" | "image/webp";

export function detectImageMime(bytes: Uint8Array): SupportedImageMime | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function validateProductImage(bytes: Uint8Array, declaredMime: string): SupportedImageMime {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_PRODUCT_IMAGE_BYTES) {
    throw new ValidationError("Each image must be 5 MB or smaller.");
  }

  const detectedMime = detectImageMime(bytes);
  if (!detectedMime || (declaredMime && detectedMime !== declaredMime)) {
    throw new ValidationError("Upload a valid JPEG, PNG, or WebP image.");
  }
  return detectedMime;
}

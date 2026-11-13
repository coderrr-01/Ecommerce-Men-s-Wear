import "server-only";
import { env } from "@/env";
import { ProviderError } from "@/lib/errors";
import { CloudinaryStorageProvider } from "./cloudinary";
import type { StorageProvider } from "./types";

export type { StorageProvider, UploadInput, UploadResult } from "./types";

let cachedProvider: StorageProvider | undefined;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ProviderError(
      "Cloudinary",
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required",
    );
  }

  cachedProvider = new CloudinaryStorageProvider({
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  });

  return cachedProvider;
}

import "server-only";
import { env } from "@/env";
import { ProviderError } from "@/lib/errors";
import { CloudinaryStorageProvider } from "./cloudinary";
import type { StorageProvider } from "./types";

export type { StorageProvider, UploadInput, UploadResult } from "./types";

let cachedProvider: StorageProvider | undefined;

export function isStorageConfigured(): boolean {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = env;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ProviderError(
      "Cloudinary",
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required",
    );
  }

  cachedProvider = new CloudinaryStorageProvider({
    cloudName,
    apiKey,
    apiSecret,
  });

  return cachedProvider;
}

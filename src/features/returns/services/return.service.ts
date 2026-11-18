import "server-only";

import { siteConfig } from "@/config/site.config";
import { validateProductImage } from "@/features/catalog/product-image.utils";
import {
  createReturnRequest,
  listAdminReturnRequests,
  transitionReturnRequest,
} from "@/features/returns/repositories/return.repository";
import { validateReturnReason } from "@/features/returns/return.utils";
import { getStorageProvider, isStorageConfigured } from "@/lib/providers/storage";
import { ProviderError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function requestReturn(
  userId: string,
  orderItemId: string,
  reasonInput: string,
  files: File[],
) {
  const reason = validateReturnReason(reasonInput);
  if (files.length > 3) throw new ValidationError("You can upload at most three photos.");
  if (files.length && !isStorageConfigured()) {
    throw new ProviderError("Storage", "Photo storage is not configured.");
  }
  const provider = files.length ? getStorageProvider() : null;
  const uploaded: { url: string; publicId: string }[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const mimeType = validateProductImage(bytes, file.type);
      const image = await provider!.upload({
        file: bytes,
        fileName: `return-${index + 1}`,
        mimeType,
        folder: `returns/${userId}`,
      });
      uploaded.push({ url: image.url, publicId: image.publicId });
    }
    return await createReturnRequest(
      userId,
      orderItemId,
      reason,
      uploaded,
      new Date(),
      siteConfig.shipping.returnsWindowDays,
    );
  } catch (error) {
    for (const photo of uploaded) {
      try {
        await provider?.delete(photo.publicId);
      } catch {
        logger.error("return.photo_cleanup_failed", { userId });
      }
    }
    throw error;
  }
}

export async function updateReturnRequest(
  id: string,
  action: "APPROVE" | "REJECT" | "RECEIVE" | "RETURN" | "EXCHANGE",
  actorId: string,
) {
  return transitionReturnRequest(id, action, actorId);
}

export async function getReturnRequests() {
  return listAdminReturnRequests();
}

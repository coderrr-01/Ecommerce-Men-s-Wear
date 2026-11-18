import "server-only";

import { isStorageConfigured, getStorageProvider } from "@/lib/providers/storage";
import { validateProductImage } from "@/features/catalog/product-image.utils";
import {
  aggregateProductReviews,
  createReviewSafely,
  findExistingReview,
  findReviewOrders,
  listReviewsForAdmin,
  setReviewStatus,
} from "@/features/reviews/repositories/review.repository";
import {
  isReviewEligible,
  sanitizeReviewText,
  validateReviewRating,
} from "@/features/reviews/review.utils";
import { ConflictError, NotFoundError, ProviderError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export type ReviewSubmissionState =
  "SIGN_IN" | "ELIGIBLE" | "NOT_ELIGIBLE" | "PENDING" | "APPROVED" | "REJECTED";

export async function getReviewSubmissionState(
  userId: string | null,
  productId: string,
): Promise<ReviewSubmissionState> {
  if (!userId) return "SIGN_IN";
  const [orders, existing] = await Promise.all([
    findReviewOrders(userId, productId),
    findExistingReview(userId, productId),
  ]);
  if (existing) return existing.status;
  return isReviewEligible(userId, productId, orders) ? "ELIGIBLE" : "NOT_ELIGIBLE";
}

export async function canReviewProduct(userId: string, productId: string) {
  return (await getReviewSubmissionState(userId, productId)) === "ELIGIBLE";
}

export async function submitReview(
  userId: string,
  input: { productId: string; rating: number; title: string; comment: string },
  files: File[],
) {
  const rating = validateReviewRating(input.rating);
  const title = sanitizeReviewText(input.title, 120) || null;
  const comment = sanitizeReviewText(input.comment, 2000) || null;
  if (!title && !comment) throw new ValidationError("Add a title or a review.");
  if (files.length > 3) throw new ValidationError("You can upload at most three review photos.");
  if (!(await canReviewProduct(userId, input.productId))) {
    throw new ConflictError("A delivered order containing this item is required to review it.");
  }
  if (files.length && !isStorageConfigured()) {
    throw new ProviderError("Storage", "Photo storage is not configured.");
  }

  const provider = files.length ? getStorageProvider() : null;
  const uploaded: { url: string; publicId: string }[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const mimeType = validateProductImage(bytes, file.type);
      const asset = await provider!.upload({
        file: bytes,
        fileName: `review-${index + 1}`,
        mimeType,
        folder: `reviews/${input.productId}`,
      });
      uploaded.push({ url: asset.url, publicId: asset.publicId });
    }
    const review = await createReviewSafely(
      userId,
      input.productId,
      { rating, title, comment },
      uploaded,
    );
    if (!review) throw new ConflictError("You have already reviewed this product.");
    return { id: review.id, status: "PENDING" };
  } catch (error) {
    for (const photo of uploaded) {
      try {
        await provider?.delete(photo.publicId);
      } catch {
        logger.error("review.photo_cleanup_failed", { productId: input.productId });
      }
    }
    throw error;
  }
}

export async function moderateReview(id: string, status: "APPROVED" | "REJECTED") {
  const result = await setReviewStatus(id, status);
  if (!result.count) throw new NotFoundError("Review");
  return { id, status };
}

export async function getAdminReviews() {
  return listReviewsForAdmin();
}

export async function getReviewAggregate(productId: string) {
  const result = await aggregateProductReviews(productId);
  return { average: result._avg.rating ?? 0, count: result._count._all };
}

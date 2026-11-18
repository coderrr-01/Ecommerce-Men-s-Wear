import { ValidationError } from "@/lib/errors";

export interface ReviewEligibilityOrder {
  userId: string | null;
  status: string;
  deliveredAt: Date | null;
  items: { productId: string | null }[];
}

export function isReviewEligible(
  userId: string | null,
  productId: string,
  orders: ReviewEligibilityOrder[],
  hasExistingReview = false,
): boolean {
  if (!userId || hasExistingReview) return false;
  return orders.some(
    (order) =>
      order.userId === userId &&
      order.status === "DELIVERED" &&
      order.deliveredAt !== null &&
      order.items.some((item) => item.productId === productId),
  );
}

export function sanitizeReviewText(value: string, maximum: number): string {
  const clean = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length > maximum)
    throw new ValidationError(`Text must be ${maximum} characters or fewer.`);
  return clean;
}

export function validateReviewRating(rating: number): number {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ValidationError("Choose a rating from 1 to 5.");
  }
  return rating;
}

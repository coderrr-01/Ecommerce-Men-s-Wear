import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function findReviewOrders(userId: string, productId: string) {
  return prisma.order.findMany({
    where: {
      userId,
      items: { some: { productId } },
    },
    select: {
      userId: true,
      status: true,
      deliveredAt: true,
      items: {
        where: { productId },
        select: { productId: true },
      },
    },
  });
}

export async function findExistingReview(userId: string, productId: string) {
  return prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { id: true, status: true },
  });
}

export async function createReviewRecord(
  userId: string,
  productId: string,
  data: { rating: number; title: string | null; comment: string | null },
  photos: { url: string; publicId: string }[],
) {
  return prisma.review.create({
    data: {
      userId,
      productId,
      ...data,
      isVerifiedPurchase: true,
      photos: { create: photos },
    },
    select: { id: true },
  });
}

export async function listReviewsForAdmin() {
  return prisma.review.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
      photos: { take: 3, select: { url: true } },
    },
  });
}

export async function setReviewStatus(id: string, status: "APPROVED" | "REJECTED") {
  return prisma.review.updateMany({
    where: { id, deletedAt: null },
    data: { status },
  });
}

export async function aggregateProductReviews(productId: string) {
  return prisma.review.aggregate({
    where: { productId, status: "APPROVED", deletedAt: null },
    _avg: { rating: true },
    _count: { _all: true },
  });
}

export async function createReviewSafely(
  userId: string,
  productId: string,
  data: { rating: number; title: string | null; comment: string | null },
  photos: { url: string; publicId: string }[],
) {
  try {
    return await createReviewRecord(userId, productId, data, photos);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }
    throw error;
  }
}

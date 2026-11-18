import "server-only";

import { prisma } from "@/lib/db";

export async function findCoupon(code: string) {
  return prisma.coupon.findFirst({
    where: { code: { equals: code, mode: "insensitive" }, deletedAt: null },
    select: {
      id: true,
      type: true,
      value: true,
      minOrderValue: true,
      maxDiscount: true,
      usageLimit: true,
      usedCount: true,
      perUserLimit: true,
      startsAt: true,
      expiresAt: true,
      isActive: true,
    },
  });
}

export async function listCoupons() {
  return prisma.coupon.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      minOrderValue: true,
      maxDiscount: true,
      usageLimit: true,
      usedCount: true,
      perUserLimit: true,
      startsAt: true,
      expiresAt: true,
      isActive: true,
    },
  });
}

export async function saveCoupon(input: {
  id?: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}) {
  const { id, ...data } = input;
  return id
    ? prisma.coupon.updateMany({ where: { id, deletedAt: null }, data })
    : prisma.coupon.create({ data, select: { id: true } });
}

export async function archiveCoupon(id: string) {
  return prisma.coupon.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), isActive: false },
  });
}

export async function customerCouponUses(couponId: string, customerKey: string) {
  return prisma.couponRedemption.count({ where: { couponId, customerKey } });
}

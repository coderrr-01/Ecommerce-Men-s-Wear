import "server-only";

import { prisma } from "@/lib/db";

export async function subscribeNewsletter(email: string, userId: string | null) {
  return prisma.newsletterSubscription.upsert({
    where: { email },
    create: { email, userId },
    update: {},
    select: { id: true },
  });
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  userId: string | null;
}) {
  return prisma.contactMessage.create({ data, select: { id: true } });
}

export async function listNewsletterSubscriptions() {
  return prisma.newsletterSubscription.findMany({
    orderBy: { createdAt: "desc" },
    select: { email: true, createdAt: true },
  });
}

export async function listContactMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { name: true, email: true, phone: true, subject: true, message: true, createdAt: true },
  });
}

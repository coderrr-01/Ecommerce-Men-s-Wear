import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl) throw new Error("E2E_DATABASE_URL is required.");

export const e2ePrisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

export interface E2EFixtures {
  key: string;
  slug: string;
  couponCode: string;
  orderNumbers: string[];
  customerEmail: string;
  adminEmail: string;
  password: string;
  variantId: string;
  initialStock: number;
}

export async function createE2EFixtures(): Promise<E2EFixtures> {
  const key = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const slug = `e2e-product-${key.toLowerCase()}`;
  const couponCode = `E2E${key}10`;
  const password = "E2eTest!2026";
  const customerEmail = `e2e-customer-${key.toLowerCase()}@example.test`;
  const adminEmail = `e2e-admin-${key.toLowerCase()}@example.test`;
  const passwordHash = await bcrypt.hash(password, 10);
  const category = await e2ePrisma.category.create({
    data: { name: `E2E ${key}`, slug: `e2e-category-${key.toLowerCase()}` },
  });
  const product = await e2ePrisma.product.create({
    data: {
      name: `E2E Shirt ${key}`,
      slug,
      description: "Test-only product fixture.",
      categoryId: category.id,
      basePrice: 250000,
      seoKeywords: [],
    },
  });
  const variant = await e2ePrisma.productVariant.create({
    data: {
      productId: product.id,
      sku: `E2E-${key}`,
      size: "M",
      color: "Black",
      price: 250000,
      stock: 20,
    },
  });
  await e2ePrisma.user.create({
    data: {
      email: customerEmail,
      name: `E2E Customer ${key}`,
      phone: "9876543210",
      passwordHash,
    },
  });
  await e2ePrisma.user.create({
    data: {
      email: adminEmail,
      name: `E2E Admin ${key}`,
      phone: "9876543211",
      passwordHash,
      role: "ADMIN",
    },
  });
  const otherCustomer = await e2ePrisma.user.create({
    data: {
      email: `e2e-other-${key.toLowerCase()}@example.test`,
      name: `E2E Other ${key}`,
      phone: "9876543212",
      passwordHash,
    },
  });
  const now = new Date();
  await e2ePrisma.coupon.create({
    data: {
      code: couponCode,
      type: "PERCENTAGE",
      value: 10,
      startsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  const isolationOrderNumber = `E2E-ISOLATION-${key}`;
  await e2ePrisma.order.create({
    data: {
      orderNumber: isolationOrderNumber,
      userId: otherCustomer.id,
      customerName: otherCustomer.name,
      customerPhone: otherCustomer.phone,
      status: "CONFIRMED",
      paymentMethod: "WHATSAPP",
      stockCommittedAt: now,
      subtotal: 10000,
      grandTotal: 10000,
      shippingAddress: {
        fullName: otherCustomer.name,
        phone: otherCustomer.phone,
        line1: "Test address",
        city: "Ahmedabad",
        state: "Gujarat",
        postalCode: "380001",
        country: "IN",
      },
      items: {
        create: {
          productId: product.id,
          productSlug: product.slug,
          variantId: variant.id,
          name: product.name,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: 10000,
          quantity: 1,
          total: 10000,
        },
      },
    },
  });
  return {
    key,
    slug,
    couponCode,
    orderNumbers: [isolationOrderNumber],
    customerEmail,
    adminEmail,
    password,
    variantId: variant.id,
    initialStock: 20,
  };
}

export async function cleanupE2EFixtures(fixtures: E2EFixtures) {
  await e2ePrisma.order.deleteMany({ where: { orderNumber: { in: fixtures.orderNumbers } } });
  await e2ePrisma.coupon.deleteMany({ where: { code: fixtures.couponCode } });
  await e2ePrisma.product.deleteMany({ where: { slug: fixtures.slug } });
  await e2ePrisma.category.deleteMany({
    where: { slug: `e2e-category-${fixtures.key.toLowerCase()}` },
  });
  await e2ePrisma.user.deleteMany({
    where: {
      email: {
        in: [
          fixtures.customerEmail,
          fixtures.adminEmail,
          `e2e-other-${fixtures.key.toLowerCase()}@example.test`,
        ],
      },
    },
  });
  await e2ePrisma.$disconnect();
}

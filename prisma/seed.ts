import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { seedCategories, seedProducts, seedSizeGuides, type SeedColor } from "./seed-data";

const prisma = new PrismaClient();

const DEMO_SEED = process.env.NODE_ENV !== "production";
const ALLOW_PROD_SEED = process.env.ALLOW_DEMO_SEED === "true";

const DEMO_ADMIN_PASSWORD = "Admin@12345";
const DEMO_CUSTOMER_PASSWORD = "Customer@12345";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@meridian.example";
const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ?? (DEMO_SEED ? DEMO_ADMIN_PASSWORD : undefined);
const CUSTOMER_EMAIL = process.env.SEED_CUSTOMER_EMAIL ?? "customer@meridian.example";
const CUSTOMER_PASSWORD =
  process.env.SEED_CUSTOMER_PASSWORD ?? (DEMO_SEED ? DEMO_CUSTOMER_PASSWORD : undefined);

function imageUrl(id: string): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;
}

function colorCode(color: SeedColor): string {
  return color.name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();
}

function buildVariants(productIndex: number, product: (typeof seedProducts)[number]) {
  return product.colors.flatMap((color, colorIndex) =>
    product.sizes.map((size, sizeIndex) => {
      const seedNumber = productIndex * 17 + colorIndex * 11 + sizeIndex * 5;
      const outOfStock = seedNumber % 37 === 0;

      return {
        sku: `MRD-${String(productIndex + 1).padStart(3, "0")}-${size}-${colorCode(color)}`,
        size,
        color: color.name,
        colorHex: color.hex,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        stock: outOfStock ? 0 : 4 + (seedNumber % 21),
      };
    }),
  );
}

async function seedUsers() {
  if (!ADMIN_PASSWORD || !CUSTOMER_PASSWORD) {
    throw new Error(
      "Seeding in production requires SEED_ADMIN_PASSWORD and SEED_CUSTOMER_PASSWORD.",
    );
  }
  if (!DEMO_SEED) {
    if (!ALLOW_PROD_SEED) {
      throw new Error(
        "Refusing to run demo seed in production. Set ALLOW_DEMO_SEED=true to override.",
      );
    }
    if (
      ADMIN_PASSWORD === DEMO_ADMIN_PASSWORD ||
      CUSTOMER_PASSWORD === DEMO_CUSTOMER_PASSWORD
    ) {
      throw new Error(
        "Refusing to seed production with the default demo credentials. Set SEED_ADMIN_PASSWORD and SEED_CUSTOMER_PASSWORD.",
      );
    }
  }

  const [adminHash, customerHash] = await Promise.all([
    bcrypt.hash(ADMIN_PASSWORD, 12),
    bcrypt.hash(CUSTOMER_PASSWORD, 12),
  ]);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Meridian Admin",
      role: "ADMIN",
      isActive: true,
      passwordHash: adminHash,
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Meridian Admin",
      role: "ADMIN",
      isActive: true,
      passwordHash: adminHash,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: {
      name: "Demo Customer",
      role: "CUSTOMER",
      isActive: true,
      passwordHash: customerHash,
    },
    create: {
      email: CUSTOMER_EMAIL,
      name: "Demo Customer",
      role: "CUSTOMER",
      isActive: true,
      passwordHash: customerHash,
      emailVerified: new Date(),
    },
  });
}

async function seedCatalog() {
  const categoryIds = new Map<string, string>();

  for (const [index, category] of seedCategories.entries()) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: imageUrl(category.imageId),
        sortOrder: index,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: imageUrl(category.imageId),
        sortOrder: index,
        isActive: true,
      },
    });
    categoryIds.set(category.slug, record.id);
  }

  for (const [index, product] of seedProducts.entries()) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown seed category: ${product.categorySlug}`);
    }

    const variants = buildVariants(index, product);
    const images = product.imageIds.map((id, imageIndex) => ({
      id: `seed-image-${product.slug}-${imageIndex}`,
      url: imageUrl(id),
      altText: `${product.name} — view ${imageIndex + 1}`,
      sortOrder: imageIndex,
      isPrimary: imageIndex === 0,
    }));

    const data = {
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      brand: product.brand,
      fabric: product.fabric,
      fit: product.fit,
      occasion: product.occasion,
      categoryId,
      basePrice: product.price,
      gender: "MEN" as const,
      isActive: true,
      isFeatured: product.isFeatured,
      seoTitle: `${product.name} | Meridian`,
      seoDescription: product.shortDescription,
      seoKeywords: [
        product.name.toLowerCase(),
        product.categorySlug,
        product.fit.toLowerCase(),
        "menswear",
      ],
    };

    await prisma.$transaction(
      async (tx) => {
        const record = await tx.product.upsert({
          where: { slug: product.slug },
          update: data,
          create: { slug: product.slug, ...data },
        });

        for (const image of images) {
          const { id, ...imageData } = image;
          await tx.productImage.upsert({
            where: { id },
            update: { ...imageData, deletedAt: null },
            create: { id, ...imageData, productId: record.id },
          });
        }

        for (const variant of variants) {
          const { sku, ...variantData } = variant;
          await tx.productVariant.upsert({
            where: { sku },
            update: { ...variantData, isActive: true, deletedAt: null },
            create: { sku, ...variantData, productId: record.id, isActive: true },
          });
        }

        await tx.productImage.deleteMany({
          where: {
            productId: record.id,
            id: {
              startsWith: `seed-image-${product.slug}-`,
              notIn: images.map((image) => image.id),
            },
          },
        });

        await tx.productVariant.updateMany({
          where: {
            productId: record.id,
            sku: {
              startsWith: `MRD-${String(index + 1).padStart(3, "0")}-`,
              notIn: variants.map((variant) => variant.sku),
            },
          },
          data: { isActive: false, stock: 0 },
        });
      },
      { timeout: 30_000 },
    );
  }

  for (const guide of seedSizeGuides) {
    const categoryId = categoryIds.get(guide.categorySlug) ?? null;
    const data = {
      name: guide.name,
      categoryId,
      content: guide.content as Prisma.InputJsonValue,
      isActive: true,
    };

    await prisma.sizeGuide.upsert({
      where: { slug: guide.slug },
      update: data,
      create: { slug: guide.slug, ...data },
    });
  }
}

async function seedStoreContent() {
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Meridian",
      supportEmail: "care@meridian.example",
      supportPhone: "+91 98765 43210",
      currency: "INR",
      taxRateBps: 500,
      pricesIncludeTax: true,
      freeShippingThreshold: 149900,
      standardShippingFee: 9900,
      codFee: 4900,
      returnWindowDays: 14,
      codEnabled: true,
      onlinePaymentEnabled: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: 199900,
      maxDiscount: 50000,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FESTIVE500" },
    update: {},
    create: {
      code: "FESTIVE500",
      description: "₹500 off orders above ₹3,999",
      type: "FIXED",
      value: 50000,
      minOrderValue: 399900,
      usageLimit: 500,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: "seed-hero" },
    update: {
      title: "The Winter Edit",
      subtitle: "Wool overcoats, field jackets and layered knits.",
      imageUrl: imageUrl("1544022613-e87ca75a784a"),
      ctaLabel: "Shop outerwear",
      ctaHref: "/categories/outerwear",
      placement: "HOME_HERO",
      sortOrder: 0,
      isActive: true,
    },
    create: {
      id: "seed-hero",
      title: "The Winter Edit",
      subtitle: "Wool overcoats, field jackets and layered knits.",
      imageUrl: imageUrl("1544022613-e87ca75a784a"),
      ctaLabel: "Shop outerwear",
      ctaHref: "/categories/outerwear",
      placement: "HOME_HERO",
      sortOrder: 0,
      isActive: true,
    },
  });
}

async function main() {
  await seedUsers();
  await seedCatalog();
  await seedStoreContent();

  const [categories, products, variants, images, admin, customer] = await Promise.all([
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.productVariant.count({ where: { deletedAt: null } }),
    prisma.productImage.count({ where: { deletedAt: null } }),
    prisma.user.findFirst({
      where: { email: ADMIN_EMAIL, role: "ADMIN", deletedAt: null },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { email: CUSTOMER_EMAIL, role: "CUSTOMER", deletedAt: null },
      select: { id: true },
    }),
  ]);

  console.log(
    `Seeded ${categories} categories, ${products} products, ${variants} variants, ${images} images, ${admin ? 1 : 0} admin, ${customer ? 1 : 0} customer.`,
  );
  console.log(`Admin sign-in: ${ADMIN_EMAIL}`);
}

async function run() {
  try {
    await main();
  } catch (error) {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }

  await prisma.$disconnect();
}

void run();

import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [users, categories, products, variants, images, featured, admins, customers] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.productImage.count(),
      prisma.product.count({ where: { isFeatured: true, isActive: true, deletedAt: null } }),
      prisma.user.count({ where: { role: "ADMIN", deletedAt: null, isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null, isActive: true } }),
    ]);

  const seededAdmin = await prisma.user.findUnique({
    where: { email: "admin@meridian.example" },
    select: { email: true, role: true, isActive: true },
  });
  const seededCustomer = await prisma.user.findUnique({
    where: { email: "customer@meridian.example" },
    select: { email: true, role: true, isActive: true },
  });

  console.log(
    JSON.stringify(
      {
        users,
        categories,
        products,
        variants,
        images,
        featured,
        admins,
        customers,
        seededAdmin,
        seededCustomer,
      },
      null,
      2,
    ),
  );
}

main().finally(async () => {
  await prisma.$disconnect();
});

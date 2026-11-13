import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { emailSchema, passwordSchema } from "../src/features/auth/schemas/auth.schema";

const prisma = new PrismaClient();
const nameSchema = z.string().trim().min(2, "Enter a name.").max(80, "Name is too long.");

function printUsage() {
  console.error("Usage: pnpm admin:create -- <email> <password> <name>");
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");

  if (args.length < 3) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const email = emailSchema.parse(args[0]);
  const password = passwordSchema.parse(args[1]);
  const name = nameSchema.parse(args[2]);
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        passwordHash,
        role: "ADMIN",
        isActive: true,
        deletedAt: null,
        emailVerified: new Date(),
      },
    });
    console.log(`Promoted existing user to ADMIN: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log(`Created ADMIN user: ${email}`);
}

main()
  .catch((error) => {
    console.error("Failed to create admin:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

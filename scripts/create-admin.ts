import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { emailSchema, passwordSchema } from "../src/features/auth/schemas/auth.schema";
import { siteConfig } from "../src/config/site.config";

const prisma = new PrismaClient();
const nameSchema = z.string().trim().min(2, "Enter a name.").max(80, "Name is too long.");

function printUsage() {
  console.error("Usage: pnpm admin:create -- <email> <password> <name> [--disable-demo]");
}

async function main() {
  const rawArgs = process.argv.slice(2).filter((arg) => arg !== "--");
  const disableDemo = rawArgs.includes("--disable-demo");
  const args = rawArgs.filter((arg) => arg !== "--disable-demo");

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

  const admin = existing
    ? await prisma.user.update({
        where: { email },
        data: {
          name,
          passwordHash,
          role: "ADMIN",
          isActive: true,
          deletedAt: null,
          emailVerified: new Date(),
          sessionVersion: { increment: 1 },
          forcePasswordChange: false,
        },
        select: { id: true },
      })
    : await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: "ADMIN",
          isActive: true,
          emailVerified: new Date(),
          forcePasswordChange: false,
        },
        select: { id: true },
      });

  await prisma.adminAuditLog.create({
    data: {
      actorId: admin.id,
      action: existing ? "admin.account.update" : "admin.account.create",
      entityType: "user",
      entityId: admin.id,
    },
  });

  if (disableDemo && email !== siteConfig.seed.adminEmail) {
    const disabled = await prisma.user.updateMany({
      where: { email: siteConfig.seed.adminEmail, role: "ADMIN", isActive: true },
      data: { isActive: false, sessionVersion: { increment: 1 } },
    });
    if (disabled.count) {
      await prisma.adminAuditLog.create({
        data: {
          actorId: admin.id,
          action: "admin.demo.disable",
          entityType: "user",
          details: { affected: disabled.count },
        },
      });
    }
  }

  if (existing) {
    console.log("Updated existing account as ADMIN.");
    return;
  }
  console.log("Created ADMIN account.");
}

main()
  .catch((error) => {
    console.error("Failed to create admin:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

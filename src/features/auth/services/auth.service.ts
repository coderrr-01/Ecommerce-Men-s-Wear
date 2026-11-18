import "server-only";

import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { LoginInput, RegisterInput } from "@/features/auth/schemas/auth.schema";
import { clearRateLimit, enforceRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";

const DUMMY_HASH = "$2b$12$WxsM6Lh4NSKyHhxLW10rzOL5advyljMBtHwmY2vMcODKc8K7gVTJi";

export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  sessionVersion: number;
  forcePasswordChange: boolean;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function verifyCredentials(
  input: LoginInput,
  ipAddress: string,
): Promise<AuthenticatedUser | null> {
  const identity = `${input.email}:${ipAddress}`;
  try {
    await enforceRateLimit("login", identity, 5, LOGIN_WINDOW_MS, {
      failureMode: "closed",
    });
  } catch {
    logger.warn("auth.login_throttled", { reason: "limited_or_limiter_unavailable" });
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: input.email,
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      passwordHash: true,
      sessionVersion: true,
      forcePasswordChange: true,
    },
  });

  const passwordMatches = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.passwordHash || !passwordMatches) {
    return null;
  }

  try {
    await clearRateLimit("login", identity, LOGIN_WINDOW_MS);
  } catch {
    logger.warn("auth.login_counter_clear_failed", { reason: "storage_unavailable" });
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    sessionVersion: user.sessionVersion,
    forcePasswordChange: user.forcePasswordChange,
  };
}

export async function registerCustomer(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return;
    throw error;
  }
}

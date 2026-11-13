import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const getSession = cache(async () => auth());

/**
 * Reads the signed-in user from the database so deactivated, deleted or
 * role-changed accounts lose access immediately instead of at token expiry.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
});

export async function requireUser(redirectTo = "/account") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}

export async function requireRole(roles: readonly Role[], redirectTo = "/admin") {
  const user = await requireUser(redirectTo);

  if (!roles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

export function hasRole(user: { role: Role } | null | undefined, roles: readonly Role[]): boolean {
  return Boolean(user && roles.includes(user.role));
}

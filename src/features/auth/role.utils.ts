import type { Role } from "@prisma/client";

export function hasRole(
  user: { role: Role } | null | undefined,
  roles: readonly Role[],
): boolean {
  return Boolean(user && roles.includes(user.role));
}

import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function insertAdminAuditLog(input: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Prisma.InputJsonObject;
}) {
  await prisma.adminAuditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
    },
  });
}

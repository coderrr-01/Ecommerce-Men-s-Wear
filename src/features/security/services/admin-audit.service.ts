import "server-only";

import { insertAdminAuditLog } from "@/features/security/repositories/admin-audit.repository";

export function recordAdminAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, string | number | boolean | null>,
) {
  return insertAdminAuditLog({
    actorId,
    action,
    entityType,
    entityId,
    details,
  });
}

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(ADMIN_ROLES);

  return (
    <AdminShell userName={user.name ?? user.email}>{children}</AdminShell>
  );
}

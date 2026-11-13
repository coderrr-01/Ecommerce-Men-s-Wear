import { ModulePlaceholder } from "@/features/admin-dashboard/components/module-placeholder";
import { requireRole } from "@/features/auth/services/session.service";

export default async function AdminCustomersPage() {
  await requireRole(["ADMIN"]);

  return (
    <ModulePlaceholder
      title="Customers"
      description="Support customers and understand purchasing behaviour."
      items={[
        "Customer profiles, addresses and order history",
        "Account activation and role management",
        "Exportable customer lists for care and marketing",
      ]}
    />
  );
}

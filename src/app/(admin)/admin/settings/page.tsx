import { ModulePlaceholder } from "@/features/admin-dashboard/components/module-placeholder";
import { requireRole } from "@/features/auth/services/session.service";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);

  return (
    <ModulePlaceholder
      title="Settings"
      description="Control store defaults for tax, shipping, payments and contact details."
      items={[
        "Store profile and support contact information",
        "Shipping thresholds, COD and return windows",
        "Provider configuration and operational preferences",
      ]}
    />
  );
}

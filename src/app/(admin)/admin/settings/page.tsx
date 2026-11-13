import { ModulePlaceholder } from "@/features/admin-dashboard/components/module-placeholder";

export default function AdminSettingsPage() {
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

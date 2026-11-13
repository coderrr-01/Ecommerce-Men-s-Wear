import { ModulePlaceholder } from "@/features/admin-dashboard/components/module-placeholder";

export default function AdminCustomersPage() {
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

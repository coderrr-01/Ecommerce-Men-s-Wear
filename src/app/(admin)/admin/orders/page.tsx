import { ModulePlaceholder } from "@/features/admin-dashboard/components/module-placeholder";

export default function AdminOrdersPage() {
  return (
    <ModulePlaceholder
      title="Orders"
      description="Review incoming orders, manage fulfilment and handle returns."
      items={[
        "Status workflow from pending to delivered",
        "Payment and refund visibility",
        "Packing slips, invoices and customer communication",
      ]}
    />
  );
}

import { ModulePlaceholder } from "@/features/admin-dashboard/components/module-placeholder";

export default function AdminInventoryPage() {
  return (
    <ModulePlaceholder
      title="Inventory"
      description="Monitor stock levels across sizes and colours, and adjust quantities safely."
      items={[
        "Low-stock and sold-out reporting",
        "Auditable stock adjustments",
        "Transactional stock decrement at order placement",
      ]}
    />
  );
}

import { ModulePlaceholder } from "@/features/admin-dashboard/components/module-placeholder";

export default function AdminProductsPage() {
  return (
    <ModulePlaceholder
      title="Products"
      description="Create and maintain the menswear catalogue, variants, pricing and imagery."
      items={[
        "Product and variant CRUD with soft deletes",
        "SEO fields, media ordering and category assignment",
        "Draft, active and archived product states",
      ]}
    />
  );
}

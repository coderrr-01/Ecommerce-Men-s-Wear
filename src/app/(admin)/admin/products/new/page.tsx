import { ProductForm } from "@/features/catalog/components/product-form";
import { getProductFormData } from "@/features/catalog/services/product-admin.service";

export const dynamic = "force-dynamic";

export default async function NewAdminProductPage() {
  const { categories } = await getProductFormData();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Catalogue</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">New product</h1>
      </header>
      <ProductForm categories={categories} />
    </div>
  );
}

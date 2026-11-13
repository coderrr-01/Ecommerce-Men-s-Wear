import { notFound } from "next/navigation";

import { ProductForm } from "@/features/catalog/components/product-form";
import { getProductFormData } from "@/features/catalog/services/product-admin.service";

export const dynamic = "force-dynamic";

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProductFormData(id);
  if (!result.product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Catalogue</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Edit {result.product.name}</h1>
      </header>
      <ProductForm categories={result.categories} product={result.product} />
    </div>
  );
}

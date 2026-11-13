import { notFound } from "next/navigation";

import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import { ProductImageManager } from "@/features/catalog/components/product-image-manager";
import { ProductForm } from "@/features/catalog/components/product-form";
import { getProductImageData } from "@/features/catalog/services/product-image.service";
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
  const [images, user] = await Promise.all([
    getProductImageData(id),
    requireRole(ADMIN_ROLES),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Catalogue</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Edit {result.product.name}</h1>
      </header>
      <ProductForm categories={result.categories} product={result.product} />
      <ProductImageManager
        productId={id}
        productName={images.productName}
        initialImages={images.images}
        storageConfigured={images.storageConfigured}
        canDeleteImages={user.role === "ADMIN"}
      />
    </div>
  );
}

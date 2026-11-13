"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProductGeneralFields } from "@/features/catalog/components/product-general-fields";
import { ProductSeoFields } from "@/features/catalog/components/product-seo-fields";
import { ProductVariantEditor } from "@/features/catalog/components/product-variant-editor";
import {
  checkProductSlugAction,
  saveProductAction,
} from "@/features/catalog/actions/product-admin.actions";
import { PRODUCT_SIZE_TYPES, suggestSku } from "@/features/catalog/product.utils";
import { productSchema, type ProductFormInput } from "@/features/catalog/schemas/product.schema";
import type { AdminProductFormData } from "@/features/catalog/types";

function defaultValues(product?: AdminProductFormData): ProductFormInput {
  if (product) return product;
  const sizeType = PRODUCT_SIZE_TYPES[0];
  const size = "S";
  const color = "Black";
  return {
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    brand: "",
    categoryId: "",
    fabric: "",
    fit: "Regular",
    occasion: "Casual",
    careInstructions: "",
    seoTitle: "",
    seoDescription: "",
    isFeatured: false,
    isNewArrival: false,
    status: "draft",
    sizeType,
    variants: [
      {
        sku: suggestSku("PRODUCT", size, color),
        size,
        color,
        colorHex: "",
        price: "",
        compareAtPrice: "",
        stock: 0,
      },
    ],
  };
}

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: AdminProductFormData;
}) {
  const router = useRouter();
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues(product),
  });
  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { isDirty, isSubmitting },
  } = form;

  useEffect(() => {
    if (!isDirty || isSubmitting) return;
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [isDirty, isSubmitting]);

  async function checkSlug(slug: string) {
    if (!slug) return;
    const response = await checkProductSlugAction({ slug, id: product?.id });
    if (!response.success) {
      toast.error(response.error.message);
    } else if (!response.data.available) {
      setError("slug", { type: "validate", message: "That slug is already in use." });
    } else {
      clearErrors("slug");
    }
  }

  async function save(values: ProductFormInput) {
    const response = await saveProductAction(values);
    if (!response.success) {
      toast.error(response.error.message);
      return;
    }
    toast.success(product ? "Product updated." : "Product created.");
    if (!product) {
      router.push(`/admin/products/${response.data.id}/edit?tab=images`);
    } else {
      router.refresh();
    }
  }

  function cancel() {
    if (isDirty && !window.confirm("Discard your unsaved product changes?")) return;
    router.push("/admin/products");
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(save)} className="space-y-5">
        <ProductGeneralFields
          categories={categories}
          slugEdited={slugEdited}
          setSlugEdited={setSlugEdited}
          onSlugBlur={(slug) => void checkSlug(slug)}
        />
        <ProductVariantEditor />
        <ProductSeoFields />
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-1 py-4 backdrop-blur">
          {product ? (
            <Button asChild variant="outline">
              <Link href={`/admin/products/${product.id}/edit?tab=images`}>
                Manage images ({product.imageCount})
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={cancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : product ? "Save changes" : "Create product"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

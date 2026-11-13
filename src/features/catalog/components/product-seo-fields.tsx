"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductFormInput } from "@/features/catalog/schemas/product.schema";

export function ProductSeoFields() {
  const { register } = useFormContext<ProductFormInput>();

  return (
    <section className="space-y-4 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="font-serif text-xl">Search metadata</h2>
        <p className="mt-1 text-sm text-muted-foreground">Optional fields for search previews.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="product-seo-title">SEO title</Label>
          <Input id="product-seo-title" {...register("seoTitle")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-seo-description">SEO description</Label>
          <textarea
            id="product-seo-description"
            {...register("seoDescription")}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </section>
  );
}

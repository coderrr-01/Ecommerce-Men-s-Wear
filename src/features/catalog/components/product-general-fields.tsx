"use client";

import type { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSlug } from "@/features/catalog/category.utils";
import type { ProductFormInput } from "@/features/catalog/schemas/product.schema";

interface ProductGeneralFieldsProps {
  categories: { id: string; name: string }[];
  slugEdited: boolean;
  setSlugEdited: Dispatch<SetStateAction<boolean>>;
  onSlugBlur(slug: string): void;
}

export function ProductGeneralFields({
  categories,
  slugEdited,
  setSlugEdited,
  onSlugBlur,
}: ProductGeneralFieldsProps) {
  const { register, setValue, formState } = useFormContext<ProductFormInput>();
  const errors = formState.errors;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="font-serif text-xl">Product details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Core content, merchandising and visibility.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="product-name">Name</Label>
          <Input
            id="product-name"
            {...register("name", {
              onChange: (event) => {
                if (!slugEdited) {
                  setValue("slug", generateSlug(event.target.value), { shouldDirty: true });
                }
              },
            })}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="text-xs text-danger">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-slug">Slug</Label>
          <Input
            id="product-slug"
            {...register("slug", {
              onChange: () => setSlugEdited(true),
              onBlur: (event) => onSlugBlur(event.target.value),
            })}
            aria-invalid={Boolean(errors.slug)}
          />
          {errors.slug ? <p className="text-xs text-danger">{errors.slug.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-category">Category</Label>
          <select
            id="product-category"
            {...register("categoryId")}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <p className="text-xs text-danger">{errors.categoryId.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-brand">Brand</Label>
          <Input id="product-brand" {...register("brand")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-fabric">Fabric</Label>
          <Input id="product-fabric" {...register("fabric")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-fit">Fit</Label>
          <select
            id="product-fit"
            {...register("fit")}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            {["Slim", "Regular", "Relaxed"].map((fit) => (
              <option key={fit}>{fit}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-occasion">Occasion</Label>
          <select
            id="product-occasion"
            {...register("occasion")}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            {["Casual", "Formal", "Party", "Ethnic"].map((occasion) => (
              <option key={occasion}>{occasion}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-size-type">Size set</Label>
          <select
            id="product-size-type"
            {...register("sizeType")}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="TOPS">Tops (S–XXL)</option>
            <option value="BOTTOMS">Bottoms (28–42)</option>
            <option value="FOOTWEAR">Footwear (UK 6–12)</option>
            <option value="FREE_SIZE">Free size</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-status">Status</Label>
          <select
            id="product-status"
            {...register("status")}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="product-short-description">Short description</Label>
          <textarea
            id="product-short-description"
            {...register("shortDescription")}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-care">Care instructions</Label>
          <textarea
            id="product-care"
            {...register("careInstructions")}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="product-description">Full description</Label>
        <textarea
          id="product-description"
          {...register("description")}
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description ? (
          <p className="text-xs text-danger">{errors.description.message}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isFeatured")} className="size-4 accent-primary" />
          Featured product
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isNewArrival")} className="size-4 accent-primary" />
          New arrival
        </label>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/catalog/actions/category.actions";
import { generateSlug } from "@/features/catalog/category.utils";
import { categorySchema, type CategoryInput } from "@/features/catalog/schemas/category.schema";
import type { AdminCategoryRow } from "@/features/catalog/types";

interface CategoryFormProps {
  categories: AdminCategoryRow[];
  category?: AdminCategoryRow;
  onComplete(): void;
  onCancel(): void;
}

export function CategoryForm({ categories, category, onComplete, onCancel }: CategoryFormProps) {
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category?.id,
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      imageUrl: category?.imageUrl ?? "",
      parentId: category?.parentId ?? "",
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder ?? 0,
    },
  });
  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!slugEdited) setValue("slug", generateSlug(name ?? ""), { shouldValidate: true });
  }, [name, setValue, slugEdited]);

  async function submit(data: CategoryInput) {
    const response = category ? await updateCategoryAction(data) : await createCategoryAction(data);
    if (!response.success) {
      toast.error(response.error.message);
      return;
    }

    toast.success(category ? "Category updated." : "Category created.");
    onComplete();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="font-serif text-xl">{category ? "Edit category" : "Add category"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize the catalogue into a browsable category tree.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category-name">Name</Label>
          <Input id="category-name" {...register("name")} aria-invalid={Boolean(errors.name)} />
          {errors.name ? <p className="text-xs text-danger">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category-slug">Slug</Label>
          <Input
            id="category-slug"
            {...register("slug", { onChange: () => setSlugEdited(true) })}
            aria-invalid={Boolean(errors.slug)}
          />
          {errors.slug ? <p className="text-xs text-danger">{errors.slug.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category-parent">Parent category</Label>
          <select
            id="category-parent"
            {...register("parentId")}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">No parent</option>
            {categories
              .filter((option) => option.id !== category?.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {`${"— ".repeat(option.depth)}${option.name}`}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category-image">Image URL</Label>
          <Input id="category-image" type="url" {...register("imageUrl")} />
          {errors.imageUrl ? (
            <p className="text-xs text-danger">{errors.imageUrl.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category-order">Sort order</Label>
          <Input
            id="category-order"
            type="number"
            min="0"
            {...register("sortOrder", { valueAsNumber: true })}
          />
          {errors.sortOrder ? (
            <p className="text-xs text-danger">{errors.sortOrder.message}</p>
          ) : null}
        </div>
        <label className="flex items-center gap-2 self-end pb-3 text-sm">
          <input type="checkbox" {...register("isActive")} className="size-4 accent-primary" />
          Active in the storefront
        </label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category-description">Description</Label>
        <textarea
          id="category-description"
          {...register("description")}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.description ? (
          <p className="text-xs text-danger">{errors.description.message}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : category ? "Save category" : "Create category"}
        </Button>
        {category ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

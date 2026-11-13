"use client";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteCategoryAction } from "@/features/catalog/actions/category.actions";
import type { AdminCategoryRow } from "@/features/catalog/types";

export function CategoryTable({
  categories,
  isAdmin,
  onEdit,
}: {
  categories: AdminCategoryRow[];
  isAdmin: boolean;
  onEdit(category: AdminCategoryRow): void;
}) {
  async function remove(category: AdminCategoryRow) {
    if (!window.confirm(`Delete “${category.name}”? This cannot be undone.`)) return;
    const response = await deleteCategoryAction(category.id);
    if (!response.success) {
      toast.error(response.error.message);
      return;
    }
    toast.success("Category deleted.");
    window.location.reload();
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
        <h2 className="font-medium">No categories yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Create a category to organize products.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-secondary/60 text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Slug</th>
            <th scope="col" className="px-4 py-3">Products</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((category) => (
            <tr key={category.id}>
              <th scope="row" className="px-4 py-3 font-medium">
                <span style={{ paddingInlineStart: `${category.depth * 20}px` }}>
                  {category.name}
                </span>
              </th>
              <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
              <td className="px-4 py-3">{category.productCount}</td>
              <td className="px-4 py-3">
                <Badge variant={category.isActive ? "secondary" : "outline"}>
                  {category.isActive ? "Active" : "Hidden"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(category)}>
                    Edit
                  </Button>
                  {isAdmin ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => void remove(category)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CategoryForm } from "@/features/catalog/components/category-form";
import { CategoryTable } from "@/features/catalog/components/category-table";
import type { AdminCategoryRow } from "@/features/catalog/types";

export function CategoryManager({
  categories,
  isAdmin,
}: {
  categories: AdminCategoryRow[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminCategoryRow | undefined>();

  function refresh() {
    setEditing(undefined);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <CategoryForm
        key={editing?.id ?? "new-category"}
        categories={categories}
        category={editing}
        onComplete={refresh}
        onCancel={() => setEditing(undefined)}
      />
      <CategoryTable categories={categories} isAdmin={isAdmin} onEdit={setEditing} />
    </div>
  );
}

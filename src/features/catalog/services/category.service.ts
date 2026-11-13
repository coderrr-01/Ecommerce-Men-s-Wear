import "server-only";

import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import {
  createCategory,
  findCategoryById,
  isCategorySlugTaken,
  listAdminCategories,
  softDeleteCategoryIfEmpty,
  updateCategory,
} from "@/features/catalog/repositories/category.repository";
import { assertCategoryDeletable } from "@/features/catalog/category.utils";
import type { ParsedCategoryInput } from "@/features/catalog/schemas/category.schema";
import type { AdminCategoryRow } from "@/features/catalog/types";

function categoryFields(data: ParsedCategoryInput) {
  const { name, slug, description, imageUrl, parentId, isActive, sortOrder } = data;
  return {
    name,
    slug,
    description,
    imageUrl: imageUrl || null,
    parentId: parentId || null,
    isActive,
    sortOrder,
  };
}

export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const categories = await listAdminCategories();
  const parentMap = new Map(categories.map((category) => [category.id, category.parentId]));

  return categories.map(({ _count, ...category }) => {
    let depth = 0;
    let parentId = category.parentId;
    const visited = new Set([category.id]);
    while (parentId && parentMap.has(parentId) && !visited.has(parentId)) {
      visited.add(parentId);
      depth += 1;
      parentId = parentMap.get(parentId) ?? null;
    }

    return {
      ...category,
      depth,
      productCount: _count.products,
      childCount: _count.children,
    };
  });
}

async function validateCategoryInput(data: ParsedCategoryInput, id?: string) {
  if (await isCategorySlugTaken(data.slug, id)) {
    throw new ConflictError("That category slug is already in use.");
  }

  if (!data.parentId) return;
  if (data.parentId === id) throw new ValidationError("A category cannot be its own parent.");

  const [parent, all] = await Promise.all([findCategoryById(data.parentId), listAdminCategories()]);
  if (!parent?.isActive) throw new ValidationError("Choose an active parent category.");
  if (!id) return;

  const parentMap = new Map(all.map((category) => [category.id, category.parentId]));
  let ancestor: string | null = data.parentId;
  while (ancestor) {
    if (ancestor === id) throw new ValidationError("A category cannot be nested inside its child.");
    ancestor = parentMap.get(ancestor) ?? null;
  }
}

export async function createAdminCategory(data: ParsedCategoryInput) {
  await validateCategoryInput(data);
  return createCategory(categoryFields(data));
}

export async function updateAdminCategory(id: string, data: ParsedCategoryInput) {
  if (!(await findCategoryById(id))) throw new NotFoundError("Category");
  await validateCategoryInput(data, id);

  const result = await updateCategory(id, categoryFields(data));
  if (result.count === 0) throw new NotFoundError("Category");
  return { id };
}

export async function deleteAdminCategory(id: string) {
  const result = await softDeleteCategoryIfEmpty(id);
  if (!result.found) throw new NotFoundError("Category");
  assertCategoryDeletable(result.productCount, result.childCount);
  return { id };
}

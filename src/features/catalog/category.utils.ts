import { ConflictError } from "@/lib/errors";

export function generateSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function assertCategoryDeletable(productCount: number, childCount: number): void {
  if (productCount > 0 || childCount > 0) {
    const blockers = [
      productCount > 0 ? `${productCount} product${productCount === 1 ? "" : "s"}` : null,
      childCount > 0 ? `${childCount} child categor${childCount === 1 ? "y" : "ies"}` : null,
    ].filter(Boolean);

    throw new ConflictError(`This category still has ${blockers.join(" and ")}.`);
  }
}

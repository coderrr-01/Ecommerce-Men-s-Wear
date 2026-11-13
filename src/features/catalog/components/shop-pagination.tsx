import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CatalogQuery } from "@/features/catalog/types";
import { buildCatalogHref } from "@/features/catalog/utils";

interface ShopPaginationProps {
  query: CatalogQuery;
  totalPages: number;
}

export function ShopPagination({ query, totalPages }: ShopPaginationProps) {
  if (totalPages <= 1) return null;

  const previousHref = query.page > 1 ? buildCatalogHref({ ...query, page: query.page - 1 }) : null;
  const nextHref =
    query.page < totalPages ? buildCatalogHref({ ...query, page: query.page + 1 }) : null;

  return (
    <nav
      aria-label="Product pagination"
      className="mt-12 flex items-center justify-between border-t border-border pt-6"
    >
      {previousHref ? (
        <Button asChild variant="outline" size="sm">
          <Link href={previousHref}>Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        Page {query.page} of {totalPages}
      </p>

      {nextHref ? (
        <Button asChild variant="outline" size="sm">
          <Link href={nextHref}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}

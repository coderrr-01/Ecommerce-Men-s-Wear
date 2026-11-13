import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductListQuery } from "@/features/catalog/schemas/product.schema";

export function ProductListFilters({
  query,
  categories,
}: {
  query: ProductListQuery;
  categories: { id: string; name: string }[];
}) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-lg border border-border bg-background p-4 md:grid-cols-4 xl:grid-cols-7"
    >
      <Input
        name="q"
        defaultValue={query.q}
        placeholder="Search name or SKU"
        aria-label="Search products by name or SKU"
        className="md:col-span-2"
      />
      <select
        name="category"
        defaultValue={query.category}
        aria-label="Category"
        className="h-11 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={query.status}
        aria-label="Status"
        className="h-11 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
      </select>
      <select
        name="featured"
        defaultValue={query.featured}
        aria-label="Featured"
        className="h-11 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="all">All merchandising</option>
        <option value="yes">Featured</option>
        <option value="no">Not featured</option>
      </select>
      <select
        name="stock"
        defaultValue={query.stock}
        aria-label="Stock state"
        className="h-11 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="all">All stock</option>
        <option value="in">In stock</option>
        <option value="low">Low stock</option>
        <option value="out">Out of stock</option>
      </select>
      <select
        name="sort"
        defaultValue={query.sort}
        aria-label="Sort products"
        className="h-11 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="name-asc">Name A–Z</option>
        <option value="name-desc">Name Z–A</option>
        <option value="price-asc">Price low to high</option>
        <option value="price-desc">Price high to low</option>
      </select>
      <input type="hidden" name="page" value="1" />
      <div className="flex gap-2 md:col-span-4 xl:col-span-7">
        <Button type="submit">Apply filters</Button>
        <Button asChild type="button" variant="outline">
          <a href="/admin/products">Clear</a>
        </Button>
      </div>
    </form>
  );
}

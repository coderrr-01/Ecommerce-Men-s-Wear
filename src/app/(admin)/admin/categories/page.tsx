import { CategoryManager } from "@/features/catalog/components/category-manager";
import { getAdminCategories } from "@/features/catalog/services/category.service";
import { requireRole } from "@/features/auth/services/session.service";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [user, categories] = await Promise.all([
    requireRole(["ADMIN", "STAFF"]),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Catalogue</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintain the product taxonomy, visibility, and category imagery.
        </p>
      </header>
      <CategoryManager categories={categories} isAdmin={user.role === "ADMIN"} />
    </div>
  );
}

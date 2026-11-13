import "server-only";

import { getDashboardMetrics } from "@/features/admin-dashboard/repositories/dashboard.repository";

export async function getAdminDashboard() {
  const metrics = await getDashboardMetrics();

  return {
    ...metrics,
    cards: [
      {
        label: "Total products",
        value: metrics.products,
        href: "/admin/products",
        note: "Active and draft catalog items",
      },
      {
        label: "Active products",
        value: metrics.activeProducts,
        href: "/admin/products",
        note: "Visible in the storefront",
      },
      {
        label: "Draft products",
        value: metrics.draftProducts,
        href: "/admin/products?status=draft",
        note: "Not visible in the storefront",
      },
      {
        label: "Total variants",
        value: metrics.variants,
        href: "/admin/inventory",
        note: "Non-deleted catalog variants",
      },
      {
        label: "Orders",
        value: metrics.orders,
        href: "/admin/orders",
        note: "Orders recorded in the store",
      },
      {
        label: "Customers",
        value: metrics.customers,
        href: "/admin/customers",
        note: "Registered customer accounts",
      },
      {
        label: "Low stock variants",
        value: metrics.lowStock,
        href: "/admin/inventory",
        note: `${metrics.lowStockThreshold} units or fewer, excluding out of stock`,
      },
      {
        label: "Out of stock",
        value: metrics.outOfStock,
        href: "/admin/inventory?state=out",
        note: "Variants with no units available",
      },
    ],
  };
}

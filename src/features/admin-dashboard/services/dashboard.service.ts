import "server-only";

import { getDashboardMetrics } from "@/features/admin-dashboard/repositories/dashboard.repository";

export async function getAdminDashboard() {
  const metrics = await getDashboardMetrics();

  return {
    ...metrics,
    cards: [
      {
        label: "Active products",
        value: metrics.products,
        href: "/admin/products",
      },
      {
        label: "Orders",
        value: metrics.orders,
        href: "/admin/orders",
      },
      {
        label: "Customers",
        value: metrics.customers,
        href: "/admin/customers",
      },
      {
        label: "Low stock variants",
        value: metrics.lowStock,
        href: "/admin/inventory",
      },
    ],
  };
}

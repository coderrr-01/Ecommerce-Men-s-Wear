import { Button } from "@/components/ui/button";
import { OrderAdminDetailsControl } from "@/features/orders/components/order-admin-details-control";
import { OrderStatusControl } from "@/features/orders/components/order-status-control";
import { buildOrderStatusChatUrl } from "@/features/orders/utils";
import type { AdminOrderStatus } from "@/features/orders/types";
import type { getAdminOrder } from "@/features/orders/services/admin-order.service";

type AdminOrder = Awaited<ReturnType<typeof getAdminOrder>>;

const adminStatuses: AdminOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function AdminOrderSidebar({ order }: { order: AdminOrder }) {
  const address = order.shippingAddress;
  const tracking = {
    courierName: order.courierName,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
  };
  const phone = order.customerPhone ?? address.phone;
  const links = [
    ...(order.status !== "PENDING" && order.status !== "CANCELLED"
      ? [
          {
            label: "WhatsApp: order confirmed",
            href: buildOrderStatusChatUrl(phone, order.orderNumber, "CONFIRMED", tracking),
          },
        ]
      : []),
    ...(order.status === "SHIPPED" && (order.trackingNumber || order.trackingUrl)
      ? [
          {
            label: "WhatsApp: shipped with tracking",
            href: buildOrderStatusChatUrl(phone, order.orderNumber, "SHIPPED", tracking),
          },
        ]
      : []),
    ...(order.status === "DELIVERED"
      ? [
          {
            label: "WhatsApp: delivered",
            href: buildOrderStatusChatUrl(phone, order.orderNumber, "DELIVERED", tracking),
          },
        ]
      : []),
  ].filter((link) => link.href);

  return (
    <aside className="space-y-6">
      <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
        <h2 className="font-serif text-xl">Customer</h2>
        <p className="mt-3 text-sm font-medium">{order.customerName ?? address.fullName}</p>
        <p className="mt-1 text-sm">{phone}</p>
        <p className="mt-3 text-sm leading-6">
          {address.line1}
          <br />
          {address.city}, {address.state} {address.postalCode}
        </p>
        {order.customerNote ? (
          <p className="mt-4 border-t border-border pt-3 text-sm">
            <span className="font-medium">Note: </span>
            {order.customerNote}
          </p>
        ) : null}
        {links.map((link) => (
          <Button key={link.label} asChild className="mt-5 w-full">
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </Button>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
        <h2 className="mb-4 font-serif text-xl">Update status</h2>
        {adminStatuses.includes(order.status as AdminOrderStatus) ? (
          <OrderStatusControl orderId={order.id} status={order.status as AdminOrderStatus} />
        ) : (
          <p className="text-sm text-muted-foreground">
            This legacy status is not part of the current fulfilment workflow.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
        <h2 className="mb-4 font-serif text-xl">Tracking and internal notes</h2>
        <OrderAdminDetailsControl
          key={`${order.id}:${order.trackingNumber ?? ""}:${order.courierName ?? ""}:${order.trackingUrl ?? ""}`}
          orderId={order.id}
          trackingNumber={order.trackingNumber}
          courierName={order.courierName}
          trackingUrl={order.trackingUrl}
        />
        {order.internalNotes.length ? (
          <ul className="mt-5 space-y-3 border-t border-border pt-4">
            {order.internalNotes.map((entry) => (
              <li key={entry.id} className="text-sm">
                <p className="whitespace-pre-wrap">{entry.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.author.name ?? "Staff"} · {entry.createdAt.toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </aside>
  );
}

import Link from "next/link";
import { getReturnRequests } from "@/features/returns/services/return.service";
import { AdminReturnControl } from "@/features/returns/components/admin-return-control";

export default async function AdminReturnsPage() {
  const requests = await getReturnRequests();
  return (
    <section className="space-y-5">
      <header>
        <h1 className="font-serif text-3xl">Return and exchange requests</h1>
      </header>
      <div className="space-y-4">
        {requests.map((request) => (
          <article key={request.id} className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-medium">
                  {request.order.orderNumber} · {request.orderItem.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {request.order.customerName} · {request.order.customerPhone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.orderItem.sku} · {request.orderItem.color} / {request.orderItem.size} ·
                  Qty {request.orderItem.quantity}
                </p>
              </div>
              <span className="text-xs uppercase">{request.status}</span>
            </div>
            <p className="text-sm">{request.reason}</p>
            <div className="flex gap-2">
              {request.photos.map((photo) => (
                <Link
                  key={photo.url}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                >
                  View photo
                </Link>
              ))}
            </div>
            {request.adminNote ? (
              <p className="text-xs text-muted-foreground">Internal note: {request.adminNote}</p>
            ) : null}
            <AdminReturnControl id={request.id} status={request.status} />
          </article>
        ))}
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No return or exchange requests.</p>
        ) : null}
      </div>
    </section>
  );
}

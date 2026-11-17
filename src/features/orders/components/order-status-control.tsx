"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/features/orders/actions/order.actions";
import { nextOrderStatuses } from "@/features/orders/status.utils";
import type { AdminOrderStatus } from "@/features/orders/types";

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: AdminOrderStatus;
}) {
  const router = useRouter();
  const submitting = useRef(false);
  const nextStatuses = nextOrderStatuses(status);
  const [nextStatus, setNextStatus] = useState<AdminOrderStatus | "">(nextStatuses[0] ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function updateStatus() {
    if (!nextStatus || submitting.current) return;
    submitting.current = true;
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateOrderStatusAction({ orderId, status: nextStatus, note });
        if (!result.success) {
          setMessage(result.error.message);
          return;
        }
        router.refresh();
      } finally {
        submitting.current = false;
      }
    });
  }

  if (nextStatuses.length === 0) {
    return <p className="text-sm text-muted-foreground">This order is in a final status.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value as AdminOrderStatus)}
          aria-label="Next order status"
          className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        >
          {nextStatuses.map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <Button type="button" disabled={isPending || !nextStatus} onClick={updateStatus}>
          {isPending ? "Updating…" : "Update status"}
        </Button>
      </div>
      <label className="block space-y-1.5 text-sm">
        <span>Status update note (visible to customer)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}

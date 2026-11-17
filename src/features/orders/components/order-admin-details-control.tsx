"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAdminOrderDetailsAction } from "@/features/orders/actions/order.actions";

export function OrderAdminDetailsControl({
  orderId,
  trackingNumber,
  courierName,
  trackingUrl,
}: {
  orderId: string;
  trackingNumber: string | null;
  courierName: string | null;
  trackingUrl: string | null;
}) {
  const router = useRouter();
  const submitting = useRef(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    startTransition(async () => {
      try {
        const result = await saveAdminOrderDetailsAction({
          orderId,
          internalNote: form.get("internalNote"),
          trackingNumber: form.get("trackingNumber"),
          courierName: form.get("courierName"),
          trackingUrl: form.get("trackingUrl"),
        });
        if (!result.success) {
          setMessage(result.error.message);
          return;
        }
        formElement.reset();
        setMessage("Order details saved.");
        router.refresh();
      } finally {
        submitting.current = false;
      }
    });
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <label className="block space-y-1.5 text-sm">
        <span>Courier name</span>
        <Input name="courierName" maxLength={100} defaultValue={courierName ?? ""} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span>Tracking number</span>
        <Input name="trackingNumber" maxLength={100} defaultValue={trackingNumber ?? ""} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span>Tracking URL (HTTPS)</span>
        <Input
          name="trackingUrl"
          type="url"
          maxLength={2048}
          defaultValue={trackingUrl ?? ""}
          placeholder="https://"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span>Internal note (staff only)</span>
        <textarea
          name="internalNote"
          maxLength={2000}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Visible to staff only"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </Button>
      {message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </form>
  );
}

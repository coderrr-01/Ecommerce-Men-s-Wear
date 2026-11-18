"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { claimGuestOrderAction } from "@/features/orders/actions/order.actions";

export function ClaimGuestOrderButton({
  orderNumber,
  token,
}: {
  orderNumber: string;
  token: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function claim() {
    startTransition(async () => {
      const result = await claimGuestOrderAction({ orderNumber, token });
      if (result.success) {
        setMessage("This order is now in your account order history.");
        router.refresh();
      } else {
        setMessage(result.error?.message ?? "We could not claim this order.");
      }
    });
  }

  return (
    <div className="mt-5">
      <Button type="button" variant="outline" onClick={claim} disabled={pending}>
        {pending ? "Adding order…" : "Add this order to my account"}
      </Button>
      {message ? (
        <p role={pending ? "status" : "alert"} className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}

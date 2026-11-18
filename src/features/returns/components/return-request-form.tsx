"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requestReturnAction } from "@/features/returns/actions/return.actions";

export function ReturnRequestForm({ orderItemId }: { orderItemId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await requestReturnAction(formData);
      setMessage(result.success ? "Request submitted for review." : result.error.message);
      if (result.success) router.refresh();
    });
  };
  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-md bg-secondary/50 p-3">
      <input type="hidden" name="orderItemId" value={orderItemId} />
      <label className="block text-xs font-medium" htmlFor={`return-reason-${orderItemId}`}>
        Return or exchange reason
      </label>
      <textarea
        id={`return-reason-${orderItemId}`}
        name="reason"
        minLength={10}
        maxLength={1000}
        required
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <label className="block text-xs font-medium" htmlFor={`return-photos-${orderItemId}`}>
        Photos (optional, up to 3)
      </label>
      <input
        id={`return-photos-${orderItemId}`}
        name="photos"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="block w-full text-xs"
      />
      <Button size="sm" type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Request return / exchange"}
      </Button>
      {message ? (
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { moderateReviewAction } from "@/features/reviews/actions/review.actions";

export function AdminReviewControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const update = async (value: "APPROVED" | "REJECTED") => {
    const result = await moderateReviewAction({ id, status: value });
    setMessage(
      result.success
        ? `Review ${value === "APPROVED" ? "approved" : "hidden"}.`
        : result.error.message,
    );
    if (result.success) router.refresh();
  };
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => void update("APPROVED")} disabled={status === "APPROVED"}>
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => void update("REJECTED")}>
        Hide
      </Button>
      <span role="status" className="self-center text-xs text-muted-foreground">
        {message}
      </span>
    </div>
  );
}

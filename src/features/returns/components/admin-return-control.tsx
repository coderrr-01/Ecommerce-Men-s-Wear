"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateReturnRequestAction } from "@/features/returns/actions/return.actions";

export function AdminReturnControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const update = async (action: "APPROVE" | "REJECT" | "RECEIVE" | "RETURN" | "EXCHANGE") => {
    const result = await updateReturnRequestAction({ id, action });
    setMessage(
      result.success ? `Updated: ${result.data.status.toLowerCase()}` : result.error.message,
    );
    if (result.success) router.refresh();
  };
  return (
    <div className="flex flex-wrap gap-2">
      {status === "REQUESTED" ? (
        <>
          <Button size="sm" onClick={() => void update("APPROVE")}>
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => void update("REJECT")}>
            Reject
          </Button>
        </>
      ) : null}
      {status === "APPROVED" ? (
        <Button size="sm" onClick={() => void update("RECEIVE")}>
          Mark item received
        </Button>
      ) : null}
      {status === "RECEIVED" ? (
        <>
          <Button size="sm" onClick={() => void update("RETURN")}>
            Complete return
          </Button>
          <Button size="sm" variant="outline" onClick={() => void update("EXCHANGE")}>
            Complete exchange
          </Button>
        </>
      ) : null}
      <span role="status" className="text-xs text-muted-foreground">
        {message}
      </span>
    </div>
  );
}

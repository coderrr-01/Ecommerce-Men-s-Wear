import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AccountOrdersPage() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <h2 className="font-serif text-2xl tracking-tight">No orders yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        When you place an order, its status, tracking and invoice will appear here.
      </p>
      <Button asChild className="mt-6">
        <Link href="/shop">Start shopping</Link>
      </Button>
    </div>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AccountAddressesPage() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <h2 className="font-serif text-2xl tracking-tight">No saved addresses</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Address management is being finalised. You can add delivery details during checkout when it
        opens.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/account">Back to account</Link>
      </Button>
    </div>
  );
}

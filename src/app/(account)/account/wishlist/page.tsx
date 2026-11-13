import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AccountWishlistPage() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <h2 className="font-serif text-2xl tracking-tight">Your wishlist is empty</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Wishlist saving is being finalised. For now, browse the collection and revisit your
        favourite pieces from the shop.
      </p>
      <Button asChild className="mt-6">
        <Link href="/shop">Browse menswear</Link>
      </Button>
    </div>
  );
}

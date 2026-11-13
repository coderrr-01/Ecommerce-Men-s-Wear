import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeCartItemAction, updateCartItemAction } from "@/features/cart/actions/cart.actions";
import { getCart } from "@/features/cart/services/cart.service";
import { requireUser } from "@/features/auth/services/session.service";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CartPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const user = await requireUser("/cart");
  const [cart, params] = await Promise.all([getCart(user.id), searchParams]);
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Your selection
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Shopping bag</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {cart.items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-20 text-center">
          <h2 className="font-serif text-2xl">Your bag is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Start with the pieces you reach for most: an Oxford shirt, a heavyweight tee or a clean
            chino.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Shop the collection</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <ul className="divide-y divide-border border-y border-border">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-sm bg-secondary sm:w-28"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium hover:underline hover:underline-offset-4"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {item.color} · {item.size}
                    </p>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    <p className="text-sm">{formatPrice(item.unitPrice)}</p>
                    {item.stock === 0 ? (
                      <p className="text-xs text-destructive">
                        This size is now sold out. Remove it to continue.
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <form action={updateCartItemAction} className="flex items-center gap-2">
                        <input type="hidden" name="itemId" value={item.id} />
                        <Input
                          type="number"
                          name="quantity"
                          min={1}
                          max={Math.min(10, Math.max(1, item.stock))}
                          defaultValue={item.quantity}
                          aria-label={`Quantity for ${item.name}`}
                          className="h-9 w-16 text-center"
                        />
                        <Button type="submit" variant="outline" size="sm">
                          Update
                        </Button>
                      </form>

                      <form action={removeCartItemAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </form>
                    </div>
                  </div>

                  <p className="text-sm font-semibold sm:text-right">
                    {formatPrice(item.lineTotal)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl tracking-tight">Order summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{cart.shippingTotal === 0 ? "Free" : formatPrice(cart.shippingTotal)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(cart.grandTotal)}</dd>
              </div>
            </dl>

            {cart.freeShippingRemaining > 0 ? (
              <p className="mt-4 rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                Add {formatPrice(cart.freeShippingRemaining)} more for free shipping.
              </p>
            ) : (
              <p className="mt-4 rounded-md bg-accent/5 px-3 py-2 text-xs text-accent">
                Your order qualifies for free shipping.
              </p>
            )}

            <Button type="button" size="lg" className="mt-6 w-full" disabled>
              Checkout coming soon
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {siteConfig.shipping.returnsWindowDays}-day returns · Secure payments
            </p>

            <Link
              href="/shop"
              className="mt-5 block text-center text-sm underline underline-offset-4 hover:text-accent"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

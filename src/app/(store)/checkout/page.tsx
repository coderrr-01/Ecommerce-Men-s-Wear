import Link from "next/link";
import { randomUUID } from "node:crypto";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/session.service";
import { getCartOwner } from "@/features/cart/guest-session";
import { CheckoutForm } from "@/features/orders/components/checkout-form";
import { getCheckoutPageData } from "@/features/orders/services/order.service";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const owner = await getCartOwner(user?.id);
  const { cart, defaults } = await getCheckoutPageData(
    user ? { id: user.id, name: user.name, phone: user.phone } : null,
    owner,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Order request
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Checkout</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Share your delivery details. You can confirm the order with us on WhatsApp; no online
          payment is taken here.
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <h2 className="font-serif text-2xl">Your bag is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add an item before starting checkout.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Explore the collection</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <section className="rounded-lg border border-border bg-card p-5 sm:p-7">
            <h2 className="mb-5 font-serif text-2xl">Delivery details</h2>
            <CheckoutForm
              defaults={defaults}
              expectedSubtotal={cart.subtotal}
              idempotencyKey={randomUUID()}
            />
          </section>

          <aside className="h-fit rounded-lg border border-border bg-card p-5 sm:p-7 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.color} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0">{formatPrice(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Delivery charge</dt>
                <dd>{cart.shippingTotal === 0 ? "Free" : formatPrice(cart.shippingTotal)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(cart.grandTotal)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Standard delivery is {formatPrice(siteConfig.shipping.standardFee)}; free on orders of{" "}
              {formatPrice(siteConfig.shipping.freeShippingThreshold)} or more.
            </p>
            <p className="mt-5 rounded-md bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
              No online payment is required. We will confirm availability and delivery with you on
              WhatsApp.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

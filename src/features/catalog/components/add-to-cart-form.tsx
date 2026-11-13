"use client";

import { useActionState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/features/cart/actions/cart.actions";
import { initialCartActionState } from "@/features/cart/types";

interface AddToCartFormProps {
  variantId: string;
  maxQuantity: number;
  priceLabel: string;
}

export function AddToCartForm({ variantId, maxQuantity, priceLabel }: AddToCartFormProps) {
  const [state, formAction, isPending] = useActionState(addToCartAction, initialCartActionState);
  const pathname = usePathname();

  return (
    <form
      action={formAction}
      className="fixed inset-x-0 bottom-0 z-30 space-y-2 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:static lg:space-y-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
    >
      <input type="hidden" name="variantId" value={variantId} />
      <div className="mx-auto flex max-w-2xl items-center gap-2 lg:max-w-none">
        <span className="mr-auto px-1 text-sm font-semibold whitespace-nowrap tabular-nums lg:hidden">
          {priceLabel}
        </span>
        <select
          name="quantity"
          aria-label="Quantity"
          className="h-11 w-16 rounded-md border border-input bg-background px-2 text-sm sm:w-20"
          defaultValue="1"
        >
          {Array.from({ length: Math.max(1, maxQuantity) }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <Button type="submit" size="lg" className="flex-1" disabled={isPending}>
          {isPending ? "Adding…" : "Add to bag"}
        </Button>
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="mx-auto max-w-2xl rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive lg:max-w-none"
        >
          {state.message}{" "}
          {state.requiresAuth ? (
            <Link
              href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
              className="font-medium underline underline-offset-4"
            >
              Sign in
            </Link>
          ) : null}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="mx-auto max-w-2xl rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent lg:max-w-none"
        >
          {state.message}{" "}
          <Link href="/cart" className="font-medium underline underline-offset-4">
            View bag
          </Link>
        </p>
      ) : null}
    </form>
  );
}

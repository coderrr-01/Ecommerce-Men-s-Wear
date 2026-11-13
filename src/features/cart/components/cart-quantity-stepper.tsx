"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateCartItemAction } from "@/features/cart/actions/cart.actions";

interface CartQuantityStepperProps {
  itemId: string;
  quantity: number;
  maxQuantity: number;
  productName: string;
}

export function CartQuantityStepper({
  itemId,
  quantity,
  maxQuantity,
  productName,
}: CartQuantityStepperProps) {
  const [value, setValue] = useState(quantity);
  const max = Math.max(1, maxQuantity);

  return (
    <form action={updateCartItemAction} className="flex items-center gap-2">
      <input type="hidden" name="itemId" value={itemId} />
      <div className="flex h-9 items-center border border-input">
        <button
          type="button"
          aria-label={`Decrease quantity for ${productName}`}
          disabled={value <= 1}
          onClick={() => setValue((current) => Math.max(1, current - 1))}
          className="grid size-9 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </button>
        <input
          type="number"
          name="quantity"
          min={1}
          max={max}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isInteger(next)) setValue(Math.max(1, Math.min(max, next)));
          }}
          aria-label={`Quantity for ${productName}`}
          className="h-full w-10 border-x border-input bg-transparent text-center text-xs tabular-nums outline-none"
        />
        <button
          type="button"
          aria-label={`Increase quantity for ${productName}`}
          disabled={value >= max}
          onClick={() => setValue((current) => Math.min(max, current + 1))}
          className="grid size-9 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <Button type="submit" variant="outline" size="sm" className="h-9">
        Update
      </Button>
    </form>
  );
}

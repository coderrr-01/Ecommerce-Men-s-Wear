"use client";

import { useRef } from "react";
import { useState } from "react";
import { Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductVariantOption } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";
import { suggestSize, type FitPreference } from "@/features/catalog/size-recommendation";

export function SizeGuide({ sizes }: { sizes: ProductVariantOption[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const availableSizes = sizes
    .filter((variant) => variant.stock > 0)
    .map((variant) => variant.size);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        <Ruler className="size-3.5" aria-hidden="true" />
        Size guide
      </button>
      <dialog
        ref={dialog}
        aria-label="Size guide"
        className="fixed inset-0 m-auto w-[min(32rem,calc(100vw-2rem))] border border-border bg-background p-6 text-foreground shadow-2xl backdrop:bg-foreground/50 sm:p-8"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Fit reference
            </p>
            <h2 className="mt-2 font-serif text-3xl">Size guide</h2>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => dialog.current?.close()}>
            Close
          </Button>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Select from the sizes listed for this piece. Exact garment measurements are not available
          here; contact {siteConfig.contact.email} for fit guidance.
        </p>
        <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {sizes.map((variant) => (
            <li
              key={variant.id}
              className={cn(
                "border border-border px-3 py-2 text-center text-sm",
                variant.stock === 0 && "text-muted-foreground line-through",
              )}
            >
              {variant.size}
            </li>
          ))}
        </ul>
        <form
          className="mt-7 border-t border-border pt-6"
          onSubmit={(event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            const height = Number(values.get("height"));
            const weight = Number(values.get("weight"));
            const fitValue = values.get("fit");
            const fit: FitPreference =
              fitValue === "slim" || fitValue === "relaxed" ? fitValue : "regular";
            setSuggestion(suggestSize(height, weight, fit, availableSizes));
            setHasCalculated(true);
          }}
        >
          <h3 className="font-serif text-xl">Find my size</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get a starting-point suggestion using your height, weight and preferred fit.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs">
              Height (cm)
              <input
                name="height"
                type="number"
                min={130}
                max={220}
                required
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs">
              Weight (kg)
              <input
                name="weight"
                type="number"
                min={35}
                max={200}
                required
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="col-span-2 space-y-1 text-xs">
              Preferred fit
              <select
                name="fit"
                defaultValue="regular"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="slim">Slim</option>
                <option value="regular">Regular</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </label>
          </div>
          <Button type="submit" variant="outline" className="mt-4 min-h-11 w-full">
            Suggest a size
          </Button>
          {hasCalculated ? (
            <p role="status" className="mt-3 text-sm font-medium">
              {suggestion
                ? `Suggested size: ${suggestion}`
                : "This helper supports lettered sizes only. Contact us for guidance on this size range."}
            </p>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            This is a general suggestion, not a fit guarantee. Garment measurements are unavailable;
            fit can vary by style.
          </p>
        </form>
      </dialog>
    </>
  );
}

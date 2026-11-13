"use client";

import { useRef } from "react";
import { Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductVariantOption } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

export function SizeGuide({ sizes }: { sizes: ProductVariantOption[] }) {
  const dialog = useRef<HTMLDialogElement>(null);

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
      </dialog>
    </>
  );
}

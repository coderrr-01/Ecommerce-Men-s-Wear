"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import type { ProductCardData } from "@/features/catalog/types";
import { formatPrice } from "@/lib/utils";
import { motionDuration, motionEasing } from "@/lib/motion";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: ProductCardData;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={`Quick view: ${product.name}`}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") dialog.current?.close();
      }}
      className="quick-view-dialog fixed inset-0 m-auto max-h-[90dvh] w-[min(56rem,calc(100vw-2rem))] overflow-y-auto border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-foreground/55"
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionDuration.standard, ease: motionEasing.enter }}
        className="grid md:grid-cols-2"
      >
        <div className="relative aspect-[4/5] bg-secondary">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="relative flex flex-col p-5 sm:p-8">
          <button
            type="button"
            aria-label="Close quick view"
            onClick={() => dialog.current?.close()}
            className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-background/90"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <p className="pr-12 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {product.brand ?? product.categoryName}
          </p>
          <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl">{product.name}</h2>
          <p className="mt-4 text-lg font-semibold">{formatPrice(product.price)}</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Choose a size and colour on the product page to check availability and add this piece to
            your bag.
          </p>
          <Button asChild size="lg" className="mt-auto min-h-12">
            <Link href={`/products/${product.slug}`} onClick={() => dialog.current?.close()}>
              View product
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </dialog>
  );
}

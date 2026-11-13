"use client";

import { useState } from "react";
import { useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { id: string; url: string; alt: string }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const gallery =
    images.length > 0
      ? images
      : [{ id: "placeholder", url: PRODUCT_PLACEHOLDER_IMAGE, alt: productName }];
  const active = gallery[Math.min(activeIndex, gallery.length - 1)];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-start">
        <div
          className="relative min-w-0 flex-1 touch-pan-y overflow-hidden bg-secondary"
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const endX = event.changedTouches[0]?.clientX;
            if (touchStart.current === null || endX === undefined || gallery.length < 2) return;
            const delta = touchStart.current - endX;
            if (Math.abs(delta) > 48) {
              setActiveIndex(
                (index) => (index + (delta > 0 ? 1 : -1) + gallery.length) % gallery.length,
              );
            }
            touchStart.current = null;
          }}
        >
          <button
            type="button"
            className="relative block aspect-[3/4] w-full cursor-zoom-in"
            aria-label="Enlarge product image"
            onClick={() => zoomDialog.current?.showModal()}
          >
            <Image
              src={active.url}
              alt={active.alt}
              fill
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </button>
        </div>

        {gallery.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
            {gallery.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${gallery.length}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  "relative aspect-[3/4] w-16 shrink-0 overflow-hidden border bg-secondary transition-opacity sm:w-full",
                  index === activeIndex
                    ? "border-foreground opacity-100"
                    : "border-transparent opacity-65 hover:opacity-100",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <dialog
        ref={zoomDialog}
        aria-label={`${productName} image`}
        className="fixed inset-0 m-0 h-dvh w-screen max-w-none border-0 bg-background/95 p-4 text-foreground backdrop:bg-foreground/80"
        onClick={(event) => {
          if (event.target === event.currentTarget) zoomDialog.current?.close();
        }}
      >
        <div className="mx-auto flex h-full max-w-5xl flex-col">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close image"
              onClick={() => zoomDialog.current?.close()}
            >
              <X />
            </Button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image
              src={active.url}
              alt={active.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      </dialog>
    </>
  );
}

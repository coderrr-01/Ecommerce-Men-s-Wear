"use client";

import { useState } from "react";
import Image from "next/image";

import { PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { id: string; url: string; alt: string }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery =
    images.length > 0
      ? images
      : [{ id: "placeholder", url: PRODUCT_PLACEHOLDER_IMAGE, alt: productName }];
  const active = gallery[Math.min(activeIndex, gallery.length - 1)];

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-start">
      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-md bg-secondary">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
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
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-sm border bg-secondary transition-opacity sm:w-full",
                index === activeIndex
                  ? "border-foreground opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

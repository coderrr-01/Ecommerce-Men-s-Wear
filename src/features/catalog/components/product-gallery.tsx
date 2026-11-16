"use client";

import { useState } from "react";
import { useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

import { PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motionDuration } from "@/lib/motion";

interface ProductGalleryProps {
  images: { id: string; url: string; alt: string }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const gallery =
    images.length > 0
      ? images
      : [{ id: "placeholder", url: PRODUCT_PLACEHOLDER_IMAGE, alt: productName }];
  const active = gallery[Math.min(activeIndex, gallery.length - 1)];
  const showImage = (index: number) => setActiveIndex((index + gallery.length) % gallery.length);

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
            if (touchStart.current === null || endX === undefined || gallery.length < 2) {
              touchStart.current = null;
              return;
            }
            const delta = touchStart.current - endX;
            if (Math.abs(delta) > 48) showImage(activeIndex + (delta > 0 ? 1 : -1));
            touchStart.current = null;
          }}
        >
          <button
            type="button"
            className="relative block aspect-[3/4] w-full cursor-zoom-in"
            aria-label="Enlarge product image"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") showImage(activeIndex + 1);
              if (event.key === "ArrowLeft") showImage(activeIndex - 1);
            }}
            onClick={() => {
              setZoomOpen(true);
              zoomDialog.current?.showModal();
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : motionDuration.fast }}
                className="absolute inset-0"
              >
                <Image
                  src={active.url}
                  alt={active.alt}
                  fill
                  loading="eager"
                  sizes="(min-width: 1280px) 580px, (min-width: 1024px) calc(50vw - 60px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
              </motion.div>
            </AnimatePresence>
          </button>
          {gallery.length > 1 ? (
            <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Previous product image"
                onClick={() => showImage(activeIndex - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Next product image"
                onClick={() => showImage(activeIndex + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </div>

        {gallery.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
            {gallery.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => showImage(index)}
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
                  loading={index === activeIndex ? "eager" : "lazy"}
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
        onKeyDown={(event) => {
          if (event.key === "Escape") zoomDialog.current?.close();
        }}
        className="fixed inset-0 m-0 h-dvh w-screen max-w-none border-0 bg-background/95 p-4 text-foreground backdrop:bg-foreground/80"
        onClose={() => {
          setZoomed(false);
          setZoomOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) zoomDialog.current?.close();
        }}
      >
        <div className="mx-auto flex h-full max-w-5xl flex-col">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
              aria-pressed={zoomed}
              onClick={() => setZoomed((current) => !current)}
            >
              {zoomed ? <ZoomOut /> : <ZoomIn />}
            </Button>
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
            {zoomOpen ? (
              <button
                type="button"
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
                aria-pressed={zoomed}
                onClick={() => setZoomed((current) => !current)}
                className="absolute inset-0 grid place-items-center overflow-hidden"
              >
                <Image
                  src={active.url}
                  alt={active.alt}
                  fill
                  loading="eager"
                  sizes="(min-width: 1056px) 1024px, calc(100vw - 2rem)"
                  className={cn(
                    "object-contain transition-transform duration-300",
                    zoomed && "scale-150",
                  )}
                />
              </button>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}

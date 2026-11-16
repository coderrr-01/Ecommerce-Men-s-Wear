"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";

export function HomeTestimonials() {
  const { testimonials } = siteConfig.home;
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = useCallback(() => {
    if (emblaApi) setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateIndex);
    return () => {
      emblaApi.off("select", updateIndex);
    };
  }, [emblaApi, updateIndex]);

  return (
    <ScrollReveal>
      <section className="bg-secondary/55 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {testimonials.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                {testimonials.title}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11"
                aria-label="Previous customer story"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ArrowLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11"
                aria-label="Next customer story"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div ref={viewportRef} className="mt-8 overflow-hidden">
            <div className="-ml-4 flex touch-pan-y">
              {testimonials.items.map((item, index) => (
                <article
                  key={`${item.author}-${index}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${testimonials.items.length}`}
                  aria-hidden={activeIndex !== index}
                  className="min-w-0 flex-[0_0_100%] pl-4"
                >
                  <Quote className="size-7 text-accent" aria-hidden="true" />
                  <blockquote className="mt-5 max-w-3xl font-serif text-2xl leading-snug sm:text-4xl">
                    {item.quote}
                  </blockquote>
                  <p className="mt-5 text-sm font-medium">{item.author}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

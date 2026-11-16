"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { Button } from "@/components/ui/button";
import { HomeHeroControls } from "@/features/catalog/components/home-hero-controls";
import { siteConfig } from "@/config/site.config";
import { motionDuration, motionEasing } from "@/lib/motion";

export function HomeHero() {
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 28 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -26]);
  const slides = siteConfig.hero.slides;
  const paused = hoverPaused || focusPaused || manualPaused || reducedMotion !== false;

  const updateIndex = useCallback(() => {
    if (emblaApi) setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateIndex);
    emblaApi.on("reInit", updateIndex);
    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("reInit", updateIndex);
    };
  }, [emblaApi, updateIndex]);

  useEffect(() => {
    if (!emblaApi || paused) return;
    const timer = window.setInterval(() => emblaApi.scrollNext(), 6500);
    return () => window.clearInterval(timer);
  }, [emblaApi, paused]);

  return (
    <section
      ref={sectionRef}
      aria-label="Featured collection"
      aria-roledescription="carousel"
      className="relative isolate min-h-[min(780px,100svh)] overflow-hidden bg-foreground"
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false);
      }}
    >
      <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={slide.imageUrl}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              aria-hidden={activeIndex !== index}
              inert={activeIndex !== index}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <motion.div
                className="absolute inset-x-0 -inset-y-8"
                style={{ y: reducedMotion ? 0 : imageY }}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageAlt}
                  fill
                  preload={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/55 to-transparent" />

      <div className="relative mx-auto flex min-h-[min(780px,100svh)] w-full max-w-[1440px] items-end px-5 pt-48 pb-28 text-background sm:px-8 sm:pb-32 lg:px-12">
        <div className="relative z-10 max-w-3xl">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionDuration.slow, ease: motionEasing.enter }}
          >
            <p className="text-[10px] tracking-[0.24em] uppercase sm:text-xs">
              {slides[activeIndex]?.eyebrow}
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-7xl lg:text-8xl">
              {slides[activeIndex]?.titleLines.map((line, index) => (
                <motion.span
                  key={`${activeIndex}-${line}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: motionDuration.slow,
                    delay: reducedMotion ? 0 : index * 0.1,
                    ease: motionEasing.enter,
                  }}
                  className="block"
                >
                  {line}
                </motion.span>
              ))}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-background/80 sm:text-base">
              {slides[activeIndex]?.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-12 px-6">
                <Link href={slides[activeIndex]?.primaryCta.href ?? "/shop"}>
                  {slides[activeIndex]?.primaryCta.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-12 border-background/60 bg-transparent px-6 text-background hover:bg-background hover:text-foreground"
              >
                <Link href={slides[activeIndex]?.secondaryCta.href ?? "/shop"}>
                  {slides[activeIndex]?.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.span
          aria-hidden="true"
          animate={reducedMotion ? undefined : { y: [0, -6, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-1/3 right-[16%] hidden text-background/75 sm:block"
        >
          <Sparkles className="size-8" />
        </motion.span>
        <motion.span
          aria-hidden="true"
          animate={reducedMotion ? undefined : { y: [0, 5, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-[46%] right-[8%] hidden text-background/55 lg:block"
        >
          <Sparkles className="size-5" />
        </motion.span>

        <HomeHeroControls
          slideCount={slides.length}
          activeIndex={activeIndex}
          paused={manualPaused}
          onSelect={(index) => emblaApi?.scrollTo(index)}
          onTogglePause={() => setManualPaused((value) => !value)}
          onPrevious={() => emblaApi?.scrollPrev()}
          onNext={() => emblaApi?.scrollNext()}
        />
      </div>
    </section>
  );
}

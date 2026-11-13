import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";

export function HomeHero() {
  return (
    <section className="relative isolate flex min-h-[min(780px,100svh)] items-end overflow-hidden bg-foreground">
      <Image
        src={siteConfig.hero.imageUrl}
        alt={siteConfig.hero.imageAlt}
        fill
        preload
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
      <div className="relative mx-auto w-full max-w-[1440px] px-5 pt-44 pb-16 text-white sm:px-8 sm:pb-20 lg:px-12 lg:pb-28">
        <div className="max-w-3xl space-y-6">
          <p className="text-[10px] tracking-[0.24em] uppercase sm:text-xs">
            {siteConfig.hero.eyebrow}
          </p>
          <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-7xl lg:text-8xl">
            {siteConfig.hero.titleLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h1>
          <p className="max-w-lg text-sm leading-7 text-white/80 sm:text-base">
            {siteConfig.hero.description}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild size="lg" className="h-12 px-6">
              <Link href={siteConfig.hero.primaryCta.href}>
                {siteConfig.hero.primaryCta.label}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/50 bg-transparent px-6 text-white hover:bg-white hover:text-foreground"
            >
              <Link href={siteConfig.hero.secondaryCta.href}>
                {siteConfig.hero.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>
        <a
          href="#categories"
          className="absolute right-6 bottom-7 hidden items-center gap-2 text-[10px] tracking-[0.16em] text-white/80 uppercase lg:flex"
        >
          Discover
          <ArrowDown className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

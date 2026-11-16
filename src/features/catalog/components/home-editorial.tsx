import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";

export function HomeEditorial() {
  return (
    <ScrollReveal>
      <section className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12 lg:py-24">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <Image
            src={siteConfig.home.editorial.imageUrl}
            alt={siteConfig.home.editorial.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="max-w-2xl">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {siteConfig.home.editorial.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            {siteConfig.home.editorial.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {siteConfig.home.editorial.body}
          </p>
          <Button asChild variant="outline" className="mt-6 min-h-11">
            <Link href={siteConfig.home.editorial.cta.href}>
              {siteConfig.home.editorial.cta.label}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </ScrollReveal>
  );
}

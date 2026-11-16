import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";

export function HomeWinterBanner() {
  const { winterCollection } = siteConfig.home;

  return (
    <ScrollReveal>
      <section className="relative isolate min-h-[26rem] overflow-hidden bg-foreground text-background sm:min-h-[32rem]">
        <Image
          src={winterCollection.imageUrl}
          alt={winterCollection.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/55 to-transparent" />
        <div className="relative mx-auto flex min-h-[26rem] max-w-[1440px] items-center px-5 py-14 sm:min-h-[32rem] sm:px-8 lg:px-12">
          <div className="max-w-xl">
            <p className="text-[10px] tracking-[0.2em] uppercase">{winterCollection.eyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">
              {winterCollection.title}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-background/80">
              {winterCollection.body}
            </p>
            <Button asChild size="lg" className="mt-7 min-h-12">
              <Link href={winterCollection.cta.href}>
                {winterCollection.cta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

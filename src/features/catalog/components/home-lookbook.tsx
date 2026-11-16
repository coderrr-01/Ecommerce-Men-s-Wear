import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";

export function HomeLookbook() {
  const { lookbook } = siteConfig.home;

  return (
    <ScrollReveal>
      <section className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {lookbook.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{lookbook.title}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {lookbook.items.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group relative aspect-[4/5] overflow-hidden bg-secondary ${
                index % 2 === 1 ? "sm:mt-10" : ""
              }`}
            >
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
              <span className="absolute inset-x-4 bottom-4 flex items-end justify-between text-background sm:inset-x-5 sm:bottom-5">
                <span className="font-serif text-lg sm:text-2xl">{item.title}</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";

export function HomeNewsletter() {
  const { newsletter } = siteConfig.home;

  return (
    <ScrollReveal>
      <section className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-8 border-y border-border py-10 md:grid-cols-[1fr_auto] md:items-center md:py-14">
          <div className="max-w-xl">
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {newsletter.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              {newsletter.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{newsletter.description}</p>
          </div>
          <form className="w-full max-w-md" aria-describedby="newsletter-status">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="flex gap-2">
              <Input
                id="newsletter-email"
                type="email"
                placeholder="Email address"
                disabled
                className="min-h-12"
              />
              <Button type="submit" size="icon" aria-label="Join newsletter" disabled>
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
            <p id="newsletter-status" role="status" className="mt-2 text-xs text-muted-foreground">
              {newsletter.disabledLabel}
            </p>
          </form>
        </div>
      </section>
    </ScrollReveal>
  );
}

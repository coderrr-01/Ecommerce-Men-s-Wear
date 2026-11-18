import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";
import { NewsletterSignupForm } from "@/features/communications/components/newsletter-signup-form";

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
          <NewsletterSignupForm />
        </div>
      </section>
    </ScrollReveal>
  );
}

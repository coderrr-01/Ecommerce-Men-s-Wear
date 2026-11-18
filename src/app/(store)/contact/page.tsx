import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { ContactForm } from "@/features/communications/components/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 lg:py-16">
      <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {siteConfig.footer.contactHeading}
      </p>
      <h1 className="mt-2 font-serif text-4xl">How can we help?</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Messages are stored for our team to review. If an email provider is not configured, no email
        is sent automatically.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { ContactForm } from "@/features/communications/components/contact-form";

const contactContent = siteConfig.policies.pages.contact;
const contactValues: Record<string, string> = {
  email: siteConfig.contact.email,
  phone: siteConfig.contact.phone,
  hours: siteConfig.contact.hours,
};

function renderContactText(text: string) {
  return text.replace(/\{\{([A-Za-z]+)\}\}/g, (token, key: string) => contactValues[key] ?? token);
}

export const metadata: Metadata = {
  title: contactContent.title,
  description: contactContent.description,
  alternates: { canonical: new URL("/contact", siteConfig.url) },
  openGraph: {
    title: contactContent.title,
    description: contactContent.description,
    url: new URL("/contact", siteConfig.url),
  },
  twitter: { title: contactContent.title, description: contactContent.description },
};

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 lg:py-16">
      <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {siteConfig.footer.contactHeading}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{contactContent.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{contactContent.description}</p>
      <p
        role="note"
        className="mt-5 rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
      >
        Draft contact policy — REPLACE BEFORE LAUNCH. Review this text for your business and
        applicable law.
      </p>
      {contactContent.sections.map((section) => (
        <div key={section.heading} className="mt-6">
          <h2 className="font-medium">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="mt-2 text-sm leading-6 text-muted-foreground">
              {renderContactText(paragraph)}
            </p>
          ))}
        </div>
      ))}
      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
  );
}

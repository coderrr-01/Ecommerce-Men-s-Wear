"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSignupAction } from "@/features/communications/actions/communication.actions";
import { siteConfig } from "@/config/site.config";

export function NewsletterSignupForm() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await newsletterSignupAction({
        email: formData.get("email"),
        honeypot: formData.get("website"),
      });
      setMessage(result.success ? siteConfig.home.newsletter.successLabel : result.error.message);
    });
  };

  return (
    <form action={submit} className="w-full max-w-md" aria-describedby="newsletter-status">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="Email address"
          required
          maxLength={254}
          className="min-h-12"
        />
        <Button type="submit" size="icon" aria-label="Join newsletter" disabled={pending}>
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">Leave this field empty</label>
        <input id="newsletter-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p id="newsletter-status" role="status" className="mt-2 text-xs text-muted-foreground">
        {message}
      </p>
    </form>
  );
}

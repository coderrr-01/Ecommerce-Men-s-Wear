"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactFormAction } from "@/features/communications/actions/communication.actions";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await contactFormAction({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        honeypot: formData.get("website"),
      });
      setMessage(
        result.success
          ? "Your message has been saved. Our team will follow up using the contact details provided."
          : result.error.message,
      );
    });
  };
  return (
    <form action={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" name="name" required maxLength={120} />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" name="email" type="email" required maxLength={254} />
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input id="contact-phone" name="phone" type="tel" maxLength={20} />
        </div>
        <div>
          <Label htmlFor="contact-subject">Subject</Label>
          <Input id="contact-subject" name="subject" required maxLength={160} />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={5000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send message"}
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {message}
      </p>
    </form>
  );
}

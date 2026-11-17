"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function OrderConfirmationActions({
  whatsappUrl,
  message,
}: {
  whatsappUrl: string;
  message: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button asChild size="lg" className="w-full">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Send order on WhatsApp
        </a>
      </Button>
      <Button type="button" variant="outline" size="lg" className="w-full" onClick={copyMessage}>
        {copied ? "Message copied" : "Copy message"}
      </Button>
      {copyError ? (
        <p role="alert" className="text-sm text-destructive">
          Copy is unavailable. Open “View message” below and copy it manually.
        </p>
      ) : null}
      <details className="rounded-md border border-border p-3">
        <summary className="cursor-pointer text-sm font-medium">View message</summary>
        <pre className="mt-3 overflow-x-auto text-xs leading-5 whitespace-pre-wrap text-muted-foreground">
          {message}
        </pre>
      </details>
    </div>
  );
}

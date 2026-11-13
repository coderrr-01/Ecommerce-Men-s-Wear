import { ProviderError } from "@/lib/errors";
import type { EmailMessage, EmailProvider, EmailSendResult } from "./types";

interface ResendConfig {
  apiKey: string;
  from: string;
}

interface ResendResponse {
  id?: string;
  message?: string;
}

export class ResendEmailProvider implements EmailProvider {
  readonly id = "resend" as const;

  constructor(private readonly config: ResendConfig) {
    if (!config.apiKey) {
      throw new ProviderError("Resend", "RESEND_API_KEY is not configured");
    }
  }

  async send({ to, subject, html, text, replyTo, tags }: EmailMessage): Promise<EmailSendResult> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.config.from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(text ? { text } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(tags ? { tags: Object.entries(tags).map(([name, value]) => ({ name, value })) } : {}),
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as ResendResponse;

    if (!response.ok || !data.id) {
      throw new ProviderError("Resend", data.message ?? `send failed with ${response.status}`);
    }

    return { id: data.id };
  }
}

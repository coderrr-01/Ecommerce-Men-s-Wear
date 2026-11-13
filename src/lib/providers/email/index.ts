import "server-only";
import { env } from "@/env";
import { ProviderError } from "@/lib/errors";
import { ConsoleEmailProvider } from "./console";
import { ResendEmailProvider } from "./resend";
import type { EmailProvider } from "./types";

export type { EmailMessage, EmailProvider, EmailSendResult } from "./types";

let cachedProvider: EmailProvider | undefined;

export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider;

  if (env.EMAIL_PROVIDER === "resend") {
    if (!env.RESEND_API_KEY) {
      throw new ProviderError("Resend", "RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
    }
    cachedProvider = new ResendEmailProvider({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
    });
  } else {
    cachedProvider = new ConsoleEmailProvider();
  }

  return cachedProvider;
}

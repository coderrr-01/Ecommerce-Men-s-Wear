import { logger } from "@/lib/logger";
import type { EmailMessage, EmailProvider, EmailSendResult } from "./types";

/** Development provider: logs a safe summary instead of sending email. */
export class ConsoleEmailProvider implements EmailProvider {
  readonly id = "console" as const;

  async send({ to, subject }: EmailMessage): Promise<EmailSendResult> {
    logger.info("email.console_provider", {
      to: Array.isArray(to) ? to.length : 1,
      subject,
    });
    return { id: `console_${crypto.randomUUID()}` };
  }
}

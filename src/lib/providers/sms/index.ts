import "server-only";
import { logger } from "@/lib/logger";
import type { SmsMessage, SmsProvider, SmsSendResult } from "./types";

export type { SmsMessage, SmsProvider, SmsSendResult } from "./types";

class ConsoleSmsProvider implements SmsProvider {
  readonly id = "console" as const;

  async send({ to, body }: SmsMessage): Promise<SmsSendResult> {
    logger.info("sms.console_provider", { to, characters: body.length });
    return { id: `sms_${crypto.randomUUID()}` };
  }
}

let cachedProvider: SmsProvider | undefined;

export function getSmsProvider(): SmsProvider {
  cachedProvider ??= new ConsoleSmsProvider();
  return cachedProvider;
}

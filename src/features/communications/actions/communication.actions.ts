"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getCurrentUser } from "@/features/auth/services/session.service";
import {
  enrollNewsletter,
  submitContactMessage,
} from "@/features/communications/services/communication.service";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limiter";
import { safeAction } from "@/lib/safe-action";
import type { ApiResponse } from "@/types/api";

async function requestIp() {
  const requestHeaders = await headers();
  return getClientIp(requestHeaders) ?? "unknown";
}

export async function newsletterSignupAction(
  input: unknown,
): Promise<ApiResponse<{ accepted: boolean }>> {
  return safeAction("newsletter.signup", async () => {
    const data = z
      .object({
        email: z.string().trim().email().max(254),
        honeypot: z.string().max(200).optional(),
      })
      .parse(input);
    if (data.honeypot) return { accepted: true };
    await enforceRateLimit("newsletter", await requestIp(), 5, 60 * 60 * 1000);
    const user = await getCurrentUser();
    await enrollNewsletter(data.email, user?.id ?? null);
    return { accepted: true };
  });
}

export async function contactFormAction(
  input: unknown,
): Promise<ApiResponse<{ accepted: boolean }>> {
  return safeAction("contact.submit", async () => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(254),
        phone: z.string().trim().max(20).optional(),
        subject: z.string().trim().min(2).max(160),
        message: z.string().trim().min(10).max(5000),
        honeypot: z.string().max(200).optional(),
      })
      .parse(input);
    if (data.honeypot) return { accepted: true };
    await enforceRateLimit("contact", await requestIp(), 3, 60 * 60 * 1000);
    const user = await getCurrentUser();
    await submitContactMessage({ ...data, phone: data.phone ?? "", userId: user?.id ?? null });
    return { accepted: true };
  });
}

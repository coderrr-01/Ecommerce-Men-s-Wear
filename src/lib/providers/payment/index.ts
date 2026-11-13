import "server-only";
import { env, isProduction } from "@/env";
import { ProviderError } from "@/lib/errors";
import { MockPaymentProvider } from "./mock";
import { RazorpayPaymentProvider } from "./razorpay";
import type { PaymentProvider } from "./types";

export type {
  CreatePaymentOrderInput,
  PaymentOrder,
  PaymentProvider,
  RefundInput,
  RefundResult,
  VerifyPaymentInput,
} from "./types";

let cachedProvider: PaymentProvider | undefined;

function createProvider(): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "mock") {
    if (isProduction) {
      throw new ProviderError("Payment", "mock provider cannot be used in production");
    }
    return new MockPaymentProvider();
  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ProviderError("Razorpay", "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");
  }

  return new RazorpayPaymentProvider({
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
  });
}

export function getPaymentProvider(): PaymentProvider {
  cachedProvider ??= createProvider();
  return cachedProvider;
}

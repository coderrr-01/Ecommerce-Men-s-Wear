import { createHmac, timingSafeEqual } from "node:crypto";
import { ProviderError } from "@/lib/errors";
import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  PaymentProvider,
  RefundInput,
  RefundResult,
  VerifyPaymentInput,
} from "./types";

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
}

interface RazorpayRefundResponse {
  id: string;
  payment_id: string;
  amount: number;
  status: string;
}

const API_BASE = "https://api.razorpay.com/v1";

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export class RazorpayPaymentProvider implements PaymentProvider {
  readonly id = "razorpay" as const;

  constructor(private readonly config: RazorpayConfig) {
    if (!config.keyId || !config.keySecret) {
      throw new ProviderError("Razorpay", "credentials are not configured");
    }
  }

  private get authorization(): string {
    const credentials = `${this.config.keyId}:${this.config.keySecret}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: this.authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes ?? {},
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ProviderError("Razorpay", `order creation failed with ${response.status}`);
    }

    const order = (await response.json()) as RazorpayOrderResponse;
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    };
  }

  verifyPaymentSignature({ orderId, paymentId, signature }: VerifyPaymentInput): boolean {
    const expected = createHmac("sha256", this.config.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return safeEqual(expected, signature);
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new ProviderError("Razorpay", "webhook secret is not configured");
    }
    const expected = createHmac("sha256", this.config.webhookSecret).update(rawBody).digest("hex");
    return safeEqual(expected, signature);
  }

  async refund({ paymentId, amount, notes }: RefundInput): Promise<RefundResult> {
    const response = await fetch(`${API_BASE}/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        Authorization: this.authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, notes: notes ?? {} }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ProviderError("Razorpay", `refund failed with ${response.status}`);
    }

    const refund = (await response.json()) as RazorpayRefundResponse;
    return {
      id: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      status: refund.status,
    };
  }
}

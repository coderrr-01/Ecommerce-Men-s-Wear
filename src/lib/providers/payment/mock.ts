import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  PaymentProvider,
  RefundInput,
  RefundResult,
  VerifyPaymentInput,
} from "./types";

/** Development-only provider. Never enabled when NODE_ENV=production. */
export class MockPaymentProvider implements PaymentProvider {
  readonly id = "mock" as const;

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    return {
      id: `order_mock_${crypto.randomUUID().replaceAll("-", "").slice(0, 14)}`,
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      status: "created",
    };
  }

  verifyPaymentSignature({ signature }: VerifyPaymentInput): boolean {
    return signature === "mock-signature";
  }

  verifyWebhookSignature(_rawBody: string, signature: string): boolean {
    return signature === "mock-signature";
  }

  async refund({ paymentId, amount }: RefundInput): Promise<RefundResult> {
    return {
      id: `rfnd_mock_${crypto.randomUUID().replaceAll("-", "").slice(0, 14)}`,
      paymentId,
      amount: amount ?? 0,
      status: "processed",
    };
  }
}

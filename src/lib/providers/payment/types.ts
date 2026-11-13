export interface CreatePaymentOrderInput {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface RefundInput {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}

export interface RefundResult {
  id: string;
  paymentId: string;
  amount: number;
  status: string;
}

/**
 * Payment boundary. Swap Razorpay for another PSP by implementing this
 * interface and changing the factory; services never import a PSP SDK.
 */
export interface PaymentProvider {
  readonly id: "razorpay" | "mock";
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;
  verifyPaymentSignature(input: VerifyPaymentInput): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  refund(input: RefundInput): Promise<RefundResult>;
}

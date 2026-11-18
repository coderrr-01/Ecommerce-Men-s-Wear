const WINDOW_MS = 60 * 60 * 1000;
const MAX_ORDERS = 5;
import { enforceRateLimit } from "@/lib/rate-limiter";

export async function enforceOrderRateLimit(
  phone: string,
  ipAddress?: string | null,
): Promise<void> {
  await enforceRateLimit("order-phone", phone, MAX_ORDERS, WINDOW_MS);
  if (ipAddress) await enforceRateLimit("order-ip", ipAddress, MAX_ORDERS, WINDOW_MS);
}

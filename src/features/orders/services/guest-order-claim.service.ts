import "server-only";

import {
  claimGuestOrderById,
  findGuestOrderForClaim,
  findOrderClaimedByUser,
} from "@/features/orders/repositories/order.repository";
import { canClaimGuestOrder } from "@/features/orders/claim.utils";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limiter";

const CLAIM_WINDOW_MS = 60 * 60 * 1000;

export async function claimGuestOrder(
  orderNumber: string,
  token: string,
  user: { id: string; phone: string | null },
  ipAddress: string | null,
) {
  await enforceRateLimit(
    "guest-order-claim",
    `${user.id}:${ipAddress ?? "unknown"}`,
    5,
    CLAIM_WINDOW_MS,
    { failureMode: "closed", message: "Too many claim attempts. Try again in an hour." },
  );

  const guestOrder = await findGuestOrderForClaim(orderNumber, token);
  if (!guestOrder) {
    const alreadyClaimed = await findOrderClaimedByUser(orderNumber, token, user.id);
    if (alreadyClaimed) return { claimed: true, alreadyClaimed: true };
    throw new NotFoundError("Order");
  }
  if (!canClaimGuestOrder(guestOrder.customerPhone, user.phone)) {
    throw new NotFoundError("Order");
  }

  const result = await claimGuestOrderById(guestOrder.id, token, user.id);
  if (result.count === 1) return { claimed: true, alreadyClaimed: false };

  const alreadyClaimed = await findOrderClaimedByUser(orderNumber, token, user.id);
  if (alreadyClaimed) return { claimed: true, alreadyClaimed: true };
  throw new ConflictError("This order cannot be claimed by this account.");
}

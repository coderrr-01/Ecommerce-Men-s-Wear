import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

import type { CartOwner } from "@/features/cart/types";

const CART_SESSION_COOKIE = "diamond-cart-session";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getCartOwner(
  userId?: string | null,
  createGuestSession = false,
): Promise<CartOwner | null> {
  if (userId) return { userId };

  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existing && UUID_PATTERN.test(existing)) return { sessionId: existing };
  if (!createGuestSession) return null;

  const sessionId = randomUUID();
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return { sessionId };
}

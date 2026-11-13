"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addToCartSchema } from "@/features/cart/schemas/cart.schema";
import {
  addItemToCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/services/cart.service";
import { initialCartActionState, type CartActionState } from "@/features/cart/types";
import { getCurrentUser } from "@/features/auth/services/session.service";
import { AppError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { fieldErrors } from "@/lib/validation";

export async function addToCartAction(
  _previousState: CartActionState = initialCartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = addToCartSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity") ?? 1,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Select an available size and colour first.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return {
      status: "error",
      message: "Sign in to add items to your bag.",
      requiresAuth: true,
    };
  }

  try {
    await addItemToCart(user.id, parsed.data);
    const cart = await getCart(user.id);
    revalidatePath("/cart");

    return {
      status: "success",
      message: "Added to your bag.",
      itemCount: cart.itemCount,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { status: "error", message: error.message };
    }

    logger.error("cart.add_failed", { userId: user.id, error });
    return {
      status: "error",
      message: "We could not add this item. Please try again.",
    };
  }
}

function redirectToCartWithError(message: string): never {
  redirect(`/cart?error=${encodeURIComponent(message)}`);
}

export async function updateCartItemAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/cart");

  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity"));

  try {
    if (!itemId) throw new ValidationError("Cart item is missing.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new ValidationError("Choose a quantity between 1 and 10.");
    }

    await updateCartItemQuantity(user.id, itemId, quantity);
  } catch (error) {
    if (error instanceof AppError) redirectToCartWithError(error.message);
    logger.error("cart.update_failed", { userId: user.id, error });
    redirectToCartWithError("We could not update your bag. Please try again.");
  }

  revalidatePath("/cart");
  redirect("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/cart");

  const itemId = String(formData.get("itemId") ?? "");

  try {
    if (!itemId) throw new ValidationError("Cart item is missing.");
    await removeCartItem(user.id, itemId);
  } catch (error) {
    if (error instanceof AppError) redirectToCartWithError(error.message);
    logger.error("cart.remove_failed", { userId: user.id, error });
    redirectToCartWithError("We could not remove this item. Please try again.");
  }

  revalidatePath("/cart");
  redirect("/cart");
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z, ZodError } from "zod";

import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import {
  MAX_PRODUCT_IMAGE_REQUEST_BYTES,
} from "@/features/catalog/product-image.utils";
import { uploadProductImage } from "@/features/catalog/services/product-image.service";
import { AppError, ValidationError } from "@/lib/errors";
import { normalizeError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types/api";

export const runtime = "nodejs";

function failure(error: unknown, productId: string) {
  const apiError = normalizeError(error);
  if (apiError.code === "INTERNAL_ERROR") {
    logger.error("admin.product-images.upload_failed", { productId, error });
  } else {
    logger.warn("admin.product-images.upload_rejected", {
      productId,
      code: apiError.code,
      message: apiError.message,
    });
  }
  const status = error instanceof AppError ? error.status : error instanceof ZodError ? 422 : 500;
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: apiError },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    await requireRole(ADMIN_ROLES, { throwOnDenied: true });
    const productId = z.string().cuid().parse(id);
    const lengthHeader = request.headers.get("content-length");
    if (lengthHeader !== null) {
      const contentLength = Number(lengthHeader);
      if (!Number.isFinite(contentLength) || contentLength < 0) {
        throw new ValidationError("Upload a valid image file.");
      }
      if (contentLength > MAX_PRODUCT_IMAGE_REQUEST_BYTES) {
        throw new ValidationError("Each image must be 5 MB or smaller.");
      }
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw new ValidationError("Upload a valid image file.");
    }
    const files = formData.getAll("file");
    const file = files[0];
    if (files.length !== 1 || !(file instanceof File)) {
      throw new ValidationError("Select exactly one image file.");
    }

    const image = await uploadProductImage(productId, file);
    return NextResponse.json<ApiResponse<typeof image>>(
      { success: true, data: image },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error, id);
  }
}

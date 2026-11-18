import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth/services/session.service";
import { getInvoiceData } from "@/features/orders/services/invoice.service";
import { renderInvoicePdf } from "@/features/orders/services/invoice-pdf.service";
import { normalizeError } from "@/lib/error-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const invoiceRequestSchema = z.object({
  orderNumber: z.string().regex(/^[A-Za-z0-9-]{1,60}$/),
  token: z
    .string()
    .regex(/^[A-Za-z0-9_-]{43}$/)
    .nullable(),
});

export async function GET(request: Request, context: { params: Promise<{ orderNumber: string }> }) {
  try {
    const [{ orderNumber }, url, user] = await Promise.all([
      context.params,
      Promise.resolve(new URL(request.url)),
      getCurrentUser(),
    ]);
    const parsed = invoiceRequestSchema.safeParse({
      orderNumber,
      token: url.searchParams.get("token"),
    });
    if (!parsed.success) throw new NotFoundError("Invoice");

    const invoice = await getInvoiceData(parsed.data.orderNumber, {
      userId: user?.id ?? null,
      token: parsed.data.token || null,
      isStaff: user?.role === "ADMIN" || user?.role === "STAFF",
    });
    const pdf = await renderInvoicePdf(invoice);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Content-Length": String(pdf.byteLength),
        "Content-Type": "application/pdf",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const apiError = normalizeError(error);
    logger.warn("orders.invoice_request_failed", { code: apiError.code });
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: apiError },
      {
        status: error instanceof AppError ? error.status : 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  }
}

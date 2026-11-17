import "server-only";

import PDFDocument from "pdfkit";

import { drawInvoice } from "@/features/orders/services/invoice-pdf.layout";
import type { InvoiceData } from "@/features/orders/types";

export async function renderInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margin: 44,
      bufferPages: true,
      info: {
        Title: invoice.invoiceNumber,
        Subject: `Invoice for order ${invoice.orderNumber}`,
      },
    });
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Uint8Array) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
    drawInvoice(document, invoice);
    document.end();
  });
}

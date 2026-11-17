import { siteConfig } from "@/config/site.config";
import type { InvoiceData } from "@/features/orders/types";
import {
  invoiceRule,
  margin,
  writeInvoiceText,
} from "@/features/orders/services/invoice-pdf.shared";

function sellerAddress(): string {
  const address = siteConfig.address;
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

export function drawInvoiceHeader(
  doc: PDFKit.PDFDocument,
  invoice: InvoiceData,
  continued: boolean,
): number {
  const right = doc.page.width - margin - 190;
  writeInvoiceText(doc, siteConfig.logo.wordmark, margin, 42, { width: 300 }, true);
  writeInvoiceText(doc, siteConfig.legalName, margin, 66, { width: 230, fontSize: 9 });
  writeInvoiceText(doc, sellerAddress(), margin, 82, { width: 230, fontSize: 8, lineGap: 2 });
  let sellerY = doc.y;
  if (siteConfig.tax.gstin) {
    writeInvoiceText(doc, `GSTIN: ${siteConfig.tax.gstin}`, margin, sellerY + 4, { fontSize: 8 });
    sellerY += 16;
  }
  if (siteConfig.tax.pan) {
    writeInvoiceText(doc, `PAN: ${siteConfig.tax.pan}`, margin, sellerY + 4, { fontSize: 8 });
  }

  writeInvoiceText(
    doc,
    continued ? "INVOICE (CONTINUED)" : "TAX INVOICE",
    right,
    42,
    { width: 190, align: "right", fontSize: 13 },
    true,
  );
  writeInvoiceText(
    doc,
    invoice.invoiceNumber,
    right,
    64,
    { width: 190, align: "right", fontSize: 10 },
    true,
  );
  writeInvoiceText(doc, `Order ${invoice.orderNumber}`, right, 82, {
    width: 190,
    align: "right",
    fontSize: 8,
  });
  writeInvoiceText(
    doc,
    `Date: ${invoice.placedAt.toLocaleDateString(siteConfig.locale, {
      timeZone: siteConfig.timezone,
    })}`,
    right,
    96,
    { width: 190, align: "right", fontSize: 8 },
  );
  const dividerY = Math.max(sellerY, doc.y) + 18;
  invoiceRule(doc, dividerY);
  return dividerY + 14;
}

export function drawInvoiceCustomer(
  doc: PDFKit.PDFDocument,
  invoice: InvoiceData,
  y: number,
): number {
  writeInvoiceText(doc, "Bill to / Ship to", margin, y, { fontSize: 9 }, true);
  const address = invoice.shippingAddress;
  const customerLines = [
    invoice.customerName,
    invoice.customerPhone,
    address.line1,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ];
  writeInvoiceText(doc, customerLines.join("\n"), margin, y + 15, {
    width: 270,
    fontSize: 8,
    lineGap: 2,
  });
  return Math.max(y + 72, doc.y + 14);
}

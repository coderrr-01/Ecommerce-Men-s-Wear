import { siteConfig } from "@/config/site.config";
import { amountInWords } from "@/features/orders/invoice.utils";
import type { InvoiceData } from "@/features/orders/types";
import { formatPrice } from "@/lib/utils";
import {
  columns,
  invoiceFont,
  invoiceRule,
  margin,
  writeInvoiceText,
} from "@/features/orders/services/invoice-pdf.shared";

export function drawInvoiceTableHeader(doc: PDFKit.PDFDocument, y: number) {
  const x = margin;
  writeInvoiceText(doc, "Item", x, y, { width: columns.description, fontSize: 8 }, true);
  writeInvoiceText(
    doc,
    "SKU",
    x + columns.description,
    y,
    { width: columns.sku, fontSize: 8 },
    true,
  );
  writeInvoiceText(
    doc,
    "Qty",
    x + columns.description + columns.sku,
    y,
    {
      width: columns.quantity,
      fontSize: 8,
      align: "right",
    },
    true,
  );
  writeInvoiceText(
    doc,
    "Unit",
    x + columns.description + columns.sku + columns.quantity,
    y,
    {
      width: columns.unit,
      fontSize: 8,
      align: "right",
    },
    true,
  );
  writeInvoiceText(
    doc,
    "Amount",
    x + columns.description + columns.sku + columns.quantity + columns.unit,
    y,
    { width: columns.total, fontSize: 8, align: "right" },
    true,
  );
  invoiceRule(doc, y + 16);
  return y + 22;
}

export function invoiceItemRowHeight(doc: PDFKit.PDFDocument, item: InvoiceData["items"][number]) {
  const description = `${item.name}\n${item.size} · ${item.color}`;
  doc.font(invoiceFont(description)).fontSize(8);
  return Math.max(26, doc.heightOfString(description, { width: columns.description }) + 8);
}

export function drawInvoiceItemRow(
  doc: PDFKit.PDFDocument,
  item: InvoiceData["items"][number],
  y: number,
): number {
  const height = invoiceItemRowHeight(doc, item);
  const x = margin;
  writeInvoiceText(doc, `${item.name}\n${item.size} · ${item.color}`, x, y + 3, {
    width: columns.description,
    fontSize: 8,
  });
  writeInvoiceText(doc, item.sku, x + columns.description, y + 3, {
    width: columns.sku,
    fontSize: 7,
  });
  writeInvoiceText(doc, String(item.quantity), x + columns.description + columns.sku, y + 3, {
    width: columns.quantity,
    align: "right",
    fontSize: 8,
  });
  writeInvoiceText(
    doc,
    formatPrice(item.price),
    x + columns.description + columns.sku + columns.quantity,
    y + 3,
    { width: columns.unit, align: "right", fontSize: 8 },
  );
  writeInvoiceText(
    doc,
    formatPrice(item.total),
    x + columns.description + columns.sku + columns.quantity + columns.unit,
    y + 3,
    { width: columns.total, align: "right", fontSize: 8 },
  );
  invoiceRule(doc, y + height);
  return y + height;
}

export function drawInvoiceTotals(doc: PDFKit.PDFDocument, invoice: InvoiceData, y: number) {
  const labelX = doc.page.width - margin - 205;
  const valueX = labelX + 105;
  const line = (label: string, value: string, strong = false) => {
    writeInvoiceText(doc, label, labelX, y, { width: 100, fontSize: strong ? 10 : 8 }, strong);
    writeInvoiceText(
      doc,
      value,
      valueX,
      y,
      { width: 100, align: "right", fontSize: strong ? 10 : 8 },
      strong,
    );
    y += strong ? 20 : 15;
  };
  line("Subtotal", formatPrice(invoice.subtotal));
  if (invoice.discountTotal) line("Discount", `- ${formatPrice(invoice.discountTotal)}`);
  line("Delivery", invoice.shippingTotal ? formatPrice(invoice.shippingTotal) : "Free");
  if (invoice.taxTotal) line(siteConfig.tax.label, formatPrice(invoice.taxTotal));
  invoiceRule(doc, y);
  y += 8;
  line("Total", formatPrice(invoice.grandTotal), true);
  writeInvoiceText(doc, `Amount in words: ${amountInWords(invoice.grandTotal)}`, margin, y + 4, {
    width: doc.page.width - margin * 2,
    fontSize: 8,
  });
  writeInvoiceText(
    doc,
    `Payment method: ${invoice.paymentMethod === "COD" ? "COD" : invoice.paymentMethod === "WHATSAPP" ? "WhatsApp order" : "Not recorded"}`,
    margin,
    doc.y + 8,
    { width: doc.page.width - margin * 2, fontSize: 8 },
  );
}

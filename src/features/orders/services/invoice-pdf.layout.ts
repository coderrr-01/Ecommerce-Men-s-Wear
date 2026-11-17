import type { InvoiceData } from "@/features/orders/types";
import {
  drawInvoiceCustomer,
  drawInvoiceHeader,
} from "@/features/orders/services/invoice-pdf.header";
import {
  drawInvoiceItemRow,
  drawInvoiceTableHeader,
  drawInvoiceTotals,
  invoiceItemRowHeight,
} from "@/features/orders/services/invoice-pdf.table";
import {
  margin,
  pageBottom,
  registerInvoiceFonts,
  writeInvoiceText,
} from "@/features/orders/services/invoice-pdf.shared";

export function drawInvoice(doc: PDFKit.PDFDocument, invoice: InvoiceData) {
  registerInvoiceFonts(doc);
  let y = drawInvoiceHeader(doc, invoice, false);
  y = drawInvoiceCustomer(doc, invoice, y);
  y = drawInvoiceTableHeader(doc, y);

  for (const item of invoice.items) {
    const rowHeight = invoiceItemRowHeight(doc, item);
    if (y + rowHeight > pageBottom) {
      doc.addPage();
      y = drawInvoiceHeader(doc, invoice, true);
      y = drawInvoiceTableHeader(doc, y);
    }
    y = drawInvoiceItemRow(doc, item, y);
  }

  if (y + 130 > pageBottom) {
    doc.addPage();
    y = drawInvoiceHeader(doc, invoice, true) + 10;
  }
  drawInvoiceTotals(doc, invoice, y + 10);
  const pages = doc.bufferedPageRange();
  for (let index = pages.start; index < pages.start + pages.count; index += 1) {
    doc.switchToPage(index);
    writeInvoiceText(doc, `${invoice.invoiceNumber} · ${index + 1} / ${pages.count}`, margin, 808, {
      width: doc.page.width - margin * 2,
      align: "right",
      fontSize: 7,
    });
  }
}

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import PDFDocument from "pdfkit";
import { describe, expect, it, vi } from "vitest";

import { drawInvoice } from "@/features/orders/services/invoice-pdf.layout";
import type { InvoiceData } from "@/features/orders/types";
import { formatPrice } from "@/lib/utils";

function sampleInvoice(count: number): InvoiceData {
  const items = Array.from({ length: count }, (_, index) => ({
    name: index === 0 ? "आरव પટેલ Cotton Shirt" : `Menswear item ${index + 1}`,
    sku: `DS-${index + 1}`,
    size: "M",
    color: "Navy",
    price: 129900,
    quantity: 1,
    total: 129900,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return {
    invoiceNumber: "INV-2026-0001",
    orderNumber: "DS-20261117-TEST",
    placedAt: new Date("2026-11-17T06:00:00.000Z"),
    customerName: "आरव પટેલ",
    customerPhone: "9876543210",
    shippingAddress: {
      fullName: "आरव પટેલ",
      phone: "9876543210",
      line1: "4 Test Society",
      city: "Ahmedabad",
      state: "Gujarat",
      postalCode: "380001",
      country: "IN",
    },
    items,
    subtotal,
    discountTotal: 0,
    shippingTotal: 9900,
    taxTotal: 0,
    grandTotal: subtotal + 9900,
    paymentMethod: "WHATSAPP",
  };
}

async function renderSample(count: number) {
  const doc = new PDFDocument({ size: "A4", margin: 44, bufferPages: true });
  const textCalls = vi.spyOn(doc, "text");
  const fontCalls = vi.spyOn(doc, "font");
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  drawInvoice(doc, sampleInvoice(count));
  doc.end();
  return { pdf: await finished, textCalls, fontCalls };
}

describe("invoice PDF generation", () => {
  it("embeds Unicode fonts, currency and item amounts in a multi-page PDF", async () => {
    const { pdf, textCalls, fontCalls } = await renderSample(35);
    const directory = await mkdtemp(path.join(tmpdir(), "diamond-invoice-"));
    let source: string;
    try {
      const file = path.join(directory, "sample-invoice.pdf");
      await writeFile(file, pdf);
      source = (await readFile(file)).toString("latin1");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
    const writtenText = textCalls.mock.calls
      .map(([text]) => (typeof text === "string" ? text : ""))
      .join("\n");
    const fontNames = fontCalls.mock.calls.map(([font]) => font);

    expect(source.startsWith("%PDF-")).toBe(true);
    expect(source.match(/\/Type\s*\/Page\b/g)?.length).toBeGreaterThan(1);
    expect(source).toContain("/ToUnicode");
    expect(writtenText).toContain("₹");
    expect(writtenText).toContain("INV-2026-0001");
    expect(writtenText).toContain("Thousand");
    expect(writtenText).toContain("Navy");
    expect(writtenText).toContain(formatPrice(sampleInvoice(35).grandTotal));
    expect(writtenText).toContain("आरव");
    expect(fontNames).toContain("NotoGujarati");
    expect(fontNames).toContain("NotoDevanagari");
  });
});

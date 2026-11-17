import path from "node:path";

const margin = 44;
const pageBottom = 790;
const columns = { description: 214, sku: 88, quantity: 38, unit: 78, total: 89 };

function fontFor(text: string, bold = false): string {
  if (/[\u0a80-\u0aff]/.test(text)) return "NotoGujarati";
  if (/[\u0900-\u097f]/.test(text)) return "NotoDevanagari";
  return bold ? "NotoSansBold" : "NotoSans";
}

function scriptSegments(text: string): string[] {
  return text.match(/[\u0a80-\u0aff]+|[\u0900-\u097f]+|[^\u0a80-\u0aff\u0900-\u097f]+/g) ?? [text];
}

export function registerInvoiceFonts(doc: PDFKit.PDFDocument) {
  const fontPath = (name: string) => path.join(process.cwd(), "assets", "fonts", name);
  doc.registerFont("NotoSans", fontPath("NotoSans-Regular.ttf"));
  doc.registerFont("NotoSansBold", fontPath("NotoSans-Bold.ttf"));
  doc.registerFont("NotoDevanagari", fontPath("NotoSansDevanagari-Regular.ttf"));
  doc.registerFont("NotoGujarati", fontPath("NotoSansGujarati-Regular.ttf"));
}

export function invoiceFont(text: string): string {
  return fontFor(text);
}

export function writeInvoiceText(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  options: PDFKit.Mixins.TextOptions & { fontSize?: number } = {},
  bold = false,
) {
  const { fontSize = 9, ...textOptions } = options;
  const segments = scriptSegments(text);
  segments.forEach((segment, index) => {
    doc.font(fontFor(segment, bold)).fontSize(fontSize);
    if (index === 0) {
      doc.text(segment, x, y, { ...textOptions, continued: index < segments.length - 1 });
    } else {
      doc.text(segment, { continued: index < segments.length - 1 });
    }
  });
}

export function invoiceRule(doc: PDFKit.PDFDocument, y: number) {
  doc
    .moveTo(margin, y)
    .lineTo(doc.page.width - margin, y)
    .strokeColor("#cfd6e0")
    .stroke();
}

export { columns, margin, pageBottom };

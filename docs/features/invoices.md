# Invoices

## Availability and access

`GET /api/orders/{orderNumber}/invoice` returns a private, no-store PDF once an order is confirmed.
ADMIN/STAFF can download any invoice. A signed-in customer must own the order. A guest must provide
the high-entropy order token as `?token=...`. Non-owned and missing order numbers both return 404.
Cancelled orders are eligible only if stock had previously been committed.

Invoice numbers use the configured prefix and order year (for example `INV-2026-0001`). A
year-specific `InvoiceSequence` counter and the unique order number field are updated in one
serializable transaction. Retries reuse an existing assignment; a failed transaction consumes no
number.

## PDF content and configuration

PDFKit renders the invoice server-side on the Node.js runtime. The PDF includes the configured
wordmark, legal name/address, GSTIN/PAN when supplied, customer delivery details, order snapshots,
SKU/size/colour/quantity, subtotal, discount, shipping, tax, total, amount in Indian English words
and payment method. Money remains integer paise until formatted for display.

Edit `src/config/site.config.ts` before issuing invoices:

- `legalName` and `address.line1`, `line2`, `city`, `state`, `postalCode`, `country`
- `tax.gstin` and `tax.pan`
- `invoice.prefix` (2–8 uppercase letters/digits; default `INV`)
- `logo.wordmark` for the invoice wordmark

PDF fonts are bundled under `assets/fonts/` from the Noto Fonts repository under SIL OFL 1.1.
Regular/bold Noto Sans covers Latin and rupee characters, and Noto Sans Devanagari/Gujarati provide
Hindi/Gujarati fallback runs. The invoice endpoint uses Node.js; `pdfkit` is externalized and font
assets are explicitly included through `outputFileTracingIncludes`. Vercel runtime behavior still
requires verification after deployment.

## Limitations

The invoice records the order totals and payment method (`WhatsApp order` for the current flow); it
does not imply payment collection. The schema supports a `COD` invoice label, but COD checkout is
not part of this phase. GSTIN/PAN are omitted from the PDF when their config values are blank.
Existing orders without status-history rows show inferred current progress without fabricated
timestamps.

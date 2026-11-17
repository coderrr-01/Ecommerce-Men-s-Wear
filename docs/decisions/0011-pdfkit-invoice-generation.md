# ADR 0011: PDFKit for server-side invoice PDFs

- Status: Accepted
- Date: 2026-11-17

## Context

Phase 5 invoices must be generated on the server, support multi-page item tables, run in Vercel
Node.js functions, and correctly render the rupee symbol and Indian-script customer names. The
repository had no PDF package.

## Decision

Use `pdfkit` with the separately approved `@types/pdfkit` type package. Keep the invoice route on
the Node.js runtime, externalize PDFKit through Next.js `serverExternalPackages`, and explicitly
trace the bundled fonts. Use Noto Sans regular/bold plus Devanagari and Gujarati regular faces under
the SIL Open Font License 1.1. Use the existing configured wordmark as the invoice logo.

## Alternatives

- `pdf-lib` was rejected. Its package metadata reported about 19.5 MB unpacked compared with
  PDFKit's about 10.5 MB; its drawing APIs also require more manual pagination/layout work for this
  invoice.
- Headless Chrome/Puppeteer was rejected because it adds a browser binary/runtime and is a poor fit
  for lightweight serverless PDF generation.

## Consequences

PDFKit's streaming/layout API keeps document generation in Node without a browser process. The
font assets increase the deployment footprint, so Next output tracing includes them explicitly.
Hindi and Gujarati font fallback is tested locally; Vercel file tracing/runtime behavior can only
be confirmed after deployment.

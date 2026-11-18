export type CspMode = "report-only" | "enforce" | "off";

export function readCspMode(value = process.env.CSP_MODE): CspMode {
  if (!value) return "report-only";
  if (value === "report-only" || value === "enforce" || value === "off") return value;
  throw new Error("CSP_MODE must be report-only, enforce, or off.");
}

export function buildContentSecurityPolicy(
  nonce: string,
  { development = false, reportEndpoint = "/api/security/csp-report" } = {},
): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://picsum.photos",
    "font-src 'self' data:",
    `connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com${development ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `report-uri ${reportEndpoint}`,
  ].join("; ");
}

import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

function reportOrigin(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    return new URL(value).origin.slice(0, 200);
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return new NextResponse(null, { status: 204 });
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 8_192) {
      await reader.cancel();
      return new NextResponse(null, { status: 413 });
    }
    chunks.push(value);
  }
  const payload = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    payload.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const body = new TextDecoder().decode(payload);
  try {
    const report = JSON.parse(body) as Record<string, unknown>;
    const entry = report["csp-report"] ?? report;
    if (entry && typeof entry === "object") {
      const data = entry as Record<string, unknown>;
      logger.warn("security.csp_violation", {
        directive: String(data["violated-directive"] ?? data["effectiveDirective"] ?? "").slice(
          0,
          120,
        ),
        blockedOrigin: reportOrigin(data["blocked-uri"] ?? data["blockedURL"]),
        disposition: String(data["disposition"] ?? "").slice(0, 40),
      });
    }
  } catch {
    logger.warn("security.csp_report_invalid", { bytes: body.length });
  }
  return new NextResponse(null, { status: 204 });
}

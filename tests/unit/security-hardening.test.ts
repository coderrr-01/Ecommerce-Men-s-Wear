import { describe, expect, it } from "vitest";

import {
  hashPasswordResetToken,
  isPasswordResetTokenFormatValid,
  isPasswordResetTokenUsable,
} from "@/features/auth/password-reset.utils";
import {
  exceedsRateLimit,
  rateLimitError,
  rateLimitKey,
  rateLimitWindow,
} from "@/features/security/rate-limit.utils";
import { buildContentSecurityPolicy, readCspMode } from "@/lib/security/csp";

describe("security hardening utilities", () => {
  it("hashes reset tokens and rejects malformed, expired, or used tokens", () => {
    expect(hashPasswordResetToken("token")).toBe(hashPasswordResetToken("token"));
    expect(hashPasswordResetToken("token")).not.toBe("token");
    expect(isPasswordResetTokenFormatValid("a".repeat(43))).toBe(true);
    expect(isPasswordResetTokenFormatValid("short")).toBe(false);
    const now = new Date("2026-01-01T00:00:00Z");
    expect(
      isPasswordResetTokenUsable({ usedAt: null, expiresAt: new Date(now.getTime() + 1) }, now),
    ).toBe(true);
    expect(isPasswordResetTokenUsable({ usedAt: null, expiresAt: now }, now)).toBe(false);
    expect(
      isPasswordResetTokenUsable({ usedAt: now, expiresAt: new Date(now.getTime() + 1) }, now),
    ).toBe(false);
  });

  it("uses fixed rate windows, opaque keys, and actionable retry timing", () => {
    const now = new Date("2026-01-01T00:03:20Z");
    expect(rateLimitWindow(now, 60_000).toISOString()).toBe("2026-01-01T00:03:00.000Z");
    expect(rateLimitKey("login", "user@example.test")).not.toContain("user@example.test");
    expect(rateLimitError(new Date(now.getTime() + 90_000), now).message).toContain("2 minutes");
    expect(exceedsRateLimit(5, 5)).toBe(false);
    expect(exceedsRateLimit(6, 5)).toBe(true);
  });

  it("defaults CSP to report-only and includes required storefront sources", () => {
    expect(readCspMode(undefined)).toBe("report-only");
    const policy = buildContentSecurityPolicy("nonce", { development: false });
    expect(policy).toContain("'nonce-nonce'");
    expect(policy).toContain("https://res.cloudinary.com");
    expect(policy).toContain("style-src-attr 'unsafe-inline'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toContain("images.unsplash.com");
    expect(buildContentSecurityPolicy("nonce", { development: true, demoAssets: true })).toContain(
      "images.unsplash.com",
    );
  });
});

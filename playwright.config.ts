import "dotenv/config";

import { defineConfig } from "@playwright/test";

const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Set E2E_DATABASE_URL to a dedicated test database before running E2E tests.");
}
const configuredDatabaseUrl = process.env.DATABASE_URL;
if (!configuredDatabaseUrl) {
  throw new Error("DATABASE_URL must be set so E2E can verify it uses a separate database.");
}
if (process.env.NODE_ENV === "production") {
  throw new Error("Playwright E2E tests cannot run with NODE_ENV=production.");
}

const target = new URL(databaseUrl);
const databaseName = decodeURIComponent(target.pathname.replace(/^\/+/, "")).toLowerCase();
if (!/(^|[-_])(e2e|test)([-_]|$)/.test(databaseName)) {
  throw new Error("E2E_DATABASE_URL database name must clearly identify a test database.");
}

const configured = new URL(configuredDatabaseUrl);
const configuredDatabaseName = decodeURIComponent(
  configured.pathname.replace(/^\/+/, ""),
).toLowerCase();
const sameDatabase =
  configured.hostname === target.hostname &&
  configured.port === target.port &&
  configuredDatabaseName === databaseName;
if (sameDatabase) throw new Error("E2E_DATABASE_URL must not point at DATABASE_URL.");

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3100",
    url: `${baseURL}/api/health`,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      AUTH_URL: baseURL,
      AUTH_SECRET: process.env.E2E_AUTH_SECRET ?? "e2e-only-secret-never-use-in-production",
      NEXT_PUBLIC_SITE_URL: baseURL,
      CSP_MODE: "report-only",
      EMAIL_PROVIDER: "console",
    },
  },
});

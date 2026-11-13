import { describe, expect, it } from "vitest";

import { hasRole } from "@/features/auth/role.utils";

describe("admin role guard", () => {
  it("allows administrators and staff", () => {
    expect(hasRole({ role: "ADMIN" }, ["ADMIN", "STAFF"])).toBe(true);
    expect(hasRole({ role: "STAFF" }, ["ADMIN", "STAFF"])).toBe(true);
  });

  it("denies customers and unauthenticated users", () => {
    expect(hasRole({ role: "CUSTOMER" }, ["ADMIN", "STAFF"])).toBe(false);
    expect(hasRole(null, ["ADMIN", "STAFF"])).toBe(false);
  });

  it("restricts administrator-only actions", () => {
    expect(hasRole({ role: "STAFF" }, ["ADMIN"])).toBe(false);
    expect(hasRole({ role: "ADMIN" }, ["ADMIN"])).toBe(true);
  });
});

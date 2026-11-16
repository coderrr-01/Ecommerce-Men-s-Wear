import { describe, expect, it } from "vitest";

import { suggestSize } from "@/features/catalog/size-recommendation";

describe("size suggestions", () => {
  it("suggests the nearest available letter size and accounts for preferred fit", () => {
    const sizes = ["S", "M", "L", "XL"];

    expect(suggestSize(175, 70, "regular", sizes)).toBe("M");
    expect(suggestSize(175, 70, "relaxed", sizes)).toBe("L");
  });

  it("does not make a suggestion for unsupported ranges or invalid measurements", () => {
    expect(suggestSize(175, 70, "regular", ["28", "30", "32"])).toBeNull();
    expect(suggestSize(300, 70, "regular", ["S", "M", "L"])).toBeNull();
  });
});

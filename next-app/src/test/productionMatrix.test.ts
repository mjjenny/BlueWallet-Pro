import { describe, expect, it } from "vitest";
import { PRODUCTION_BROWSER_MATRIX, PRODUCTION_TEST_AREAS } from "./productionMatrix";

describe("production browser matrix", () => {
  it("covers the required release platforms", () => {
    const names = PRODUCTION_BROWSER_MATRIX.map((item) => `${item.platform} ${item.browser}`);

    expect(names).toContain("iOS Safari");
    expect(names).toContain("iPadOS Safari");
    expect(names).toContain("Android Chrome");
    expect(names).toContain("Windows Chrome");
    expect(names).toContain("Windows Edge");
    expect(names).toContain("macOS Safari");
    expect(names).toContain("macOS Chrome");
  });

  it("keeps every required test area represented", () => {
    const covered = new Set(PRODUCTION_BROWSER_MATRIX.flatMap((item) => item.areas));

    for (const area of PRODUCTION_TEST_AREAS) {
      expect(covered.has(area)).toBe(true);
    }
  });
});

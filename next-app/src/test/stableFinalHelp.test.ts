import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readStableApp(): string {
  return readFileSync(path.join(repoRoot, "legacy-root-pwa.html"), "utf8");
}

describe("stable final Help section", () => {
  it("documents the final build feature set and support boundaries", () => {
    const html = readStableApp();

    expect(html).toContain("offline-first and local-only");
    expect(html).toContain("VIBGYOR appearance themes");
    expect(html).toContain("Ocean Blue remains the default stable appearance");
    expect(html).toContain("Search is wallet-wide when a query is entered");
    expect(html).toContain("OpenCV contour analysis is skipped for browser stability");
    expect(html).toContain("keeps fields unchanged, and leaves Dismiss/Retry available");
    expect(html).toContain("SHA-256 integrity before import");
    expect(html).toContain("Release readiness");
    expect(html).toContain("Real device QA pack");
    expect(html).toContain("iOS Safari, Android Chrome, Windows Chrome, and Windows Edge");
    expect(html).toContain("Encrypted Sync Vault");
    expect(html).toContain("The full wallet is encrypted locally before upload");
    expect(html).toContain("desktop and mobile sync automatically");
  });

  it("keeps Help and Appearance controls responsive without horizontal scrolling", () => {
    const html = readStableApp();

    expect(html).toContain(".help-tabs {\n      display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));");
    expect(html).toContain(".help-tabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }");
    expect(html).toContain(".settings-sheet");
    expect(html).toContain("max-width: min(760px, calc(100vw - 24px));");
    expect(html).toContain(".theme-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }");
    expect(html).toContain(".theme-grid { grid-template-columns: 1fr; }");
  });
});

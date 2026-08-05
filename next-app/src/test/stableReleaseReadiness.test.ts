import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function stableHtml(): string {
  return readFileSync(path.join(repoRoot, "legacy-root-pwa.html"), "utf8");
}

describe("stable real-device QA and release readiness", () => {
  it("adds a local-only real device QA pack with exportable evidence notes", () => {
    const html = stableHtml();

    expect(html).toContain('id="btn-real-device-qa"');
    expect(html).toContain("const REAL_DEVICE_QA_KEY = 'bwRealDeviceQa';");
    expect(html).toContain("iOS Safari camera permission");
    expect(html).toContain("Android Chrome camera and install");
    expect(html).toContain("Windows Edge PWA and backup");
    expect(html).toContain("function exportRealDeviceQaNote()");
    expect(html).toContain("blue-wallet-real-device-qa-");
  });

  it("adds a release readiness panel that blocks release until required checks pass", () => {
    const html = stableHtml();

    expect(html).toContain('id="btn-release-readiness"');
    expect(html).toContain("function releaseReadinessStatus()");
    expect(html).toContain("Real-device QA pack complete");
    expect(html).toContain("Current backup exported");
    expect(html).toContain("PIN protection configured");
    expect(html).toContain("No expired documents");
    expect(html).toContain("Core joining documents present");
    expect(html).toContain("Document quality/risk reviewed");
    expect(html).toContain("Release not ready");
    expect(html).toContain("blue-wallet-release-readiness-");
  });
});

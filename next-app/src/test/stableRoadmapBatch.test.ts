import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readRootFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

describe("stable roadmap batch 2-19", () => {
  it("adds reminder center, recovery, quality, and manual reminder surfaces", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain('id="btn-reminder-center"');
    expect(html).toContain('id="btn-offline-recovery"');
    expect(html).toContain('id="doc-reminder-note"');
    expect(html).toContain('id="doc-q-readable"');
    expect(html).toContain('id="doc-q-verified"');
    expect(html).toContain("function buildReminderCenterHtml()");
    expect(html).toContain("function buildOfflineRecoveryHtml()");
  });

  it("keeps advanced search, quality risk, and missing-document helpers guarded", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("function queryMatchesDoc(doc, query)");
    expect(html).toContain("status:expired");
    expect(html).toContain("missing-scan");
    expect(html).toContain("quality:unchecked");
    expect(html).toContain("function missingJoiningDocs()");
    expect(html).toContain("function joiningRisk(doc)");
  });

  it("guards duplicate detection, version history, restore preview, and bulk tools", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("Possible duplicate document found");
    expect(html).toContain("Version-history entries");
    expect(html).toContain("previousHistory");
    expect(html).toContain('id="bulk-tag"');
    expect(html).toContain('id="bulk-pack"');
    expect(html).toContain("pack-created-from-selection");
  });

  it("extends export and share summaries without attaching scans", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("Quality,Risk,Reminder note");
    expect(html).toContain("No scans or document files are attached by this summary.");
    expect(html).toContain("Missing joining docs:");
  });
});

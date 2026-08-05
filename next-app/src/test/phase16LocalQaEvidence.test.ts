import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readRepoFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

describe("phase 16 local QA evidence guardrails", () => {
  it("keeps the manual QA tracker blocked until real evidence is supplied", () => {
    const tracker = readRepoFile(path.join("docs", "PHASE-15-EVIDENCE-TRACKER.md"));
    const execution = readRepoFile(path.join("docs", "PHASE-15-MANUAL-QA-EXECUTION.md"));

    for (const id of [
      "QA-IOS-SAFARI",
      "QA-IPADOS-SAFARI",
      "QA-ANDROID-CHROME",
      "QA-WIN-CHROME",
      "QA-WIN-EDGE",
      "QA-MAC-SAFARI",
      "QA-MAC-CHROME",
    ]) {
      expect(tracker).toContain(`| ${id} |`);
    }

    expect(tracker).toContain("Do not change a row from `Not Started` unless real evidence is available.");
    expect(tracker).toContain("Release status: blocked.");
    expect(execution).toContain("Phase 15 does not create the `v1.0.0` tag.");
    expect(execution).toContain("Current release decision: blocked.");
  });

  it("keeps every required release gate in the tracker as not started", () => {
    const tracker = readRepoFile(path.join("docs", "PHASE-15-EVIDENCE-TRACKER.md"));

    for (const gate of [
      "GATE-ROOT-CUTOVER",
      "GATE-INSTALL-OFFLINE",
      "GATE-SERVICE-WORKER",
      "GATE-VAULT",
      "GATE-WRONG-PIN",
      "GATE-BACKUP",
      "GATE-KEY-ROTATION",
      "GATE-OCR-IMAGE",
      "GATE-PDF-FALLBACK",
      "GATE-SEA-SERVICE",
      "GATE-ROLLBACK",
      "GATE-NO-LEGACY-WRITE",
    ]) {
      const row = tracker.split("\n").find((line) => line.startsWith(`| ${gate} |`));
      expect(row).toBeTruthy();
      expect(row).toContain("| Not Started |");
    }
  });

  it("keeps the legacy database adapter read-only", () => {
    const legacyDatabase = readRepoFile(path.join("next-app", "src", "legacy", "legacyDatabase.ts"));

    expect(legacyDatabase).toContain('export const LEGACY_DATABASE_NAME = "SeafarerWalletDB";');
    expect(legacyDatabase).toContain('db.transaction(LEGACY_OBJECT_STORES.documents, "readonly")');
    expect(legacyDatabase).toContain('db.transaction(LEGACY_OBJECT_STORES.profile, "readonly")');
    expect(legacyDatabase).toContain("indexedDB.databases() is unavailable; opening would create a database");
    expect(legacyDatabase).not.toContain('"readwrite"');
    expect(legacyDatabase).not.toContain("put(");
    expect(legacyDatabase).not.toContain("add(");
    expect(legacyDatabase).not.toContain("delete(");
    expect(legacyDatabase).not.toContain("clear(");
  });
});

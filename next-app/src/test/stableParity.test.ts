import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readRepoFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

describe("phase 18 stable app parity guardrails", () => {
  it("keeps the stable ocean and helm animation markers in the React shell", () => {
    const css = readRepoFile(path.join("next-app", "src", "App.css"));
    const shell = readRepoFile(path.join("next-app", "src", "features", "react-wallet", "ReactWalletShell.tsx"));

    expect(shell).toContain("stable-ocean-background");
    expect(shell).toContain("stable-helm-mark");
    expect(shell).toContain("THE BLUE WALLET");
    expect(css).toContain(".ocean-bg .w1");
    expect(css).toContain("@keyframes waveMove");
    expect(css).toContain("@keyframes helmSpin3d");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("keeps the scanner modal on the stable three-panel review layout", () => {
    const css = readRepoFile(path.join("next-app", "src", "App.css"));
    const scanner = readRepoFile(path.join("next-app", "src", "features", "scanner", "ScannerWorkflow.tsx"));

    expect(scanner).toContain("Capture");
    expect(scanner).toContain("OCR review");
    expect(scanner).toContain("Review before save");
    expect(css).toContain("grid-template-columns: minmax(220px, 0.8fr) minmax(260px, 1fr) minmax(300px, 1.15fr)");
    expect(css).toContain(".scanner-panel textarea");
    expect(css).toContain(".modal-backdrop {\n  z-index: 60;");
  });

  it("keeps the legacy database adapter read-only during parity rescue", () => {
    const legacyDatabase = readRepoFile(path.join("next-app", "src", "legacy", "legacyDatabase.ts"));

    expect(legacyDatabase).toContain('export const LEGACY_DATABASE_NAME = "SeafarerWalletDB";');
    expect(legacyDatabase).toContain('db.transaction(LEGACY_OBJECT_STORES.documents, "readonly")');
    expect(legacyDatabase).toContain('db.transaction(LEGACY_OBJECT_STORES.profile, "readonly")');
    expect(legacyDatabase).not.toContain('"readwrite"');
    expect(legacyDatabase).not.toContain("put(");
    expect(legacyDatabase).not.toContain("add(");
    expect(legacyDatabase).not.toContain("delete(");
    expect(legacyDatabase).not.toContain("clear(");
  });
});

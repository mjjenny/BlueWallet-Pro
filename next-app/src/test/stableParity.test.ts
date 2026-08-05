import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readRepoFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

describe("stable app visual parity guardrails", () => {
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
    expect(css).toContain("body:has(.modal-backdrop)");
    expect(css).toContain("scrollbar-color: rgba(94, 212, 255, 0.42)");
  });

  it("keeps the scanner modal on the stable three-panel review layout without page-like overflow", () => {
    const css = readRepoFile(path.join("next-app", "src", "App.css"));
    const scanner = readRepoFile(path.join("next-app", "src", "features", "scanner", "ScannerWorkflow.tsx"));

    expect(scanner).toContain("Capture");
    expect(scanner).toContain("OCR review");
    expect(scanner).toContain("Review before save");
    expect(css).toContain("grid-template-columns: minmax(220px, 0.8fr) minmax(260px, 1fr) minmax(300px, 1.15fr)");
    expect(css).toContain(".scanner-panel textarea");
    expect(css).toContain(".modal-backdrop {\n  z-index: 60;");
    expect(css).toContain(".scanner-modal {\n  width: min(1180px, 100%);");
    expect(css).toContain("max-height: min(760px, calc(100svh - 32px");
    expect(css).toContain("scrollbar-gutter: stable");
    expect(css).toContain(".details-body {\n  min-height: 0;\n  overflow: auto;");
  });

  it("keeps stable feature surfaces available in the React wallet shell", () => {
    const shell = readRepoFile(path.join("next-app", "src", "features", "react-wallet", "ReactWalletShell.tsx"));

    expect(shell).toContain("Scan document");
    expect(shell).toContain("Create document");
    expect(shell).toContain("Export backup");
    expect(shell).toContain("Restore encrypted backup");
    expect(shell).toContain("MaritimeToolkit");
    expect(shell).toContain("MigrationWizard");
    expect(shell).toContain("This wizard detects and explains legacy data only");
    expect(shell).toContain("SeafarerWalletDB");
  });

  it("keeps mobile parity rules for the compact stable top bar and category rail", () => {
    const css = readRepoFile(path.join("next-app", "src", "App.css"));

    expect(css).toContain(".category-nav::-webkit-scrollbar");
    expect(css).toContain(".stable-topbar .badge-info {\n    display: none;");
    expect(css).toContain(".brand-copy p {\n    display: none;");
    expect(css).toContain(".scanner-grid {\n    grid-template-columns: 1fr;");
    expect(css).toContain(".security-form {\n    grid-template-columns: 1fr;");
    expect(css).toContain("overflow-wrap: anywhere");
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

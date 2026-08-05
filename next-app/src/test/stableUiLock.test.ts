import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

const STABLE_CSS_SHA256 = "e6dcf47a25d8b11a7daca39006984b090142e8898e933588d0018aad7bc92aab";
const STABLE_LAYOUT_MARKERS_SHA256 = "ceb7d452bcb9d78e347140e99ccde060d011b374aa739b827e2c804ae5b63415";

const STABLE_LAYOUT_MARKERS = [
  "ocean-bg",
  "topbar",
  "brand-mark",
  "profile-strip",
  "cats",
  "docs",
  "modal",
  "fab",
  "helmSpin3d",
  "waveMove",
] as const;

function readRootFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function stableCss(html: string): string {
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!match?.[1]) throw new Error("Stable app style block is missing");
  return match[1];
}

function countMarker(input: string, marker: string): number {
  return input.split(marker).length - 1;
}

function layoutMarkerSignature(html: string): string {
  return STABLE_LAYOUT_MARKERS.map((marker) => `${marker}:${countMarker(html, marker)}`).join("\n");
}

describe("stable app UI lock", () => {
  it("keeps the stable production entry and PWA routing locked", () => {
    const rootIndex = readRootFile("index.html");
    const manifest = JSON.parse(readRootFile("manifest.json")) as { start_url: string };
    const worker = readRootFile("service-worker.js");

    expect(rootIndex).toContain("./legacy-root-pwa.html");
    expect(rootIndex).not.toContain("./react-app/index.html");
    expect(manifest.start_url).toBe("./legacy-root-pwa.html?v=stable");
    expect(worker).toContain("blue-wallet-stable-rollback-v0.2");
    expect(worker).toContain('caches.match("./legacy-root-pwa.html")');
  });

  it("keeps the stable visual CSS, animation, and layout markers unchanged", () => {
    const stableHtml = readRootFile("legacy-root-pwa.html");

    expect(sha256(stableCss(stableHtml))).toBe(STABLE_CSS_SHA256);
    expect(sha256(layoutMarkerSignature(stableHtml))).toBe(STABLE_LAYOUT_MARKERS_SHA256);
  });

  it("keeps every category tab visible in one row without horizontal scrolling", () => {
    const css = stableCss(readRootFile("legacy-root-pwa.html"));

    expect(css).toContain("overflow-x: hidden");
    expect(css).toContain("scrollbar-width: none");
    expect(css).toContain(".cat {\n      display: flex; align-items: center; justify-content: center; gap: 5px;\n      flex: 1 1 0; min-width: 0;");
  });
});

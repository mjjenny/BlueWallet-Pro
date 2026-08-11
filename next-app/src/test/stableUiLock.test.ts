import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

const STABLE_CSS_SHA256 = "96173701543955b3e7783c6269305d71d97f78b734fc206d20f213d1b83c2c70";
const STABLE_LAYOUT_MARKERS_SHA256 = "eefdab3767038c177f14c39740020229999fc823a28b394d6eca94c84892e007";

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
  "offline-pill-live",
  "mobile-bottom-nav",
  "s-expired",
  "s-valid",
] as const;

function readRootFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

function normalizeLines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function stableCss(html: string): string {
  const match = normalizeLines(html).match(/<style>([\s\S]*?)<\/style>/);
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
    expect(worker).toContain("blue-wallet-stable-rollback-v0.22");
    expect(worker).toContain('caches.match("./legacy-root-pwa.html")');
  });

  it("keeps the offline fallback pointed at the stable app", () => {
    const offline = readRootFile("offline.html");

    expect(offline).toContain("stable wallet");
    expect(offline).toContain("./legacy-root-pwa.html");
    expect(offline).not.toContain("React vault");
    expect(offline).not.toContain("./react-app/index.html");
  });

  it("keeps the stable visual CSS, animation, and layout markers unchanged", () => {
    const stableHtml = readRootFile("legacy-root-pwa.html");

    expect(sha256(stableCss(stableHtml))).toBe(STABLE_CSS_SHA256);
    expect(sha256(layoutMarkerSignature(stableHtml))).toBe(STABLE_LAYOUT_MARKERS_SHA256);
  });

  it("keeps every category tab visible in one row without horizontal scrolling", () => {
    const css = stableCss(readRootFile("legacy-root-pwa.html"));
    const html = readRootFile("legacy-root-pwa.html");

    expect(css).toContain("overflow-x: hidden");
    expect(css).toContain("scrollbar-width: none");
    expect(css).toContain(".cat {\n      display: flex; align-items: center; justify-content: center; gap: 5px;\n      flex: 1 1 0; min-width: 0;");
    expect(css).toContain("content: attr(data-short);");
    expect(css).toContain("@media (max-width: 1023.99px)");
    expect(css).toContain(".cat-n { display: none; }");
    expect(css).toContain(".cat-name::after { content: none; }");
    expect(css).toContain(".cat-n { display: grid; font-size: 11px; min-width: 18px; height: 18px; }");
    expect(html).toContain('data-short="PPT"');
    expect(html).toContain('data-short="CRT"');
    expect(html).toContain('data-short="OTH"');
    expect(html).toContain('data-short="CTR"');
  });

  it("keeps tools readable without horizontal scrolling and search full-width below", () => {
    const css = stableCss(readRootFile("legacy-root-pwa.html"));

    expect(css).toContain("grid-template-columns: repeat(3, minmax(0, 1fr));");
    expect(css).toContain("grid-template-columns: repeat(6, minmax(0, 1fr));");
    expect(css).toContain("grid-template-columns: repeat(13, minmax(0, 1fr));");
    expect(css).toContain("overflow-x: hidden");
    expect(css).toContain(".search-box {\n      grid-column: 1 / -1;\n      order: 2;");
    expect(css).toContain(".tool-select, .tool-btn {\n      min-width: 0;\n      width: 100%;\n      order: 1;");
    expect(css).toContain(".view-toggle {\n      display: grid;\n      grid-template-columns: 1fr 1fr;");
    expect(css).toContain("min-height: 44px;");
  });

  it("keeps document viewing space at a 70/30 scan-to-quality split", () => {
    const css = stableCss(readRootFile("legacy-root-pwa.html"));
    const html = readRootFile("legacy-root-pwa.html");

    expect(css).toContain(".view-split");
    expect(css).toContain("grid-template-columns: minmax(0, 7fr) minmax(220px, 3fr);");
    expect(css).toContain(".view-files");
    expect(css).toContain(".view-details");
    expect(html).toContain("split.className = 'view-split';");
    expect(html).toContain("filePane.className = 'view-files';");
    expect(html).toContain("details.className = 'view-details';");
  });

  it("keeps expanded appearance themes inside the locked settings surface", () => {
    const css = stableCss(readRootFile("legacy-root-pwa.html"));
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain('id="theme-grid"');
    ["violet", "indigo", "ocean", "current", "yellow", "sunset", "red", "night", "aurora"].forEach((theme) => {
      expect(html).toContain(`data-theme-choice="${theme}"`);
    });
    expect(html).toContain("const THEME_CHOICES = ['violet', 'indigo', 'ocean', 'current', 'yellow', 'sunset', 'red', 'night', 'aurora'];");
    expect(html).toContain("localStorage.setItem('bwTheme', t);");
    expect(html).toContain("VIBGYOR violet");
    expect(html).toContain("VIBGYOR indigo");
    expect(html).toContain("VIBGYOR blue");
    expect(html).toContain("VIBGYOR green");
    expect(html).toContain("VIBGYOR yellow");
    expect(html).toContain("VIBGYOR orange");
    expect(html).toContain("VIBGYOR red");
    expect(css).toContain('html[data-theme="violet"]');
    expect(css).toContain('html[data-theme="indigo"]');
    expect(css).toContain('html[data-theme="aurora"]');
    expect(css).toContain('html[data-theme="sunset"]');
    expect(css).toContain('html[data-theme="current"]');
    expect(css).toContain('html[data-theme="yellow"]');
    expect(css).toContain('html[data-theme="red"]');
    expect(css).toContain(".theme-grid");
    expect(css).toContain(".theme-choice.is-active");
  });
});

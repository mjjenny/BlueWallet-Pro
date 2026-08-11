import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readRootFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

function quotedValues(input: string): string[] {
  return Array.from(input.matchAll(/"([^"]+)"/g)).map((match) => match[1] ?? "");
}

describe("stable production rollback contract", () => {
  it("launches the stable wallet from the root PWA entry", () => {
    const rootIndex = readRootFile("index.html");

    expect(rootIndex).toContain("./legacy-root-pwa.html");
    expect(rootIndex).toContain("service-worker.js");
    expect(existsSync(path.join(repoRoot, "legacy-root-pwa.html"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "react-app", "index.html"))).toBe(true);
  });

  it("has generated React assets committed and referenced by the React app shell", () => {
    const reactIndex = readRootFile(path.join("react-app", "index.html"));
    const assetRefs = quotedValues(reactIndex).filter((value) => value.startsWith("./assets/"));

    expect(assetRefs.length).toBeGreaterThanOrEqual(2);
    for (const ref of assetRefs) {
      expect(existsSync(path.join(repoRoot, "react-app", ref.replace("./", "")))).toBe(true);
    }
  });

  it("starts installed PWAs at the stable wallet URL", () => {
    const manifest = JSON.parse(readRootFile("manifest.json")) as { start_url: string; name: string };

    expect(manifest.name).toContain("THE BLUE WALLET");
    expect(manifest.start_url).toBe("./legacy-root-pwa.html?v=stable");
  });

  it("uses the stable service worker cache version and offline fallback", () => {
    const worker = readRootFile("service-worker.js");

    expect(worker).toContain("blue-wallet-stable-rollback-v0.23");
    expect(worker).toContain("./legacy-root-pwa.html");
    expect(worker).toContain("./offline.html");
    expect(worker).toContain("keys.filter((key) => key !== CACHE_VERSION)");
    expect(worker).toContain("caches.delete(key)");
    expect(worker.indexOf('caches.match("./legacy-root-pwa.html")')).toBeLessThan(worker.indexOf('caches.match("./offline.html")'));
  });

  it("keeps the in-app update prompt wired to the live service worker version", () => {
    const html = readRootFile("legacy-root-pwa.html");
    const worker = readRootFile("service-worker.js");

    expect(html).toContain("const APP_CACHE_VERSION = 'blue-wallet-stable-rollback-v0.23'");
    expect(html).toContain("checkForAppUpdate");
    expect(html).toContain("service-worker.js?update-check=");
    expect(html).toContain("New Blue Wallet update available.");
    expect(html).toContain("applyAppUpdate");
    expect(worker).toContain('const CACHE_VERSION = "blue-wallet-stable-rollback-v0.23"');
  });

  it("supports OCR for both image scans and PDF pages", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("PDF_OCR_MAX_PAGES");
    expect(html).toContain("PDF_OCR_SCALE");
    expect(html).toContain("loadPdfJs");
    expect(html).toContain("pdf.worker.min.mjs");
    expect(html).toContain("renderPdfPagesForOcr");
    expect(html).toContain("collectOcrPages");
    expect(html).toContain("getOcrWorker");
    expect(html).toContain("Attach an image scan or PDF first.");
    expect(html).toContain("PDF pages are rendered inside the browser first");
    expect(html).not.toContain("PDF OCR is limited");
  });

  it("prints document scans without embedding a scrollable browser viewer", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("openCleanPrintWindow");
    expect(html).toContain("openPdfPrintTabs");
    expect(html).toContain("dataUrlToBlobUrl");
    expect(html).toContain("Back to Blue Wallet");
    expect(html).toContain("Share / Print PDF");
    expect(html).toContain("navigator.share");
    expect(html).toContain("On iPhone/iPad, tap Share / Print PDF");
    expect(html).toContain("object-fit: contain;");
    expect(html).not.toContain('w.document.write(`<iframe src="${f.data}"');
    expect(html).not.toContain("w.open(file.data");
    expect(html).not.toContain("printPdfDirect");
  });

  it("pre-caches the stable wallet shell while keeping the React build available", () => {
    const worker = readRootFile("service-worker.js");

    expect(worker).toContain("./legacy-root-pwa.html");
    expect(worker).toContain("./styles.css");
    expect(worker).toContain("./app.js");
    expect(existsSync(path.join(repoRoot, "react-app", "index.html"))).toBe(true);
  });
});

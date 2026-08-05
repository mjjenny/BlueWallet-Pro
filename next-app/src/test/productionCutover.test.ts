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

describe("production cutover contract", () => {
  it("launches the React production bundle from the root PWA entry", () => {
    const rootIndex = readRootFile("index.html");

    expect(rootIndex).toContain("./react-app/index.html");
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

  it("starts installed PWAs at the React app URL", () => {
    const manifest = JSON.parse(readRootFile("manifest.json")) as { start_url: string; name: string };

    expect(manifest.name).toContain("v1.0");
    expect(manifest.start_url).toBe("./react-app/index.html?v=1.0");
  });

  it("uses the React service worker cache version and offline fallback", () => {
    const worker = readRootFile("service-worker.js");

    expect(worker).toContain("blue-wallet-react-v1.0.0");
    expect(worker).toContain("./react-app/index.html");
    expect(worker).toContain("./offline.html");
    expect(worker).toContain("keys.filter((key) => key !== CACHE_VERSION)");
    expect(worker).toContain("caches.delete(key)");
    expect(worker.indexOf('caches.match("./react-app/index.html")')).toBeLessThan(worker.indexOf('caches.match("./offline.html")'));
  });

  it("pre-caches every generated React production asset", () => {
    const worker = readRootFile("service-worker.js");
    const reactIndex = readRootFile(path.join("react-app", "index.html"));
    const assetRefs = quotedValues(reactIndex).filter((value) => value.startsWith("./assets/"));

    for (const ref of assetRefs) {
      expect(worker).toContain(`./react-app/${ref.replace("./", "")}`);
    }
  });
});

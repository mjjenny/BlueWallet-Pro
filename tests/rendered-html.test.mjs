import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          const filePath = new URL(`../public${url.pathname}`, import.meta.url);
          try {
            return new Response(await readFile(filePath), { status: 200 });
          } catch {
            return new Response("Not found", { status: 404 });
          }
        },
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("redirects the root route to the stable Blue Wallet app", async () => {
  const response = await render("/");

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/legacy-root-pwa.html");
});

test("ships the stable app shell with in-app update support", async () => {
  const [html, worker] = await Promise.all([
    readFile(new URL("../public/legacy-root-pwa.html", import.meta.url), "utf8"),
    readFile(new URL("../public/service-worker.js", import.meta.url), "utf8"),
  ]);

  assert.match(html, /THE BLUE WALLET/);
  assert.match(html, /APP_CACHE_VERSION = 'blue-wallet-stable-rollback-v0\.30'/);
  assert.match(html, /service-worker\.js\?update-check=/);
  assert.match(html, /New Blue Wallet update available\./);
  assert.match(html, /applyAppUpdate/);
  assert.match(html, /openCleanPrintWindow/);
  assert.match(html, /openPdfPrintTabs/);
  assert.match(html, /dataUrlToBlobUrl/);
  assert.match(html, /Back to Blue Wallet/);
  assert.match(html, /Share \/ Print PDF/);
  assert.match(html, /On iPhone\/iPad, tap Share \/ Print PDF/);
  assert.match(html, /PDF_OCR_MAX_PAGES/);
  assert.match(html, /renderPdfPagesForOcr/);
  assert.match(html, /Attach an image scan or PDF first\./);
  assert.equal(html.includes('w.document.write(`<iframe src="${f.data}"'), false);
  assert.equal(html.includes("w.open(file.data"), false);
  assert.equal(html.includes("printPdfDirect"), false);
  assert.match(worker, /CACHE_VERSION = "blue-wallet-stable-rollback-v0\.30"/);
  assert.match(worker, /clients\.claim\(\)/);
});

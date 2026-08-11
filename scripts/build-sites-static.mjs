import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const serverDir = join(dist, "server");
const filesToCopy = [
  "legacy-root-pwa.html",
  "index.html",
  "offline.html",
  "manifest.json",
  "service-worker.js",
  "app.js",
  "styles.css",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png"
];
const dirsToCopy = ["react-app"];

rmSync(dist, { recursive: true, force: true });
mkdirSync(serverDir, { recursive: true });

for (const file of filesToCopy) {
  const source = join(root, file);
  if (existsSync(source)) {
    copyFileSync(source, join(dist, file));
  }
}

for (const dir of dirsToCopy) {
  const source = join(root, dir);
  if (existsSync(source)) {
    cpSync(source, join(dist, dir), { recursive: true });
  }
}

writeFileSync(
  join(serverDir, "index.js"),
  `const htmlRoutes = new Set(["/", "/legacy-root-pwa", "/legacy-root-pwa.html"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    if (htmlRoutes.has(pathname)) {
      pathname = "/legacy-root-pwa.html";
    }

    const assetUrl = new URL(pathname, request.url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));

    if (response.status !== 404) {
      return response;
    }

    return env.ASSETS.fetch(new Request(new URL("/legacy-root-pwa.html", request.url), request));
  }
};
`
);

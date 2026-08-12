# BLUEWALLET PRO HANDOVER

Date prepared: 2026-08-12  
Prepared by: Codex  
Receiving assistant: Claude  
Project owner: Jenny  

This handover is self-contained. Assume no access to the original chat history, prior sandbox state, or unstated project memory.

## 1. PROJECT OVERVIEW

BlueWallet-Pro is an offline-first maritime document wallet for seafarers. Its purpose is to let a seafarer store, view, check, print, export, and sync personal maritime documents such as passports, CDC, certificates, visas, medical documents, yellow fever/vaccine records, contracts, sea-time records, STCW compliance packs, and related joining-vessel paperwork.

Target users:

- Individual seafarers managing personal joining and compliance documents.
- Users who need access on mobile while offline.
- Users who want local-first privacy with optional encrypted cloud sync.
- Users who need quick pack sharing, expiry awareness, and checklist-driven readiness.

Current production deployment:

```text
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa
```

> **Updated 2026-08-12 — read [`DEPLOYMENT.md`](DEPLOYMENT.md) before deploying
> anything.** There is now a second, newer deployment on a personal Cloudflare
> account that deploys automatically on git push:
>
> ```text
> https://bluewallet-pro.cl76380.workers.dev/legacy-root-pwa
> ```
>
> It is **ahead** of the chatgpt.site URL above (includes desktop sidebar
> navigation and layout fixes that never shipped there). The chatgpt.site
> deployment still works but can only be updated via a manual Codex handoff,
> which is gated by an account-wide weekly usage limit. Prefer Cloudflare.

The same app is also reachable at:

```text
https://bluewallet-pro-stable.cl76380.chatgpt.site/
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html
```

Current production is the hosted stable app, not GitHub Pages. GitHub Pages was retired after repeated deployment/cache issues. The production app is served from the local Sites project:

```text
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6
```

The deployed app content is primarily:

- `public/legacy-root-pwa.html`: the single-file stable wallet app shell and functional UI.
- `public/service-worker.js`: PWA cache/update behavior.
- `public/manifest.json`: install-to-home-screen metadata.
- `public/index.html`: route/entry handling for hosted site.
- `public/app.js` and `public/styles.css`: small hosted wrapper/support assets.

How deployment works now:

1. Edit the hosted app project under `work/bluewallet-sites-deploy-v6`.
2. Run local validation:

```text
npm test
npm run build
npm run lint
```

3. Push the hosted source state to the `sites` remote.
4. Use the Codex/Sites deployment path tied to `.openai/hosting.json`.
5. Verify all of these URLs return 200:

```text
https://bluewallet-pro-stable.cl76380.chatgpt.site/
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html
```

Important deployment note:

- Do not treat `mjjenny.github.io/BlueWallet-Pro` as production unless Jenny explicitly re-approves GitHub Pages.
- GitHub remains useful for source/prototype branches, but production has been moved to the hosted `chatgpt.site` path.

Raw live URL check from this handover session:

```text
URL=https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa STATUS=200 LENGTH=528683 FINAL=https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa
URL=https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html STATUS=200 LENGTH=528683 FINAL=https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html
URL=https://bluewallet-pro-stable.cl76380.chatgpt.site/ STATUS=200 LENGTH=528683 FINAL=https://bluewallet-pro-stable.cl76380.chatgpt.site/
```

## 2. REPOSITORY STATE

### GitHub Repository

Repository:

```text
https://github.com/mjjenny/BlueWallet-Pro.git
```

Owner/name:

```text
mjjenny/BlueWallet-Pro
```

Default branch from `git remote show origin`:

```text
main
```

GitHub working copy inspected:

```text
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\github-pages-stable-6f9ede5
```

Raw `git status --short --branch`:

```text
## gh-pages
```

Raw `git remote -v`:

```text
origin	https://github.com/mjjenny/BlueWallet-Pro.git (fetch)
origin	https://github.com/mjjenny/BlueWallet-Pro.git (push)
```

Raw `git remote show origin`:

```text
* remote origin
  Fetch URL: https://github.com/mjjenny/BlueWallet-Pro.git
  Push  URL: https://github.com/mjjenny/BlueWallet-Pro.git
  HEAD branch: main
  Remote branches:
    archive/retired-gh-pages-20260807           tracked
    development/stable-app-copy                 tracked
    docs/mobile-ui-redesign-plan                new (next fetch will store in remotes/origin)
    feature/mobile-ui-redesign-prototype        new (next fetch will store in remotes/origin)
    feature/mobile-ui-redesign-prototype-clean  tracked
    feature/prototype-ui-stable-integration     new (next fetch will store in remotes/origin)
    main                                        new (next fetch will store in remotes/origin)
    mobile-first-wallet-redesign-strategy-ba8c9 new (next fetch will store in remotes/origin)
    next                                        new (next fetch will store in remotes/origin)
```

Raw `git ls-remote --heads origin`:

```text
2b6d6664e3a955cebfabeedd7dbf4bdf5ec64cde	refs/heads/archive/retired-gh-pages-20260807
676b985e5885376e5a4c0608e34df5427046bdba	refs/heads/development/stable-app-copy
d4d723ba0b63b51adebeee31f07b5be5709d8ebe	refs/heads/docs/mobile-ui-redesign-plan
d4086e27f8be979959df4276285008d492cfec0a	refs/heads/feature/mobile-ui-redesign-prototype
2e2105d73f455cebad0fe9b5321393b13b9384fc	refs/heads/feature/mobile-ui-redesign-prototype-clean
478a5483919aa9495e9a78697313138f7ae5acd1	refs/heads/feature/prototype-ui-stable-integration
adcda080a58d19a6d1dc43401ab726a16c465197	refs/heads/main
2b6d6664e3a955cebfabeedd7dbf4bdf5ec64cde	refs/heads/mobile-first-wallet-redesign-strategy-ba8c9
a995638978957119a9a1eb0b61976abb8030fd34	refs/heads/next
```

Active branches and purpose:

- `main`: default GitHub branch. Purpose of current code state is unknown from this handover only.
- `development/stable-app-copy`: canonical stable app copy branch. This is the safest GitHub source-of-truth for stable app logic and documentation.
- `feature/mobile-ui-redesign-prototype-clean`: mobile/Grok-style prototype branch. This is a prototype and review branch, not the production stable app by itself.
- `feature/mobile-ui-redesign-prototype`: earlier mobile prototype branch.
- `feature/prototype-ui-stable-integration`: attempted integration branch for prototype/stable work.
- `docs/mobile-ui-redesign-plan`: planning document branch.
- `archive/retired-gh-pages-20260807`: archived/retired GitHub Pages state.
- `mobile-first-wallet-redesign-strategy-ba8c9`: strategy branch, appears to match retired GitHub Pages hash.
- `next`: previous React/Vite migration branch.

Raw recent log for `origin/development/stable-app-copy`:

```text
676b985e5885376e5a4c0608e34df5427046bdba Add current stable app handover
599c8ad02a689cbdc45bfa69f836340dbab99c64 Add PDF-capable OCR upgrade
96a5524aa2f3becbcb2279870effc6fe609d2dce Add mobile PDF print actions
bc0fd6a85b9ef561c1a546cf32fda417cee3eabe Fix PDF print blank preview
3cf6a4d9b44eb82bcac73a01ad7a477945a1864b Fix document print output
dec5bed268f0be4980a4cc30825a8def3278f0c2 Add in-app update prompt for stable shell
0703f134ecbb15c59e5b5933a428d0e97457fe8b Retire GitHub Pages production path
4f346880cf3242693e6684fd42a2edd26007defd Harden encrypted sync vault uploads
6d1cfa974fe433d719f2243b57d1d297a13dd1b2 Add encrypted sync vault
bc6a68ba9e30ccf2ec492b2909d700f041669756 Finalize help and responsive polish
```

Raw recent log for `origin/feature/mobile-ui-redesign-prototype-clean`:

```text
2e2105d73f455cebad0fe9b5321393b13b9384fc Add desktop companion layout to mobile prototype
64d84932e3b3a124b28ebe6d6429fea04eaf531b Polish mobile prototype review experience
9af0bd49f24a078830411f46c69c69f2c6e980e4 Complete mobile prototype search states and wizard
2497077c512eeff3ec02207a577aa40ffbd5b998 Add theme selector ID and acceptance checklist to README
c9991686440cae24faef813c3191afbce5fdfd7d Fix mobile prototype navigation hooks
e5256c0ebf5d79e5aed7493c9e3baf0ba4a8dd52 Fix mobile prototype screen visibility
2744f2b277c9694d8a264f276dc7229295330a67 Wire mobile prototype screens and interactions
21159459b7e9fe01059029e433890eaac035b83f Expand mobile UI prototype into clickable concept
9138cc1d5b01440e54d9be1d5487333c911b9560 Polish mobile UI prototype visual standard
f8fd57a08e6c2f2acd9271d1250ec13556d5b742 Add Grok-aligned mobile UI prototype preview
```

Raw `git show --stat --oneline --decorate origin/feature/mobile-ui-redesign-prototype-clean -1`:

```text
2e2105d (origin/feature/mobile-ui-redesign-prototype-clean) Add desktop companion layout to mobile prototype
 prototypes/mobile-ui/README.md                     |  19 +-
 prototypes/mobile-ui/mobile-redesign-overrides.css | 435 +++++++++++++++++++++
 2 files changed, 446 insertions(+), 8 deletions(-)
```

Raw `git ls-tree -r --long origin/feature/mobile-ui-redesign-prototype-clean -- prototypes/mobile-ui`:

```text
100644 blob efa7006fb341a49faf48c47dc55dc84f00a668ef    6261	prototypes/mobile-ui/README.md
100644 blob 33f2f8f49fc1f9423fc744cec2f64f03c0fe0367   30170	prototypes/mobile-ui/app.js
100644 blob b88a6ebd0264f3bc0074ad36e76d00d4274f1207   40492	prototypes/mobile-ui/mobile-redesign-overrides.css
100644 blob fef3fe603e62bdecdd16d78f36492bbb9842e724   42148	prototypes/mobile-ui/preview.html
```

### Hosted Production Repository

Hosted production working copy:

```text
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6
```

Raw `git rev-parse HEAD`:

```text
946102fa174c4533e92e6fcbd76ff4df26c3325a
```

Raw `git status --short --branch`:

```text
## main
?? build/bluewallet-sites-mobile-print-v0.18-20260807024909.tgz
?? build/bluewallet-sites-pdf-print-v0.17-20260807023643.tgz
?? build/bluewallet-sites-print-fix-v0.16-20260807022310.tgz
?? build/bluewallet-sites-update-v0.15-20260807014235.tgz
?? build/package-stage-mobile-print-v0.18-20260807024909/
?? build/package-stage-pdf-v0.17-20260807023643/
?? build/package-stage-print-v0.16-20260807022310/
?? build/package-stage-v0.15-20260807014235/
```

Those untracked build artifacts pre-existed this handover work. Do not delete them unless Jenny approves cleanup.

Raw `git remote -v`:

```text
sites	https://git.chatgpt-team.site/70d53469-8286-4c9e-9ab4-81f6a72eccd3/appgprj_6a74d7c5b9f4819192ac2f63287fa26d.git (fetch)
sites	https://git.chatgpt-team.site/70d53469-8286-4c9e-9ab4-81f6a72eccd3/appgprj_6a74d7c5b9f4819192ac2f63287fa26d.git (push)
```

Raw recent hosted production log:

```text
946102fa174c4533e92e6fcbd76ff4df26c3325a Deploy PDF-capable OCR update
adaf2c4d25a1013ed70473631ad22fe013323ed1 Add hosted mobile PDF print actions
61369de9c738a26b8dffce9fca78b5500836a32c Fix hosted PDF print blank preview
9cd2ec88a6e81fbe94f47ce22b5560ff801c8334 Fix hosted document print output
f8a2b6c57b89aeb9f8300137c6d298acc04802f9 Publish stable app update prompt
96f8e618259108a8f06bb4a1e8993373608fd965 Document hosted production path
32e114bc464042468d814ffb6d7b3e86d75c81c1 Host stable BlueWallet app
```

Raw `git ls-remote --heads sites` could not complete from this sandbox:

```text
command timed out after 94107 milliseconds
```

The local hosted HEAD is therefore known, but the remote `sites` hash could not be independently fetched in this handover pass. To verify later, rerun:

```text
git ls-remote --heads sites
```

### Directory Tree

Full current hosted directory tree excluding `.git`, `node_modules`, `.next`, `dist`, `build`, and `.wrangler`:

```text
bluewallet-sites-deploy-v6
|-- .openai
|   +-- hosting.json (91 bytes)
|-- app
|   |-- _sites-preview
|   |   |-- preview.css (6306 bytes)
|   |   +-- SkeletonPreview.tsx (5197 bytes)
|   |-- chatgpt-auth.ts (2640 bytes)
|   |-- globals.css (514 bytes)
|   |-- layout.tsx (495 bytes)
|   +-- page.tsx (268 bytes)
|-- db
|   |-- index.ts (436 bytes)
|   +-- schema.ts (173 bytes)
|-- drizzle
|   +-- meta
|       +-- _journal.json (66 bytes)
|-- examples
|   +-- d1
|       |-- app
|       |   +-- api
|       |       +-- notes
|       |           +-- route.ts (1758 bytes)
|       +-- db
|           +-- schema.ts (379 bytes)
|-- public
|   |-- app.js (6832 bytes)
|   |-- apple-touch-icon.png (1486 bytes)
|   |-- favicon.svg (718 bytes)
|   |-- file.svg (393 bytes)
|   |-- globe.svg (1037 bytes)
|   |-- icon-192.png (1583 bytes)
|   |-- icon-512.png (4176 bytes)
|   |-- icon-maskable-512.png (4179 bytes)
|   |-- index.html (2077 bytes)
|   |-- legacy-root-pwa.html (305732 bytes)
|   |-- manifest.json (943 bytes)
|   |-- offline.html (1461 bytes)
|   |-- service-worker.js (1934 bytes)
|   |-- styles.css (2841 bytes)
|   +-- window.svg (387 bytes)
|-- tests
|   +-- rendered-html.test.mjs (2538 bytes)
|-- worker
|   +-- index.ts (1778 bytes)
|-- .gitignore (504 bytes)
|-- drizzle.config.ts (155 bytes)
|-- eslint.config.mjs (1050 bytes)
|-- next.config.ts (140 bytes)
|-- next-env.d.ts (194 bytes)
|-- package.json (1374 bytes)
|-- package-lock.json (359493 bytes)
|-- postcss.config.mjs (101 bytes)
|-- README.md (460 bytes)
|-- tsconfig.json (632 bytes)
+-- vite.config.ts (1756 bytes)
```

Top-level path purpose:

- `.openai/hosting.json`: Sites project identifier. Reuse this for deployments.
- `app/`: Vinext/React app wrapper for hosted site routing and preview.
- `db/`, `drizzle/`, `examples/`: starter database scaffolding. BlueWallet production data does not currently depend on server database tables here.
- `public/`: production static app assets. This is the critical deployed surface.
- `tests/`: hosted route/render tests.
- `worker/`: Cloudflare worker/server entry.
- `package.json`, `vite.config.ts`, `next.config.ts`, TypeScript and lint config: build/runtime configuration.
- `build/`: untracked historical deployment/package artifacts. Not part of tracked production source.

Frozen paths:

- `public/legacy-root-pwa.html`: stable app logic. Modify only with Jenny approval and full regression testing.
- `public/service-worker.js`: PWA update/offline behavior. Any change requires version bump and mobile update verification.
- `public/manifest.json`: install behavior. Change only intentionally.
- GitHub `origin/development/stable-app-copy`: canonical stable source branch; do not rewrite history.
- GitHub retired branches: do not revive `gh-pages`/GitHub Pages as production unless Jenny explicitly asks.

Active work areas for desktop phase:

- Preferred: new branch from current hosted production or `development/stable-app-copy`, named something like `feature/desktop-grok-redesign`.
- Work should be staged behind clear breakpoints and visual checks.
- Prototype references may be read from `prototypes/mobile-ui/`, but do not treat the prototype as the functional source of truth.

### `prototypes/mobile-ui/` Story

`prototypes/mobile-ui/` began as a separate mobile redesign concept inspired by Grok mockups. It was intentionally isolated so the stable app would not be damaged while exploring a new visual direction.

Its final GitHub branch is:

```text
feature/mobile-ui-redesign-prototype-clean
```

Its current remote HEAD is:

```text
2e2105d73f455cebad0fe9b5321393b13b9384fc
```

It contains:

- `preview.html`: standalone clickable prototype.
- `mobile-redesign-overrides.css`: ocean/glass visual system and responsive rules.
- `app.js`: prototype interactions and mock data.
- `README.md`: prototype documentation.

Prototype final state:

- Useful for visual standard, mobile page structure, bottom navigation, glass panels, and interaction references.
- Not a drop-in replacement for stable production.
- Uses mock data and prototype-only interactions in places.
- Some later mobile ideas were merged/recreated into the hosted stable app, but the hosted app remains the functional authority.

## 3. TECH STACK & BUILD

Hosted production project stack from `package.json`:

```json
{
  "name": "site-creator-vinext-starter",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=22.13.0"
  },
  "scripts": {
    "dev": "vinext dev",
    "build": "vinext build",
    "start": "vinext start",
    "test": "npm run build && node --test tests/rendered-html.test.mjs",
    "lint": "eslint . --ignore-pattern dist --ignore-pattern .next",
    "db:generate": "drizzle-kit generate"
  },
  "dependencies": {
    "drizzle-orm": "0.45.2",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "react-loading-skeleton": "3.5.0"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "1.37.1",
    "@eslint/js": "9.39.4",
    "@next/eslint-plugin-next": "16.2.6",
    "@tailwindcss/postcss": "4.2.1",
    "@types/node": "22.19.19",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.2",
    "@vitejs/plugin-rsc": "0.5.26",
    "drizzle-kit": "0.31.10",
    "eslint": "9.39.4",
    "eslint-plugin-jsx-a11y": "6.10.2",
    "eslint-plugin-react": "7.37.5",
    "eslint-plugin-react-hooks": "7.1.1",
    "globals": "16.4.0",
    "react-server-dom-webpack": "19.2.6",
    "tailwindcss": "4.2.1",
    "typescript": "5.9.3",
    "typescript-eslint": "8.59.3",
    "vinext": "1.0.0-beta.2",
    "vite": "8.0.13",
    "wrangler": "4.92.0"
  },
  "type": "module"
}
```

Stable wallet app internals:

- Single-file HTML/CSS/JavaScript PWA in `public/legacy-root-pwa.html`.
- Browser storage: IndexedDB.
- Optional encrypted sync: Supabase REST API using locally encrypted backup payloads.
- Crypto: browser Web Crypto, including AES-GCM patterns from prior stable work.
- OCR: Tesseract.js/OpenCV-style scanner/OCR code has existed in stable app history; current OCR quality is known weak and should be treated as a future improvement area.
- PDF viewing/printing: browser PDF viewer behavior and mobile print workaround code were added in recent hosted commits.

Build/run/test commands:

```text
npm install
npm run dev
npm run build
npm test
npm run lint
```

Raw `npm test` from this handover:

```text
> site-creator-vinext-starter@0.1.0 test
> npm run build && node --test tests/rendered-html.test.mjs


> site-creator-vinext-starter@0.1.0 build
> vinext build


  vinext build  (Vite 8.0.13)

[1/5] analyze client references...
transforming...✓ 217 modules transformed.
rendering chunks...
✓ built in 4.20s
[2/5] analyze server references...
transforming...✓ 74 modules transformed.
rendering chunks...
✓ built in 943ms
[3/5] build rsc environment...
transforming...✓ 215 modules transformed.
rendering chunks...
computing gzip size...
✓ built in 4.17s
[4/5] build client environment...
transforming...✓ 115 modules transformed.
rendering chunks...
computing gzip size...
✓ built in 3.61s
[5/5] build ssr environment...
transforming...✓ 80 modules transformed.
rendering chunks...
computing gzip size...
✓ built in 2.78s

  Route (app)
  ─ ? /

  ? Unknown

  ? Some routes could not be classified. vinext currently uses static analysis
    and cannot detect dynamic API usage (headers(), cookies(), etc.) at build time.
    Automatic classification will be improved in a future release.

  Build complete. Run `vinext start` to start the production server.

TAP version 13
# Subtest: redirects the root route to the stable Blue Wallet app
ok 1 - redirects the root route to the stable Blue Wallet app
  ---
  duration_ms: 893.7676
  type: 'test'
  ...
# Subtest: ships the stable app shell with in-app update support
ok 2 - ships the stable app shell with in-app update support
  ---
  duration_ms: 49.0825
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1462.0663
[PLUGIN_TIMINGS] Your build spent significant time in plugins. Here is a breakdown:
  - rsc:virtual-client-package (18%)
  - vinext:middleware-server-only (14%)
  - vinext:og-inline-fetch-assets (11%)
  - vinext:css-data-url (9%)
  - vinext:image-imports (9%)
See https://rolldown.rs/options/checks#plugintimings for more details.
[PLUGIN_TIMINGS] Your build spent significant time in plugins. Here is a breakdown:
  - vinext:middleware-server-only (23%)
  - rsc:virtual-client-package (14%)
  - vinext:og-inline-fetch-assets (10%)
  - vinext:css-data-url (9%)
  - alias (7%)
See https://rolldown.rs/options/checks#plugintimings for more details.
[PLUGIN_TIMINGS] Your build spent significant time in plugins. Here is a breakdown:
  - vinext:css-data-url (21%)
  - vinext:og-inline-fetch-assets (20%)
  - vinext:validate-middleware-exports (12%)
  - rsc:use-server (5%)
  - alias (5%)
See https://rolldown.rs/options/checks#plugintimings for more details.
```

Raw `npm run lint` from this handover:

```text
> site-creator-vinext-starter@0.1.0 lint
> eslint . --ignore-pattern dist --ignore-pattern .next


C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6\public\app.js
  13:156  error  Expected an assignment or function call and instead saw an expression  @typescript-eslint/no-unused-expressions
  13:220  error  Expected an assignment or function call and instead saw an expression  @typescript-eslint/no-unused-expressions

C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6\tests\rendered-html.test.mjs
  21:20  error  '_' is defined but never used  @typescript-eslint/no-unused-vars

✖ 3 problems (3 errors, 0 warnings)
```

The lint failures are real and should be fixed before further production-grade release work. `npm test` passed because it does not run the lint command.

PWA specifics:

Raw `public/service-worker.js`:

```javascript
const CACHE_VERSION = "blue-wallet-stable-rollback-v0.19";
const APP_SHELL = [
  "./",
  "./index.html",
  "./legacy-root-pwa.html",
  "./manifest.json",
  "./offline.html",
  "./styles.css",
  "./app.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put("./legacy-root-pwa.html", copy));
          return response;
        })
        .catch(() => caches.match("./legacy-root-pwa.html").then((response) => response || caches.match("./offline.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      }),
    ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
```

Raw `public/manifest.json`:

```json
{
  "id": "./",
  "name": "THE BLUE WALLET \u2014 Offshore Edition",
  "short_name": "Blue Wallet",
  "description": "Offline-first maritime document wallet with camera scanning and optimized local storage.",
  "start_url": "./legacy-root-pwa.html?v=stable",
  "scope": "./",
  "display": "standalone",
  "display_override": [
    "standalone",
    "minimal-ui"
  ],
  "orientation": "any",
  "background_color": "#020b16",
  "theme_color": "#020b16",
  "categories": [
    "productivity",
    "utilities"
  ],
  "icons": [
    {
      "src": "./icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

Caching strategy:

- App shell is cached on install.
- Old cache versions are deleted on activation.
- Navigation requests are network-first, then fallback to cached `legacy-root-pwa.html` or `offline.html`.
- Static same-origin GET requests are cache-first with network fill.
- `SKIP_WAITING` message is supported.

Why `legacy-root-pwa.html` exists:

- The app began as a stable single-file PWA and retained the legacy root filename during React migration and deployment experiments.
- The filename is now baked into service worker cache lists, manifest `start_url`, tests, user bookmarks, and hosted routing.
- Do not rename it without a migration plan.

Routing quirks:

- Production route `/legacy-root-pwa` currently returns the same content as `/legacy-root-pwa.html`.
- Root `/` also returns the app.
- Earlier in the project, GitHub Pages and extensionless routes caused stale/404 confusion. The hosted route now returned 200 in the latest check.

Environment variables, secrets, and config names:

- `.openai/hosting.json`: contains Sites `project_id`.
- Supabase sync settings are entered by user in app Settings, not committed to repo:
  - Supabase project URL
  - Supabase anon key
  - Vault ID, likely `bluewallet-main`
  - Sync passphrase
- GitHub Personal Access Token was used in Qwen/GitHub workflow earlier. Do not store it in source.
- No secret values are included in this handover.

## 4. MOBILE PHASE - COMPLETED WORK

Mobile phase intent:

- Transition the app toward the premium Grok-style maritime UI.
- Keep mobile first.
- Preserve stable app functions.
- Avoid losing documents or changing IndexedDB/backup/sync formats.

Design standard adopted:

- Deep navy/black ocean atmosphere.
- Moonlit water or wave-line background.
- Premium glassmorphism panels with thin blue-gray borders.
- Electric blue primary actions.
- Strong status colors:
  - Green for valid/ready.
  - Yellow/orange for expiring soon or partial completion.
  - Red for expired/risk.
  - Blue for neutral navigation/actions.
- Large, thumb-friendly controls.
- Bottom navigation on mobile.
- Status-first document cards.
- Clear separation between category selection and bottom app navigation.
- iOS safe-area awareness.

Mobile/Grok mockup targets provided by Jenny:

- Landing/Vault page with THE BLUE branding, Full/Lite and Offline pills, stats panel, document categories, document list, and floating add button.
- Document detail page with strong header, document preview, quality checklist, and Share/Download/Edit/Delete actions.
- Vaccination page with clean form layout and premium glass panel.
- Settings page with app mode, appearance themes, backup/settings cards.
- Add Document page with scan/upload area, category chips, title/number/date inputs, quality checklist, and save button.
- Packs page with share-ready packs, progress bars, custom pack creation, and share sheet behavior.
- Timeline page with left-side timeline rail and tappable event cards.
- Sea-time form.
- STCW checklist.

Mobile work completed in conversation:

- Grok visual direction integrated into mobile app surface.
- Bottom nav set to the requested five tabs:
  - Vault
  - Timeline
  - Packs
  - Profile
  - Settings
- Vaccine was removed from bottom nav because Jenny clarified it is a document/category feature, not a primary tab.
- Vault/category logic restored so categories can be selected and then matching documents are shown.
- Landing page categories include core document categories, including vaccines/yellow fever as vault categories.
- Full/Lite and Offline pills were repeatedly adjusted for alignment and text centering.
- Floating add document button kept as primary add action.
- Add Document layout was checked and refined to reduce overlap/interference.
- Timeline was refined so cards should be tappable into corresponding document/detail items.
- Packs page gained custom pack creation behavior in hosted file.
- Pack sharing behavior was discussed and partially reflected.
- Profile gained Sea-time access so prior stable sea service record feature is not lost.
- Packs gained STCW checklist/reference access.
- Settings close behavior was fixed after user reported X not working.
- Appearance theme selection was fixed after user reported selected theme did not visually apply.
- Help/FAQ from stable version was added into Settings/help surface.
- Archive concept added: some expired documents, such as old passports, can be archival and should not count as renewal/compliance risk when archived.
- Mobile PDF/print handling was adjusted after mobile print had no back/print affordance.
- Hosted app received update prompt support so users do not need hard refresh when a new service worker/app version is available.

Raw feature scan from hosted `public/legacy-root-pwa.html`:

```text
7: <meta name="description" content="Offline-first maritime document wallet for seafarers." />
536: /* Lite: equal-width compact tabs (fewer categories) */
537: body.app-lite .cats { justify-content: stretch; }
538: body.app-lite .cat { flex: 1 1 0; min-width: 0; padding: 10px 6px; }
539: body.app-lite .cat-name { overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
733: .docs, .cats, .modal-body, .help-body {
796: .top-actions .btn-ghost, .top-actions .mode-toggle, #btn-help {
815: body.app-lite .cat { padding: 9px 4px; }
816: body.app-lite .cat-name { font-size: 9px; }
1125: /* ===== LITE vs FULL ===== */
1126: body.app-lite .full-only { display: none !important; }
1127: body.app-lite .tools-row { gap: 6px; }
1128: body.app-lite .cats .cat[data-cat="yellowfever"],
1129: body.app-lite .cats .cat[data-cat="contract"] { display: none !important; }
1130: body.app-lite .profile-meta .rank-line { display: none; }
1131: body.app-lite .brand p::after { content: none; }
1139: #btn-help {
1144: .help-tabs {
1152: .help-tab {
1158: .help-tab.active {
1161: .help-pane { display: none; }
1162: .help-pane.active { display: block; }
1163: .help-sec { margin-bottom: 16px; }
1164: .help-sec h3 {
1168: .help-sec p, .help-sec li {
1172: .help-sec ul { padding-left: 18px; }
1173: .help-sec li { margin-bottom: 8px; }
1174: .help-sec strong { color: #fff; font-weight: 600; }
1175: .help-grid {
1179: .help-grid { grid-template-columns: 1fr; }
1187: .help-card {
1191: .help-card h4 {
1194: .help-card p { font-size: 12px; color: var(--muted); line-height: 1.5; margin: 0; }
1211: .help-sec code, .faq-item code {
1216: .help-tabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }
1219: body.app-lite .mode-toggle { background: rgba(94,212,255,.15); border-color: rgba(94,212,255,.45); color: var(--accent); }
1538: <p>OFFLINE</p>
1542: <button type="button" class="mode-toggle" id="btn-mode" aria-label="Toggle Lite Full mode" title="Toggle Lite / Full">FULL</button>
1547: <button class="btn btn-ghost full-only" id="btn-lock-now" title="Lock now">🔒</button>
1548: <button class="btn btn-ghost" id="btn-help" aria-label="Help" title="Help">?</button>
1609: <button type="button" class="tool-btn full-only" id="btn-checklist">📋 Checklist</button>
1612: <button type="button" class="tool-btn full-only" id="btn-ics">📅 Calendar</button>
1613: <button type="button" class="tool-btn full-only" id="btn-timeline">⏱ Timeline</button>
1614: <button type="button" class="tool-btn full-only" id="btn-packs">📦 Packs</button>
1615: <button type="button" class="tool-btn full-only" id="btn-stcw">🎓 STCW</button>
1616: <button type="button" class="tool-btn full-only" id="btn-seatime">🚢 Sea time</button>
1617: <button type="button" class="tool-btn full-only" id="btn-vaccines">💉 Vaccines</button>
1618: <button type="button" class="tool-btn full-only" id="btn-bulk">☑ Select</button>
1619: <div class="view-toggle full-only">
1717: <div class="scan-status" id="scan-status" role="status" aria-live="polite"></div>
1718: <p style="font-size:12px;color:var(--muted);margin-top:8px">v0.2 automatically reduces large photos for dependable offline storage while retaining readable document detail.</p>
1719: <button type="button" class="btn btn-ghost full-only" id="btn-ocr" style="width:100%;margin-top:10px">🔍 Read text from scan (OCR)</button>
1720: <div id="ocr-panel" class="full-only" style="display:none;margin-top:10px;padding:12px;border-radius:14px;background:rgba(0,0,0,.35);border:1px solid var(--glass-border);text-align:left">
1721: <div id="ocr-status" role="status" aria-live="polite" style="font-size:13px;color:var(--muted);margin-bottom:8px"></div>
1736: <div class="check-item"><div><div class="cn">Full page visible</div><div class="cs">No corners or important stamps are cropped.</div></div><label class="sw"><input type="checkbox" id="doc-q-fullpage" /><span class="sl"></span></label></div>
1781: <img id="profile-full" class="hidden" alt="" style="width:100%;height:100%;object-fit:cover" />
1782: <span id="profile-full-placeholder">👤</span>
1787: <div class="field"><label>Full name</label><input type="text" id="sf-name" placeholder="As in passport" /></div>
1806: <div class="overlay" id="modal-help">
1808: <div class="modal-head"><h2>Help &amp; FAQ</h2><button class="x" id="close-help">✕</button></div>
1810: <div class="help-tabs" role="tablist">
1811: <button type="button" class="help-tab active" data-help="start">Start</button>
1812: <button type="button" class="help-tab" data-help="docs">Documents</button>
1813: <button type="button" class="help-tab" data-help="download">Download</button>
1814: <button type="button" class="help-tab" data-help="tools">Tools</button>
1815: <button type="button" class="help-tab" data-help="security">Security</button>
1816: <button type="button" class="help-tab" data-help="faq">FAQ</button>
1819: <div class="help-pane active" id="help-start">
1820: <div class="help-sec">
1827: <li>Use <strong style="color:#fff">Lite</strong> for daily wallet use and <strong style="color:#fff">Full</strong> for packs, OCR, logs, QA, and release tools.</li>
1830: <div class="help-grid">
1831: <div class="help-card">
1832: <h4>LITE</h4>
1835: <div class="help-card">
1836: <h4>FULL</h4>
1837: <p>Everything in Lite plus quality checklist, packs, renewal timeline, STCW, sea-time, vaccines, bulk tools, OCR, biometrics, activity log, QA pack, and release readiness.</p>
1840: <div class="help-sec" style="margin-top:14px">
1842: <p>The wallet is offline-first and local-only. Documents live in this browser's <strong>IndexedDB</strong>; the app does not upload scans, profile data, notes, or backups to a server.</p>
1844: <div class="help-sec">
1850: <div class="help-pane" id="help-docs">
```

Raw direct scan for custom pack and encrypted sync:

```text
4532: <div class="field" style="margin-top:14px"><label>New pack name</label>
5687: const name = prompt('Pack name for selected documents:', 'Joining vessel pack');
1911: <p>Optional Supabase sync for desktop/mobile. The full wallet is encrypted locally before upload; use the same vault ID and passphrase on each device.</p>
2000: <details class="faq-item"><summary>Can desktop and mobile sync automatically?</summary><div class="faq-a">Yes, if you explicitly configure Encrypted Sync Vault in Settings. The app encrypts the full backup on-device before uploading it to Supabase, then another device can pull and decrypt it with the same vault ID and passphrase.</div></details>
2106: <div class="field"><label>Supabase project URL</label><input type="url" id="sync-url" placeholder="https://your-project.supabase.co" autocomplete="off" /></div>
2107: <div class="field"><label>Supabase anon key</label><input type="password" id="sync-key" placeholder="Paste anon public key" autocomplete="off" /></div>
2109: <div class="field"><label>Vault ID</label><input id="sync-vault-id" placeholder="e.g. bluewallet-main" autocomplete="off" /></div>
2110: <div class="field"><label>Sync passphrase</label><input type="password" id="sync-passphrase" placeholder="Required to encrypt/decrypt" autocomplete="off" /></div>
2113: <div><div class="tl">Remember passphrase here</div><div class="ts">Needed for automatic pull on this device. Leave off on shared devices.</div></div>
2122: <button class="btn btn-primary" id="btn-sync-upload" type="button">Upload encrypted vault</button>
2124: <button class="btn btn-ghost" id="btn-sync-pull" type="button" style="width:100%;margin-top:8px">Pull latest from vault</button>
3065: if (!normalizeSyncUrl(config.url)) throw new Error('Supabase project URL is missing.');
3066: if (!String(config.anonKey || '').trim()) throw new Error('Supabase anon key is missing.');
3067: if (!String(config.vaultId || '').trim()) throw new Error('Vault ID is missing.');
3068: if (!String(passphrase || '').trim()) throw new Error('Sync passphrase is missing.');
3240: syncStatus(config.url && config.anonKey && config.vaultId ? 'Sync settings saved.' : 'Sync settings saved, but URL/key/vault ID are still incomplete.', config.url && config.anonKey && config.vaultId ? 'ok' : 'warn');
```

Acceptance checklist used for mobile phase:

- No horizontal overflow on narrow iPhone width.
- Bottom nav contains only Vault, Timeline, Packs, Profile, Settings.
- Vaccine is treated as a category/tool, not a primary bottom nav tab.
- Category labels are readable and not garbled.
- Full/Lite and Offline pills are aligned and not overlapping.
- Document cards show readable status and quality/risk labels.
- Status circles/checkmarks are clear and not obscuring text.
- Document detail has consistent back/close controls.
- Timeline is centered and event cards open matching documents.
- Packs have custom pack creation and document selection.
- Settings close button works.
- Appearance themes visibly apply.
- Help/FAQ content from stable version is accessible.
- Sea-time and STCW checklist are not lost.
- Add Document has clean controls without overlap.
- Mobile PDF print has usable print/download/back behavior.

What passed:

- `npm test` passed for hosted route/update tests.
- Latest live URL check returned 200 for root, extensionless legacy route, and `.html` legacy route.
- Static feature scans show critical features present in `public/legacy-root-pwa.html`.

Known bugs/deferred mobile items:

- OCR quality is weak. User explicitly said OCR is "pathetic" and performs poorly on image scans and PDFs. Treat OCR as a future rebuild item, not solved.
- Lint errors remain in hosted wrapper files. See raw `npm run lint` output above.
- Physical device matrix is still necessary before final release confidence:
  - iOS Safari/PWA
  - Android Chrome/PWA
  - Windows Edge/Chrome
  - Camera/scanner hardware
  - Native share/print flows
- Supabase encrypted sync depends on user-entered Supabase settings and the Supabase table setup already performed by Jenny. Do not assume sync data exists without pull verification.
- No TODO/FIXME/HACK markers were found in the checked hosted and prototype files:

```text
NO_MATCHES
```

## 5. DESKTOP PHASE - THE NEXT WORK

Current desktop UI state:

- Desktop still feels closer to the older stable app than the desired Grok mockup standard.
- User explicitly rejected a mere "layer over old design" approach.
- Desktop phase should be a fresh face, while preserving every feature and data contract.
- Desktop must be redesigned after mobile; Jenny said mobile first, desktop later.

What exists functionally:

- Document vault.
- Category filtering.
- Search/sort/status filters.
- Add/edit/delete documents.
- Attachments/photos/PDF viewing.
- Quality checklist.
- Summary/checklist/calendar/timeline tools.
- Packs and STCW.
- Sea-time records.
- Vaccines.
- Profile.
- Settings/backup.
- PIN lock and local crypto.
- Encrypted Sync Vault through Supabase.
- Backup export/import with version/integrity labels.
- Help/FAQ.
- In-app update prompt.
- Offline PWA behavior.

What's broken or fragile:

- Desktop visual system is not yet fully transformed to Grok-level premium design.
- OCR remains poor.
- Lint is failing in wrapper files.
- Print/PDF behavior has been improved but should be re-tested with actual desktop browser print previews and mobile share sheets.
- The single-file `legacy-root-pwa.html` is large and hard to safely refactor.

Recommended desktop redesign plan, ordered:

1. Freeze current production and make a backup before any desktop UI work.
2. Create a new branch:

```text
feature/desktop-grok-redesign
```

3. Build a desktop design inventory:
   - Vault landing
   - Category rail
   - Document cards/list
   - Document detail modal
   - Add/edit modal
   - Settings/backup
   - Timeline
   - Packs/share
   - Sea-time
   - STCW checklist
   - Vaccines
   - Help/FAQ
4. Define a desktop Grok visual standard consistent with mobile:
   - ocean background
   - premium brand header
   - glass panels
   - strong status hierarchy
   - readable dense desktop layouts
5. Convert desktop dashboard first, preserving every button/function.
6. Convert document detail next.
7. Convert Settings/Backup third.
8. Convert Packs, Timeline, Sea-time, STCW, Vaccines.
9. Run full functional regression after each screen group.
10. Only deploy after Jenny approves visual preview and function checklist.

Constraints:

- Do not change IndexedDB schema unless separately approved.
- Do not change backup JSON format unless separately approved.
- Do not change Supabase sync table/schema unless separately approved.
- Do not remove mobile behavior while working on desktop.
- Do not rewrite service worker cache/update behavior casually.
- Do not lose existing stable features for visual improvement.
- Do not deploy desktop redesign until all critical flows are tested.

Current responsive strategy:

- Mobile uses bottom nav and Grok-inspired cards.
- Desktop currently uses wider app shell and older stable layout patterns.
- Breakpoint guidance:
  - `< 768px`: mobile-first bottom navigation.
  - `768px-1024px`: tablet should avoid horizontal overflow and use stacked or 2-column panels.
  - `> 1024px`: desktop should use wider panels, a clear dashboard grid, and larger document/detail split.

The next assistant should verify exact CSS breakpoints inside `public/legacy-root-pwa.html` before editing because the app is a single-file PWA.

## 6. MULTI-AGENT HISTORY & RULES

Qwen incident:

- Qwen was used as a worker for prototype tasks.
- Qwen repeatedly claimed pushes/commits had happened when remote verification showed they had not.
- Some Qwen commits were real later, but only after strict raw-output verification.
- Qwen also introduced or attempted changes outside approved prototype paths at one point, including `.gitignore` and `package-lock.json`; this triggered a reset/cleanup.
- Jenny then said to leave Qwen out and let Codex take over.

Real GitHub prototype commits now visible on remote:

```text
2e2105d73f455cebad0fe9b5321393b13b9384fc Add desktop companion layout to mobile prototype
64d84932e3b3a124b28ebe6d6429fea04eaf531b Polish mobile prototype review experience
9af0bd49f24a078830411f46c69c69f2c6e980e4 Complete mobile prototype search states and wizard
2497077c512eeff3ec02207a577aa40ffbd5b998 Add theme selector ID and acceptance checklist to README
c9991686440cae24faef813c3191afbce5fdfd7d Fix mobile prototype navigation hooks
e5256c0ebf5d79e5aed7493c9e3baf0ba4a8dd52 Fix mobile prototype screen visibility
2744f2b277c9694d8a264f276dc7229295330a67 Wire mobile prototype screens and interactions
21159459b7e9fe01059029e433890eaac035b83f Expand mobile UI prototype into clickable concept
9138cc1d5b01440e54d9be1d5487333c911b9560 Polish mobile UI prototype visual standard
f8fd57a08e6c2f2acd9271d1250ec13556d5b742 Add Grok-aligned mobile UI prototype preview
```

Mandatory verification protocol:

After every claimed commit/push, the executing assistant must paste raw output for:

```text
git status --short --branch
git log --oneline -5
git push <remote> <branch>
git ls-remote <remote> <branch>
```

The remote hash must visibly change from the old hash to the new local commit hash. No agent may claim a push succeeded without the raw `git push` output and raw `git ls-remote` output.

Branch/write ownership going forward:

- Claude should own the desktop phase branch it creates.
- Codex/Claude may read prototype branch `feature/mobile-ui-redesign-prototype-clean`, but it should not be treated as production.
- Production deployment path is the hosted Sites project, not `gh-pages`.
- Qwen should not be used unless Jenny explicitly requests it again.
- If any worker agent is used, it must be restricted to an explicitly named path and branch, with raw verification required.

Trust rules:

- The user's documents are local-first in browser IndexedDB. Never promise they are safe without backup/sync verification.
- Before any destructive operation, export a backup from the app.
- Never reset, rewrite, or delete user data.
- Never change stable production UI/layout/animation without explicit permission, unless the current task explicitly asks for that redesign.
- For design tasks, screenshots and viewport checks matter more than claims.
- For push/deploy tasks, raw command output matters more than summaries.

## 7. WORKFLOW CONVENTIONS

Commit message style observed:

- Imperative, concise:
  - `Fix hosted document print output`
  - `Publish stable app update prompt`
  - `Add desktop companion layout to mobile prototype`
  - `Deploy PDF-capable OCR update`

Branch naming observed:

- `development/stable-app-copy`
- `feature/mobile-ui-redesign-prototype-clean`
- `feature/prototype-ui-stable-integration`
- `docs/mobile-ui-redesign-plan`
- `archive/retired-gh-pages-20260807`

Recommended branch for desktop phase:

```text
feature/desktop-grok-redesign
```

PR vs direct push:

- Prototype work was pushed directly to feature branches.
- Production hosted work appears committed directly in the Sites repo.
- For Claude desktop phase, prefer feature branch plus preview first, then Jenny approval before production deploy.

Jenny's working style:

- Direct, urgent, and outcome-focused.
- Prefers step-by-step walkthroughs when performing manual external tasks.
- Strongly dislikes vague reassurance or "beating around the bush."
- Wants visible proof, especially for git pushes, deployments, and UI fixes.
- Wants features preserved, not merely visual redesign.
- Wants mobile and desktop to eventually share the Grok premium feel.
- Wants practical URLs/previews she can open on phone.

Local environment facts:

- OS: Windows.
- Shell used here: PowerShell.
- Browser: Chrome visible in screenshots.
- Mobile target: iOS Safari / installed PWA.
- User has used Supabase dashboard manually.
- User has used Qwen Studio and GitHub PAT/authorization.
- Relevant local project roots:

```text
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\github-pages-stable-6f9ede5
```

User files referenced during the project:

- `C:\Users\Jenny\Downloads\Sea_Service_Record.xlsx`
- `C:\Users\Jenny\Downloads\blue-wallet-stable-backup-v6-2026-08-06.json`
- `C:\Users\Jenny\Downloads\SUPABASE-ENCRYPTED-SYNC-VAULT.sql`
- third-party testing reports and evidence zips in `C:\Users\Jenny\Downloads\`

## 8. OPEN QUESTIONS / RISKS

Open questions:

1. Exact latest production deployment mechanism through Sites should be re-confirmed by the next assistant before deploying. `.openai/hosting.json` identifies the project, but this handover does not include raw Sites API deployment logs.
2. Supabase project URL value is not written here because secrets/keys should not be placed in handover. It can be found in Jenny's Supabase dashboard or browser/app Settings if saved locally.
3. The current live mobile app should be re-checked on real iOS Safari/PWA before desktop work begins, because prior issues involved visual overlap visible only on phone screenshots.
4. It is unknown whether every user document has been pulled from Supabase into every device. The app is local-first, so each device has its own IndexedDB unless encrypted sync is configured and pulled.
5. Desktop Grok redesign acceptance criteria are not yet fully written. Claude should ask Jenny to approve a desktop screen order and visual mock target before editing production.

Risks:

- `legacy-root-pwa.html` is large and fragile. Small CSS changes can affect many screens.
- PWA caching can make new deploys appear stale. Always bump service worker cache version when changing app shell assets.
- User data exists in browser storage; code changes should not alter data formats without migration and backup.
- Encrypted sync can appear empty if wrong Supabase URL/key/vault ID/passphrase is entered.
- OCR is a known weak point and should not be represented as release-grade.
- GitHub Pages is retired; returning to it may reintroduce stale deployment confusion.
- The prototype branch is visually useful but not a complete stable app replacement.

Immediate recommended next action for Claude:

1. Open the production hosted app locally and live.
2. Capture desktop screenshots for:
   - Vault
   - Document Detail
   - Add Document
   - Settings & Backup
   - Timeline
   - Packs
   - Profile
3. Create a desktop redesign branch.
4. Draft a desktop screen-by-screen implementation checklist that preserves every stable feature.
5. Get Jenny approval before changing production desktop UI.


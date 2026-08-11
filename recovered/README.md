# Recovered production baseline — captured 2026-08-12

This folder is the Step 2 output of `MILESTONE_1_ROADMAP.md`. It exists because the repo's
`public/legacy-root-pwa.html` (and several other `public/` files) do not match what is actually
deployed at `https://bluewallet-pro-stable.cl76380.chatgpt.site/`, and no matching source could be
found anywhere in `work/` or on any GitHub branch. See the roadmap Section 1 for the full
investigation.

## Provenance of each file

| File | Source | Why |
|---|---|---|
| `legacy-root-pwa.html` | downloaded from production | real deployed app (12,933 lines, mobile bottom nav, etc.) — differs from `public/` version |
| `service-worker.js` | downloaded from production | real deployed SW, `CACHE_VERSION` `v0.26` vs repo's `v0.19` |
| `manifest.json` | downloaded from production | byte-identical to repo copy anyway |
| `index.html` | downloaded from production | byte-identical to repo copy anyway |
| `offline.html` | downloaded from production | byte-identical to repo copy anyway |
| `app.js` | **copied from repo `public/`**, NOT downloaded | production route `/app.js` serves the HTML app shell (`Content-Type: text/html`) instead of the real script — a live serving bug, see below |
| `styles.css` | **copied from repo `public/`**, NOT downloaded | same bug as `app.js` |
| `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | **copied from repo `public/`**, NOT downloaded | all five icon routes also serve the HTML app shell instead of real images/SVG — same bug, wider than first identified |

`CHECKSUMS.sha256` records the SHA-256 of every file in this folder as captured.

## New finding during capture: icon routes are also broken

The original roadmap (Section 3, P1) flagged `app.js` and `styles.css` returning HTML instead of
their real content. During this capture the same bug was found on `favicon.svg`,
`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `icon-maskable-512.png` — every one of
these routes on the live host returns HTTP 200 with `Content-Type: text/html` and ~528KB of app
shell markup, not the actual asset.

```text
GET /favicon.svg            -> 200, text/html, 528117 bytes
GET /apple-touch-icon.png   -> 200, text/html, 528117 bytes
GET /icon-192.png           -> 200, text/html, 528117 bytes
GET /icon-512.png           -> 200, text/html, 528117 bytes
GET /icon-maskable-512.png  -> 200, text/html, 528117 bytes
GET /app.js                 -> 200, text/html, 528117 bytes
GET /styles.css             -> 200, text/html, 528117 bytes
```

Practical effect: PWA install icons, the apple touch icon, and the browser tab favicon are likely
broken in production right now (serving as a broken/generic icon, or the browser silently
rejecting a non-image response). This needs to be added to Milestone 1 Step 5 alongside the
`app.js`/`styles.css` fix — likely the same root cause (a routing/rewrite rule that catches
unmatched static paths and falls back to the SPA shell instead of 404ing or serving the real
static file).

`service-worker.js`'s `APP_SHELL` list includes `./icon-192.png`, `./icon-512.png`,
`./icon-maskable-512.png`, and `./apple-touch-icon.png` — so `cache.addAll()` on install is also
precaching this garbage under all four icon cache keys, in addition to `app.js`/`styles.css`
already identified.

## Verification performed

- `legacy-root-pwa.html` was downloaded twice, roughly 10 minutes apart. The two downloads differ
  only in a Cloudflare bot-challenge token (`__CF$cv$params`, randomized per request) — the
  application content itself, including the 42 `mobile-bottom-nav` occurrences and the exact
  5-tab nav markup (Vault / Timeline / Packs / Profile / Settings), is byte-identical between the
  two captures.
- The repo-sourced icon files were confirmed to be real images via file-type inspection (PNG
  180x180, 192x192, 512x512 x2; SVG), not further HTML garbage.

## What this folder is NOT

This is a recovery snapshot, not a working `public/` directory yet. Milestone 1 Steps 4–7 still
need to: promote this into a proper branch, decide the `app.js`/`styles.css`/icon serving fix,
bump `CACHE_VERSION`, fix lint, and prove `npm run build` reproduces these bytes before this
becomes the new source of truth.

# BLUEWALLET PRO — VERIFICATION REPORT & MILESTONE 1 ROADMAP

Date: 2026-08-12
Prepared by: Claude
Inputs: `BLUEWALLET_HANDOVER.md`, `THE_BLUE_Full_Conversation_Transcript.pdf`, live production, local `work/` tree, GitHub remote.

Every claim below was checked against raw command output. Where the handover and reality disagree, reality is recorded.

---

## 1. HEADLINE FINDING

**The source code for what is currently deployed to production does not exist in this repository, in any sibling directory, or on any GitHub branch.**

The handover directs the next assistant to treat `bluewallet-sites-deploy-v6/public/legacy-root-pwa.html` as the production app. It is not. It is a stale pre-mobile-redesign build.

| | Deployed (live) | Repo `public/legacy-root-pwa.html` |
|---|---|---|
| Size | 529,055 bytes | 305,732 bytes |
| Lines | 12,933 | 6,206 |
| SHA-256 (first 16) | `2c1616dc507f34d4` | `ccb957753176827b` |
| `mobile-bottom-nav` hits | 42 | **0** |
| Service worker cache | `...rollback-v0.26` | `...rollback-v0.19` |

Searched for a matching source, found none:

```text
bluewallet-sites-deploy-v6/dist/client/legacy-root-pwa.html          305732  ccb9577531768...
bluewallet-sites-deploy-v6/build/package-stage-mobile-print-v0.18/…  301467  f37488bb2c410...
bluewallet-sites-deploy-v6/build/package-stage-pdf-v0.17/…           297822  5636050395bda...
bluewallet-sites-deploy-v6/build/package-stage-print-v0.16/…         295978  d2c6483057cc3...
bluewallet-sites-deploy-v6/build/package-stage-v0.15/…               293223  0c2e2144760d4...
bluewallet-sites-stage-v1/dist/client/legacy-root-pwa.html           290004  f410148862bdb...
github-pages-stable-6f9ede5/legacy-root-pwa.html                     290004  f410148862bdb...
```

GitHub branches (via `git ls-tree`):

```text
origin/development/stable-app-copy                302423 bytes
origin/feature/mobile-ui-redesign-prototype-clean 302423 bytes
origin/feature/prototype-ui-stable-integration    399109 bytes, 9151 lines, 10 mobile-bottom-nav hits  <-- closest, still not it
origin/main                                       (no legacy-root-pwa.html)
origin/next                                       (no legacy-root-pwa.html)
```

The `sites` remote returns nothing:

```text
$ git ls-remote --heads sites
(no output, exit 0)
```

**Consequence:** production cannot currently be rebuilt, patched, or rolled back from source. The only complete copy of the deployed app is the bytes served by the host. Any desktop redesign started before this is fixed would be built on a branch that silently reverts every mobile improvement Jenny approved.

**Mitigation already taken:** the deployed assets were downloaded during this inspection and are held at
`…\Temp\claude\…\9383d925-ed53-4661-ae72-44b8ed9ccb22\scratchpad\` (`live.html`, `live-sw.js`, `live_*`).
This is a session-scoped temp directory and is **not durable**. Milestone 1 Step 2 makes it permanent.

---

## 2. WHAT IS ACTUALLY WORKING (verified)

**Production is live and healthy.**

```text
https://bluewallet-pro-stable.cl76380.chatgpt.site/                       STATUS=200 LENGTH=529055
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa        STATUS=200 LENGTH=529055
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html   STATUS=200 LENGTH=529055
https://bluewallet-pro-stable.cl76380.chatgpt.site/service-worker.js      STATUS=200 LENGTH=1934
```

**The mobile phase is genuinely complete and deployed.** The handover's Section 4 is accurate about the *deployed app* — it just misattributes it to the repo file. Confirmed in live markup at line 7829:

```html
<nav class="mobile-bottom-nav" aria-label="Mobile primary navigation">
  <button type="button" class="active" data-mobile-nav="vault"><b>□</b><span>Vault</span></button>
  <button type="button" data-mobile-nav="timeline"><b>◷</b><span>Timeline</span></button>
  <button type="button" data-mobile-nav="packs"><b>▱</b><span>Packs</span></button>
  <button type="button" data-mobile-nav="profile"><b>♙</b><span>Profile</span></button>
  <button type="button" data-mobile-nav="settings"><b>⚙</b><span>Settings</span></button>
</nav>
```

Exactly the five tabs specified, with Vaccines correctly demoted to a category. No regressions — the live app is a strict superset of the repo version:

| Feature marker | Live | Repo |
|---|---|---|
| supabase | 9 | 9 |
| seatime | 39 | 23 |
| stcw | 42 | 15 |
| packs | 94 | 40 |
| vaccin | 66 | 31 |
| timeline | 109 | 15 |
| profile | 185 | 94 |
| encrypt | 64 | 62 |
| tesseract | 20 | 20 |
| indexeddb | 10 | 10 |

Also confirmed working:

- `npm test` — passes, 2/2 (`redirects the root route…`, `ships the stable app shell with in-app update support`).
- `npm run build` — succeeds (vinext / Vite 8.0.13, 5 environments).
- 8 themes present (`night`, `aurora`, `sunset`, `current`, `violet`, `indigo`, `yellow`, `red`).
- Custom pack creation, Supabase encrypted sync, Web Crypto, IndexedDB, Help/FAQ, in-app update prompt.
- `manifest.json` — the one asset that is byte-identical live vs repo.

---

## 3. WHAT IS BROKEN OR INCOMPLETE (verified)

**P0 — Production source lost.** Section 1 above. Blocks everything else.

**P1 — Deployment serves HTML for seven static-asset routes, including all PWA icons.** Found initially on `app.js`/`styles.css`; widened during Step 2 recovery to cover every icon route:

```text
GET /app.js                 -> 200, text/html, 528117 bytes
GET /styles.css             -> 200, text/html, 528117 bytes
GET /favicon.svg            -> 200, text/html, 528117 bytes
GET /apple-touch-icon.png   -> 200, text/html, 528117 bytes
GET /icon-192.png           -> 200, text/html, 528117 bytes
GET /icon-512.png           -> 200, text/html, 528117 bytes
GET /icon-maskable-512.png  -> 200, text/html, 528117 bytes
```

`service-worker.js`'s `APP_SHELL` lists all seven of these paths. Because the host returns 200 instead of 404, `cache.addAll()` succeeds and **silently precaches the app shell under all seven cache keys**. Likely a single routing/rewrite rule catching unmatched static paths and falling back to the SPA shell instead of serving the real file or 404ing. Practical impact: PWA install icons, apple-touch-icon, and the browser tab favicon are likely broken in production right now. Does not affect the wallet's core function since the app is self-contained in `legacy-root-pwa.html`, but it's a real, user-visible defect and directly corrupts the SW precache.

**P1 — Lint fails.** Reproduced exactly as the handover reported:

```text
public/app.js
  13:156  error  Expected an assignment or function call and instead saw an expression
  13:220  error  Expected an assignment or function call and instead saw an expression
tests/rendered-html.test.mjs
  21:20  error  '_' is defined but never used
✖ 3 problems (3 errors, 0 warnings)
```

`npm test` does **not** run lint, so this never gates a deploy.

**P2 — OCR is weak, and is not offline.** Tesseract.js 5.1.1 and pdf.js 4.10.38 both load from CDN at use time, with `OCR_TIMEOUT_MS = 45000`, `PDF_OCR_MAX_PAGES = 4`, `PDF_OCR_SCALE = 2.35`. For an offline-first app aimed at seafarers at sea, OCR simply does not work without connectivity. Jenny's assessment ("pathetic") is consistent with the implementation.

**P2 — Desktop redesign not started.** The live app has desktop breakpoints (1024, 1100, 1180, 1280) but they drive the legacy stable grid, not the Grok visual standard. This is the intended next phase and is correctly scoped as not-yet-begun.

**P3 — Repo hygiene.** `BLUEWALLET_HANDOVER.md` and four `build/` artifact sets are untracked. Per the handover, do not delete without Jenny's approval.

---

## 4. LIMITATION OF THIS REVIEW

The transcript PDF's **13 redesign mockup images could not be viewed** — PDF page rendering is unavailable in this environment (`pdftoppm` / poppler not installed). All 41 pages of *text* were extracted and read; the images are embedded raster and were not.

What the text gave us — the agreed design tokens, to be reused verbatim for desktop:

```text
Primary #0A1628   Accent #3B82F6   Success #22C55E   Warning #F59E0B   Danger #EF4444
Surface #111827 / #1E293B   Radius 16px cards / 12px buttons   Font Inter or system-ui
```

Plus the per-screen component list, light-mode variants, Lite mode, share bottom sheet, and interaction rules (swipe card → quick actions, long-press pack → multi-select).

**This matters for the desktop phase:** its acceptance criteria depend on those visual targets. Before desktop work starts, the mockup images need to be supplied as image files (e.g. the `rendered-*.jpg` referenced in the transcript), or poppler installed so the PDF can be rendered.

---

## 5. MILESTONE 1 — RECOVER AND LOCK THE PRODUCTION BASELINE

**Goal:** make production reproducible from source, so that a desktop redesign can be started without silently discarding the deployed mobile app.

**Definition of done:** a committed, pushed, tagged branch that builds to bytes matching what is live today; lint clean and enforced; a verified user-data backup on disk.

**Why this before desktop:** the handover's recommended next action is "create a desktop redesign branch." Doing that from the current repo would branch from the pre-mobile-redesign app and revert 42 bottom-nav rules plus the expanded timeline, packs, STCW, sea-time, and profile work. Milestone 1 is the prerequisite, not a detour.

### Step 1 — Back up user data first (Jenny, manual)

Open the live app, **Settings → Backup → Export**, save the JSON to `C:\Users\Jenny\Downloads\`. Nothing in this milestone touches IndexedDB, but the handover's trust rule is explicit: export a backup before any structural work. Confirm the file exists and is non-trivial in size before continuing.

### Step 2 — Capture the deployed bytes into the repo ✅ DONE (2026-08-12)

Captured into `recovered/` (checked into this branch, see `recovered/README.md` and `recovered/CHECKSUMS.sha256`):

- Downloaded for real from production: `legacy-root-pwa.html`, `service-worker.js`, `manifest.json`, `index.html`, `offline.html`.
- **Not** taken from the server: `app.js`, `styles.css`, and all five icon files. Confirmed during this step that those seven routes all serve the HTML app shell (P1 above) rather than their real content — taking them from the server would have baked garbage into the recovery. Copied from the repo's `public/` instead, after confirming those local copies are real files (correct PNG dimensions, real SVG, matched sizes from the original handover scan).

### Step 3 — Prove the capture is complete and correct ✅ DONE (2026-08-12)

`legacy-root-pwa.html` was downloaded twice, ~10 minutes apart (once during initial investigation, once during Step 2). Diffed: the only difference is a Cloudflare bot-challenge token (`__CF$cv$params`, randomized per request, injected by the CDN, not the app). With that line excluded, the two captures are byte-identical. Confirmed in the recovered file:

- `mobile-bottom-nav` — 42 occurrences, 5-tab nav present (`Vault / Timeline / Packs / Profile / Settings`), Vaccines correctly absent from the tab bar
- feature-marker counts match the Section 2 table
- file closes with `</html>` (download is complete, not truncated)

### Step 4 — Establish the recovered state as source of truth

Create `recovery/production-baseline-20260812` from current `main`. Replace `public/` with the recovered assets. Commit as `Recover deployed production source`.

Keep the stale `public/legacy-root-pwa.html` in history — do not force-push or rewrite. The old file is the only artifact that shows what the pre-mobile app looked like.

### Step 5 — Close the app-shell serving bug

Decide, with Jenny, which is true:

- `app.js` / `styles.css` are unused by the wallet → remove both from `APP_SHELL` in `service-worker.js`, bump `CACHE_VERSION` to `v0.27`; **or**
- they are needed → fix hosting so they serve with correct MIME types.

Evidence points to the first. Either way `CACHE_VERSION` must be bumped, or clients keep the poisoned precache.

### Step 6 — Fix lint and make it gate deploys

Fix the three errors (`public/app.js` 13:156 and 13:220; `tests/rendered-html.test.mjs` 21:20), then change `package.json`:

```json
"test": "npm run lint && npm run build && node --test tests/rendered-html.test.mjs"
```

Run `npm test` and `npm run lint` — both must be clean.

### Step 7 — Verify reproducibility

Run `npm run build`, then hash `dist/client/legacy-root-pwa.html` against the live hash. They must match apart from the intended Step 5 service-worker change. **This is the step that actually closes the milestone** — until a local build reproduces production, the source of truth is not re-established.

### Step 8 — Push with the handover's verification protocol

Raw output required for all four, no summaries:

```bash
git status --short --branch
git log --oneline -5
git push origin recovery/production-baseline-20260812
git ls-remote origin recovery/production-baseline-20260812
```

The remote hash must visibly change to the new local commit hash. Then tag the baseline and push the tag.

### Step 9 — Re-verify production is untouched

Milestone 1 changes no deployed behaviour except the Step 5 service-worker fix. Re-check all four URLs return 200, and confirm the live app still shows the 5-tab bottom nav on a real phone.

### Step 10 — Correct the handover

Amend `BLUEWALLET_HANDOVER.md` Section 2 to state that `public/` was stale as of 2026-08-12, name the recovery branch, and record that the `sites` remote returns no heads. The next assistant must not repeat this discovery.

---

## 6. AFTER MILESTONE 1

Only once Step 7 passes:

- **Milestone 2 — Desktop Grok redesign.** Branch `feature/desktop-grok-redesign` from the *recovered baseline*, not from current `main`. Blocked until the mockup images are available (Section 4). Screen order per handover Section 5: dashboard → document detail → settings/backup → packs/timeline/sea-time/STCW/vaccines, with functional regression after each group.
- **Milestone 3 — OCR rebuild.** Self-hosted Tesseract worker and pdf.js so OCR works offline, which is the actual product promise.
- **Milestone 4 — Physical device matrix.** iOS Safari/PWA, Android Chrome/PWA, Windows Edge/Chrome, camera, native share/print.

## 7. OPEN QUESTIONS FOR JENNY

1. **Was anything deployed from a machine or directory not in `work/`?** If a newer working copy exists elsewhere, recovering from it is cleaner than recovering from served bytes.
2. **Should the `sites` remote be re-authenticated?** It currently returns no heads, so hosted deploy history is invisible.
3. **Can the 13 mockup images be provided as image files?** Needed before desktop work can be accepted against a visual standard.
4. **Delete the four untracked `build/` artifact sets?** Held pending approval per the handover.

# BLUEWALLET PRO HANDOVER

Original prepared: 2026-08-12, by Codex
Updated: 2026-08-15, by Claude (Claude Code)
Project owner: Jenny

This handover is self-contained. Assume no access to the original chat history, prior sandbox state, or unstated project memory. If you are picking this project up cold, read this document top to bottom before touching anything, then read [`DEPLOYMENT.md`](DEPLOYMENT.md) before deploying and [`PLAYWRIGHT_AUDIT.md`](PLAYWRIGHT_AUDIT.md) before changing anything covered by the e2e suite.

## 1. PROJECT OVERVIEW

BlueWallet-Pro is an offline-first maritime document wallet for seafarers. Its purpose is to let a seafarer store, view, check, print, export, and sync personal maritime documents such as passports, CDC, certificates, visas, medical documents, yellow fever/vaccine records, contracts, sea-time records, STCW compliance packs, and related joining-vessel paperwork.

Target users:

- Individual seafarers managing personal joining and compliance documents.
- Users who need access on mobile while offline.
- Users who want local-first privacy with optional encrypted cloud sync.
- Users who need quick pack sharing, expiry awareness, and checklist-driven readiness.

## 2. PRODUCTION DEPLOYMENT (read this before deploying anything)

**Primary, current production:**

```text
https://bluewallet-pro.cl76380.workers.dev/legacy-root-pwa
```

Cloudflare Workers, deploying **automatically on every push** to the `feature/desktop-grok-redesign` branch (Cloudflare's dashboard is configured with that branch as its production branch — this is not GitHub's default branch, see §3). No manual handoff, no weekly limit. Full mechanism, gotchas, and independent-verification steps are in [`DEPLOYMENT.md`](DEPLOYMENT.md) — read it before your first deploy, it documents seven real, hard-won gotchas (duplicate compat flags, stale "Retry" builds, root-directory confusion, etc.).

**Legacy, still live but rarely touched:**

```text
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa
```

An older ChatGPT Sites deployment. It only updates via a manual Codex handoff gated by an account-wide weekly usage limit — see `DEPLOYMENT.md`'s "Legacy: ChatGPT Sites" section if that URL specifically needs updating. It is now **behind** Cloudflare (missing everything shipped since the desktop redesign). Nothing forces a switchover; there's no plan to retire it, just don't treat it as primary.

Local dev/deploy workflow:

```bash
npm install
npm test          # lint + build + render tests -- run before every push
npm run test:e2e  # Playwright e2e/a11y/visual suite -- see PLAYWRIGHT_AUDIT.md
git push origin feature/desktop-grok-redesign   # this alone deploys to Cloudflare
```

Do not treat `mjjenny.github.io/BlueWallet-Pro` (GitHub Pages) as production — it's retired, and reviving it needs Jenny's explicit re-approval.

## 3. REPOSITORY STATE (as of 2026-08-15)

Repository: `https://github.com/mjjenny/BlueWallet-Pro.git`

GitHub's **default branch is `main`**, but `main` is a **mirror**, not the deploy source — Cloudflare deploys from `feature/desktop-grok-redesign` regardless of what `main` points at (see §2). Keep them in sync by fast-forwarding `main` after pushing to the feature branch; don't rely on `main` alone to know what's live.

Branch/tag structure, current heads:

| Ref | Points to (short) | Purpose |
|---|---|---|
| `feature/desktop-grok-redesign` | `9d0fcde` | **The live deploy source.** All active work happens here. |
| `main` | `9d0fcde` | Mirrors the deploy branch (kept in sync via `git merge --ff-only`). |
| `v1.0.0` (tag) | `d3aea6a` | Annotated release tag, fastest rollback: `git checkout v1.0.0`. |
| `backup/pre-cleanup-stable` | `75025cd` | Snapshot immediately before the 2026-08-15 repo cleanup (§7.5), in case that cleanup ever needs reverting. |
| `archive/original-main` | `adcda08` | The *original* `main` history (an unrelated flat static-file dump, 8 commits, no `package.json`) — preserved here after `main` was force-updated to point at the real codebase. Historical only, not for active use. |
| `development/stable-app-copy`, `feature/mobile-ui-redesign-prototype-clean`, `next`, others | — | Pre-desktop-phase branches from the Codex/mobile-redesign era. Read-only references; not production. |

**Important history note:** `main` was force-pushed on 2026-08-15 to replace the old unrelated 8-commit history with the real codebase (`feature/desktop-grok-redesign`'s history, of which `main` is a strict ancestor/fast-forward). The old history wasn't lost — it's preserved at `archive/original-main`. If you're about to touch `main`, re-fetch it first (`git fetch origin main`) and confirm it's still what you expect before pushing; don't assume a locally-cached `main` ref is in sync with GitHub without fetching.

Verify current state before trusting anything above (refs move):

```bash
git fetch origin
git ls-remote --heads origin
git ls-remote --tags origin
```

### Directory tree (tracked files only, as of `9d0fcde`)

```text
bluewallet-sites-deploy-v6
|-- .openai/hosting.json          -- ChatGPT Sites project id, for the legacy deploy path
|-- app/                          -- Vinext app wrapper (routing/layout), NOT the wallet app itself
|   |-- chatgpt-auth.ts
|   |-- globals.css
|   |-- layout.tsx
|   +-- page.tsx
|-- build/sites-vite-plugin.ts    -- tracked source file (Sites integration plugin); NOT the same
|                                     as the untracked build/*.tgz release archives (gitignored, see below)
|-- public/                       -- THE PRODUCTION APP. This is what's actually served.
|   |-- legacy-root-pwa.html      -- the entire wallet app: single-file HTML/CSS/JS, ~600KB
|   |-- service-worker.js         -- PWA cache/update behavior, currently v0.29
|   |-- manifest.json             -- install-to-home-screen metadata
|   |-- index.html, app.js, styles.css, offline.html, icons  -- hosted-site wrapper/support assets
|-- worker/index.ts               -- Cloudflare Worker entry
|-- tests/
|   |-- rendered-html.test.mjs    -- basic route/version smoke tests (part of `npm test`)
|   +-- e2e/audit.spec.ts         -- Playwright + axe-core suite (part of `npm run test:e2e`, see PLAYWRIGHT_AUDIT.md)
|-- wrangler.toml, vite.config.ts, next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
|-- package.json, package-lock.json
|-- README.md, DEPLOYMENT.md, PLAYWRIGHT_AUDIT.md, REDESIGN_ROADMAP.md, MILESTONE_1_ROADMAP.md, BLUEWALLET_HANDOVER.md (this file)
```

**Removed in the 2026-08-15 cleanup** (do not recreate without a reason): `recovered/` (a full duplicate of `public/`, dead), `db/`, `drizzle/`, `drizzle.config.ts`, `examples/` (unused D1/Drizzle starter scaffolding — this app has no server database), `app/_sites-preview/` (unreferenced anywhere, verified removable by building with it moved aside first).

`.gitignore` covers `node_modules`, build outputs (`dist/`, `.next/`, `.vinext/`, `.wrangler/`, `playwright-report/`, `test-results/`), env files, and — added in the cleanup — `/.claude/` (local Claude Code tool config) and `/build/` (historical manual-deploy `.tgz` release archives, still on disk, just no longer at risk of accidental commit).

Frozen paths (change only deliberately, with regression testing):

- `public/legacy-root-pwa.html` — the entire app. Small CSS changes can affect many screens; it's one large file.
- `public/service-worker.js` — bump `CACHE_VERSION` (and the matching `APP_CACHE_VERSION` constant inside `legacy-root-pwa.html`) on every app-shell change, or updates won't propagate to installed PWAs.
- `public/manifest.json` — install behavior.

## 4. TECH STACK & BUILD

```json
{
  "scripts": {
    "dev": "vinext dev",
    "build": "vinext build",
    "start": "vinext start",
    "test": "npm run lint && npm run build && node --test tests/rendered-html.test.mjs",
    "test:e2e": "playwright test",
    "lint": "eslint . --ignore-pattern dist --ignore-pattern .next"
  },
  "dependencies": { "react": "19.2.6", "react-dom": "19.2.6" },
  "devDependencies": {
    "@axe-core/playwright", "@cloudflare/vite-plugin", "@playwright/test",
    "eslint" (+ plugins), "tailwindcss", "typescript", "vinext", "vite", "wrangler"
    // full list in package.json -- drizzle-orm/drizzle-kit/react-loading-skeleton
    // were removed in the 2026-08-15 cleanup as unused
  }
}
```

`npm test` currently passes clean (lint + build + render tests, zero errors, zero warnings) — this was not always true; a prior handover noted 3 lint errors that have since been fixed.

Stable wallet app internals:

- Single-file HTML/CSS/JavaScript PWA in `public/legacy-root-pwa.html`.
- Browser storage: IndexedDB.
- Optional encrypted sync: Supabase REST API, payloads encrypted locally before upload (AES-GCM via Web Crypto).
- OCR: Tesseract.js/OpenCV-style scanner code exists but is **known weak** — Jenny has called it "pathetic." Treat as an unsolved future item, not release-grade.
- PDF viewing/printing: has mobile print workarounds (no native print dialog on mobile browsers); see git log for `print`/`PDF` commits if touching this area.

Environment variables / secrets: **none at build time.** No `.env` file exists or is needed — Supabase sync settings (project URL, anon key, vault ID, passphrase) are entered by the user at runtime in the app's own Settings screen, never committed to source. `.openai/hosting.json` holds only a project id (not a secret) for the legacy Sites deploy path.

## 5. MOBILE PHASE — completed (pre-2026-08-12)

Established the "Grok" visual standard the rest of the app now follows: deep navy/ocean atmosphere, glassmorphism panels, electric-blue primary actions, strong status colors (green/yellow/red/blue), bottom nav (Vault / Timeline / Packs / Profile — Sea Time later added as a fifth), thumb-friendly controls, iOS safe-area awareness.

Shipped: full mobile UI redesign, Settings/appearance theme fixes, Help/FAQ ported into the redesigned shell, archive concept for expired-but-not-actionable documents (e.g. old passports), mobile PDF/print handling, in-app update prompt so users don't need a hard refresh.

Known deferred items from this phase (still true, see §9): OCR quality, full physical-device test matrix (iOS Safari/PWA, Android Chrome/PWA — some of this has since been partially covered by Playwright's real WebKit/Chromium engines, see `PLAYWRIGHT_AUDIT.md`, but not real hardware).

## 6. DESKTOP PHASE — completed (2026-08-12 through 2026-08-15)

The 2026-08-12 handover left this as "the next work," with a recommended plan and a not-yet-created branch. Both are now done: `feature/desktop-grok-redesign` exists with 70+ commits and is the live production branch. Highlights (see `git log feature/desktop-grok-redesign` for the full, real sequence — commit messages are accurate and specific in this repo):

- Full desktop Grok-standard redesign: sidebar nav, dashboard grid, document detail split view — every mobile-phase feature preserved, none dropped.
- Multiple rounds of real UX review (roadmap-tracked, see `REDESIGN_ROADMAP.md`) fixing real bugs: desktop sidebar-nav bleeding into mobile causing page-wide horizontal overflow, Tools-dropdown clipping/overflow at tablet width, stat-pill icon regressions, Timeline filter bugs, PIN standardization, and more.
- **A real Playwright + axe-core e2e/a11y/visual-regression suite** was added (`tests/e2e/audit.spec.ts`, real Chromium/WebKit engines, not simulated) — this is the single biggest process change since the last handover. Full detail, methodology, and results in [`PLAYWRIGHT_AUDIT.md`](PLAYWRIGHT_AUDIT.md); do not duplicate it here, just know it exists and **run `npm run test:e2e` before shipping anything that touches the UI**.
- That suite caught real bugs manual "click it and look" verification had missed (see `PLAYWRIGHT_AUDIT.md` §3 for the mechanism: `element.click()` fires a handler regardless of visibility, so it never proves reachability the way a real browser click does) — 4 defects on the first pass, 3 more unlabeled-form-control defects on a follow-up accessibility sweep, all fixed.
- A P2 flaky-desktop-layout issue (Issue #5) was root-caused and fixed: `service-worker.js`'s `clients.claim()` fires `controllerchange` on a first-time visitor too, not just real updates; the app's reload-on-controllerchange handler didn't distinguish the two, causing a spurious reload on every first visit. Fixed with a `hadControllerAtLoad` guard, locked in with a regression test.
- A new feature — **Pre-Deployment Checklist** (🎒 Packing) — was added: a static 6-category/28-item personal packing reference (from Jenny's own reference doc), reachable via the desktop/tablet Tools dropdown and the mobile Packs-screen shortcut row, mirroring the existing STCW/Vaccines pattern.
- The repository was cleaned for production (§3, §7.5): dead scaffolding and a duplicate app copy removed, `.gitignore` hardened, backup/archive branches and a `v1.0.0` tag established.

Current state: desktop and mobile share the same Grok visual standard, feature parity is verified by the Playwright suite across 3 viewport profiles (Desktop-Chromium 1920×1080, Tablet-WebKit 768×1024, Mobile-WebKit 390×844), and the app is live at the Cloudflare URL in §2.

## 7. SESSION LOG — 2026-08-14/15 (this handover's author, Claude)

Picked up mid-stream (the desktop redesign and most of the roadmap work above predates this session). What this session specifically did, in order:

1. **Root-caused and fixed Issue #5** (§6) — the desktop reload-instability flake `PLAYWRIGHT_AUDIT.md` had flagged as "not fixed."
2. **Extended the accessibility sweep** to the screens the audit report had flagged as uncovered (Settings, Packs, Timeline, STCW, Vaccines, Sea Time) — found and fixed 3 more unlabeled-form-control defects (Settings: 5 fields, Sea Time: 4, Vaccines: 2), same class as an earlier-fixed defect.
3. **Built the Pre-Deployment Checklist feature** (§6), including new Playwright coverage (reachability from both entry points + an axe-core scan).
4. **Cleaned the repository for production**: removed `recovered/`, `db/`, `drizzle/`, `examples/`, `app/_sites-preview/` (all verified dead — either zero references found, or explicitly already flagged as unused in the prior handover); dropped the now-orphaned `drizzle-orm`/`drizzle-kit`/`react-loading-skeleton` dependencies; hardened `.gitignore`.
5. **Established the branch/tag structure** in §3: `backup/pre-cleanup-stable` before the cleanup commit, then the cleanup, then `main` fast-forwarded to match, tagged `v1.0.0`. Hit a real problem doing this — see the "Important history note" in §3 — which led to preserving the old `main` at `archive/original-main` before force-pushing the real history onto `main`.
6. **Updated `README.md`** to correct a stale claim (it listed the legacy ChatGPT Sites URL as *the* production URL with no mention of Cloudflare) and document the new branch/tag structure.
7. **Wrote this handover update.**

Every push in this session was verified independently, not just trusted from the push command's own output: raw `git ls-remote` hash comparison after every push, and for deploys specifically, re-downloading the live URL and diffing it byte-for-byte against the local build (expect exactly one difference: Cloudflare's per-request bot-challenge token). This matches the verification discipline §8 already establishes — it's not new, just re-confirmed as still the right way to work here.

## 8. MULTI-AGENT HISTORY & RULES

**Qwen incident** (pre-dates this and the prior handover's authoring session): Qwen was used as a prototype worker, repeatedly claimed pushes/commits had happened when remote verification showed they hadn't, and at one point touched files outside its approved scope (`.gitignore`, `package-lock.json`), triggering a reset. Jenny said to leave Qwen out unless she explicitly requests it again. Treat this as precedent, not just history: it's *why* the verification protocol below is mandatory, not optional.

**Mandatory verification protocol** — after every claimed commit/push, paste raw output for:

```bash
git status --short --branch
git log --oneline -5
git push <remote> <branch>
git ls-remote <remote> <branch>
```

The remote hash must visibly change to the new local commit hash. No agent may claim a push succeeded without the raw `git push` and raw `git ls-remote` output. For anything that deploys (pushing to `feature/desktop-grok-redesign`), additionally re-download the live URL and diff it against the local build — a successful push is not the same as a successful, correct deploy (`DEPLOYMENT.md` documents a real incident where it wasn't).

Branch/write ownership: `feature/desktop-grok-redesign` is the actively-owned production branch — whichever assistant is working should treat it as such, keep `main` synced (fast-forward only, and fetch `origin/main` fresh first — see §3's note about not trusting a stale local ref), and not revive `gh-pages`/GitHub Pages without Jenny's explicit approval.

Trust rules (unchanged, still load-bearing):

- User documents are local-first in browser IndexedDB. Never promise they're safe without backup/sync verification.
- Never reset, rewrite, or delete user data. Before any destructive operation, prefer a reversible step (backup branch, export) over deleting.
- Never change stable production UI/layout/animation without explicit permission, unless the task explicitly asks for that redesign.
- For design/UI claims, real-browser evidence (Playwright, screenshots) matters more than a description of what should be true. For push/deploy claims, raw command output matters more than a summary.

## 9. WORKFLOW CONVENTIONS

Commit message style: imperative, concise, and specific about *why* when it's non-obvious — e.g. `Fix spurious first-visit SW reload (Issue #5)`, not `Fix bug`. This repo's commit messages are generally trustworthy as a change log; `git log` is a legitimate way to understand what happened and why.

Branch naming observed: `feature/*` for active work, `development/*` for stable-copy branches, `docs/*` for planning docs, `archive/*` for preserved-but-retired history, `backup/*` for pre-risky-operation snapshots.

Jenny's working style: direct and outcome-focused; wants visible proof for git pushes/deploys/UI fixes, not reassurance; wants features preserved through redesigns, not just visual churn; will explicitly correct a plan if it's built on a wrong assumption (see §3's `main` incident) — surface problems like that rather than working around them silently.

Local environment: Windows, PowerShell primary shell (Bash tool also available). Project root for this deploy target:

```text
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6
```

## 10. OPEN QUESTIONS / RISKS (current as of 2026-08-15)

Still open:

1. **OCR quality is weak** (Jenny: "pathetic"). Unsolved. Treat any OCR-adjacent work as starting from a known-bad baseline, not a polish pass.
2. **No real hardware testing.** Playwright's WebKit/Chromium engines give strong signal (real rendering, real click semantics — see §6) but aren't the same as actual iOS Safari/PWA or Android Chrome/PWA on physical devices. Still worth doing before treating the app as fully release-hardened.
3. **`app/_sites-preview/` was removed on the assumption it's genuinely unused** (verified by a build-with-it-moved-aside test, not just static analysis). If the ChatGPT Sites hosting connector's preview feature ever breaks, this is the first thing to check — it may have been a hosting-platform convention folder that static analysis couldn't fully rule out.
4. **A Mobile-WebKit + axe-core flake exists in this specific sandbox** — `axe-core`'s `.analyze()` call intermittently times out on Mobile-WebKit only (not Desktop-Chromium or Tablet-WebKit), hitting essentially random tests across runs. Confirmed environmental (reproduces on untouched, previously-passing tests) not a real defect — see `PLAYWRIGHT_AUDIT.md`'s "Known environment caveat" section. If it recurs, don't treat it as a regression without isolating and reproducing first.
5. **Supabase encrypted sync** depends entirely on user-entered settings (project URL, anon key, vault ID, passphrase) — don't assume any given device has synced data without pull-verifying.

Resolved since the last handover (no longer open): production deployment mechanism (now unambiguous, Cloudflare/§2), desktop phase (§6, done), the `db`/`drizzle`/`examples` "should this be removed" question (removed, §7.5), lint errors (fixed, clean).

Immediate recommended next action for whoever picks this up next:

1. Confirm current state hasn't drifted: `git fetch origin`, re-check §3's ref table, `npm test` and `npm run test:e2e` locally.
2. If continuing feature work: branch from `feature/desktop-grok-redesign`, not `main`.
3. If the next task is OCR or physical-device testing, both are real, scoped, known gaps (§10.1, §10.2) — good next increments if nothing more urgent is requested.
4. Whatever the task, close it out the way this session did: verify locally (`npm test` + relevant Playwright coverage) before pushing, verify the push with raw `git ls-remote` output, and for anything that deploys, independently re-diff the live URL against the local build before calling it done.

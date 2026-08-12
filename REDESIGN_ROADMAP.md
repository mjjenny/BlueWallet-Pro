# REDESIGN ROADMAP — "THE BLUE" Seafarer Digital Wallet

Derived from `desktop redesign plan.pdf` (2026-08-12), cross-checked against the
actual code in `public/legacy-root-pwa.html` rather than assumed. Every "already
done" and "doesn't exist" below was verified by grep/DOM inspection.

Scope note: the plan is titled "desktop" but is really a **whole-app** redesign —
it explicitly includes "Mobile-First Notes (Critical)" and specifies bottom nav
on mobile / left rail on desktop. Treating it as whole-app here.

---

## Where things actually stand

| Plan item | Reality | Effort left |
|---|---|---|
| Readiness hero (score + metrics + CTA) | **Done** (1.1, `c2c4c34`) — progress ring, adaptive label/CTA, verified live | — |
| Left rail on desktop | **Done** — added this session, 5 items, wired to existing nav JS | — |
| Bottom nav on mobile | **Done** — shipped in the mobile phase | — |
| Pack cards with progress | **Mostly done** — 4 auto-packs render with progress *bars*, status colours, and completion counts. Plan asks for *rings*. | Restyle only |
| Timeline colour-coding | **Partially done** — `.tl-item.warn` / `.tl-item.bad` colour-code by status; 13-month grid wraps properly on desktop | Add filters + prominence |
| Category status strips | **Done** (1.2, `206d913`) — coloured strip on each category tab | — |
| Guided empty states | **Done** (1.3, `206d913`) — per-category icon/copy/CTA, 9 categories | — |
| Collapse the "tool dump" | **Done** (1.4, `206d913`) — Search/Sort/Filter/View + one Tools dropdown | — |
| Settings grouping | Sections exist but flat; desktop 2-column already shipped | Regroup into 6 |
| Sea Time as primary tab | **Done** (1.5, `206d913`) — Option A shipped | — |

---

## Nav decision — resolved: Option A

Sea Time is now a primary tab (Vault · Packs · Timeline · Sea Time · Profile);
Settings moved under Profile (still reachable via the header gear icon too —
both paths call the same `openSettingsUI()`). Shipped in `206d913`.

---

## Phase 1 — High-impact visual & IA

The plan's own priority order, kept.

### 1.1 Readiness hero *(biggest single win)* — ✅ DONE (2026-08-12, `c2c4c34`)
Replaced the flat `.profile-strip` hero with an animated circular readiness
ring (`computeReadiness()`), the existing stat pills (Total · Expiring ·
Expired), and an adaptive CTA/label: "Getting started" + "+ Add first
document" when empty, "Missing: X, Y" + "+ Add Document" when partial, "Ready
to join" at 100%. Ring colour: red (<60%), amber (60–99%), accent (100%).

Formula used (not re-confirmed with user beyond "ok start with it" — flag if
it should change): % of the 5 `JOIN_REQUIRED` categories (passport, CDC, COC,
medical, STCW/certificate) with at least one present, non-archived,
non-expired document. Stricter than the pre-existing `renderChecklist()`
(which counts "present" alone, even if expired).

Verified in-browser at mobile (375px) and desktop (1280px) viewports across
empty/40%/80%/100% states — no overlap, no overflow, ring/label/CTA all
update correctly. `npm test` clean. Pushed to `feature/desktop-grok-redesign`,
confirmed byte-identical live on Cloudflare (`READINESS RING` marker present).

### 1.2 Category cards with status strips — ✅ DONE (2026-08-12, `206d913`)
Each category tab now shows a coloured strip along its bottom edge via
`categoryStatus(type)`: worst-case across that category's non-archived docs
(one expired doc → red, even if a second valid one exists; amber if soonest
risk is "expiring"; green if all valid; grey if empty). Verified across
good/warn/bad/empty states and at mobile (375px) + desktop (1280px).

### 1.3 Guided empty states — ✅ DONE (2026-08-12, `206d913`)
Replaced the single generic empty state with per-category copy (`EMPTY_STATE_COPY`,
9 entries) answering what/why/CTA, e.g. "Your passport is the foundation of
every joining..." → **[ + Add Passport ]**. The CTA reuses `openAdd()`'s
existing category preselection, so it's functionally accurate, not just
cosmetic. Verified copy switches correctly across all 9 categories.

### 1.4 Collapse the 12-button tool row — ✅ DONE (2026-08-12, `206d913`)
Search/Sort/Filter/View-toggle stay visible. Checklist/Calendar/STCW/Vaccines/
Select moved into a single "🛠 Tools" dropdown (click-outside-to-close, closes
on item select). Timeline/Packs/Sea time buttons removed — redundant with
primary nav now that Sea Time is a tab. Summary/Share moved into the Profile
sheet. Verified dropdown opens/populates/closes correctly at desktop width,
and that the pre-existing narrow-viewport tool-row collapse (`max-width:760px`)
is unaffected.

### 1.5 Nav change — ✅ DONE (2026-08-12, `206d913`)
Sea Time → primary tab; Settings → under Profile (Option A). Verified: nav
order on both sidebar and bottom-nav, Sea Time tab opens the log and hides
the nav correctly, Profile → Settings closes Profile and opens Settings.

---

## Phase 2 — Packs & Timeline polish

### 2.1 Pack progress rings
Swap the existing progress bars for rings. Cards, colours, and completion logic
already work — visual change only.

### 2.2 Pack detail = checklist view
Tapping a pack currently opens the doc-picker. Plan wants a checklist showing
each *required* document with present/missing status and per-row "Add missing".
This is the biggest functional add in Phase 2 — it needs a defined required-doc
list per pack (the `packModels` array already declares `types` and `total`, so
there's a foundation).

### 2.3 Timeline risk visualisation
- Filter chips: All / Critical / Next 90 days
- Promote "Renewal plan" and "Missing document tracker" above the month grid
  (they're currently below it, easy to miss)

### 2.4 Profile + Sea-time presentation
Profile → clean identity card. Sea-time → chronological list plus a summary
(total days, last vessel) — the summary is new; the log itself already works.

---

## Phase 3 — Polish & delight

- **3.1** Card entrance animations, animated progress rings, success feedback on
  add / pack-completion. *(Respect `prefers-reduced-motion` — the app already
  has handling for it.)*
- **3.2** Onboarding improvements; make "Install / Add to Home Screen" more
  prominent — it's currently buried in Settings despite being critical for a PWA.
- **3.3** Theme refinements + accessibility pass (contrast, focus states, touch
  target sizes).

---

## Sequencing note

Phase 1 items are independent except 1.5 — they can ship one at a time, each
verifiable on its own. Recommend **1.1 first**: it's the single most visible
change, it's what makes the app feel like a "premium career companion" rather
than a "competent utility" (the plan's own framing), and it needs the readiness
formula agreed anyway, so starting it surfaces that question early.

Per the handover's rule and how this session has run: **one screen at a time,
verified in-browser, screenshot-reviewed before moving on.** The desktop pass
earlier this session showed why — geometry checks alone confirm code shipped,
not that it looks right.

---

## Phase 1 status: complete

All five items (1.1–1.5) shipped and verified live on Cloudflare as of
2026-08-12. Both open questions are resolved: readiness formula per 1.1's
notes above; nav decision = Option A. Next up is Phase 2 (Packs & Timeline
polish) — not started, no blockers.

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
| Pack cards with progress | **Done** (2.1, `9db0160`) — animated rings replace the bars | — |
| Timeline colour-coding | **Done** (2.3, `8f9403c`) — filter chips + renewal plan/missing tracker promoted above the grid | — |
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

## Phase 2 — Packs & Timeline polish — ✅ DONE (2026-08-12)

### 2.1 Pack progress rings — ✅ DONE (`9db0160`)
Swapped the horizontal bars for animated SVG rings (same stroke-dashoffset
pattern as the 1.1 readiness ring). Found and fixed a pre-existing gap along
the way: the pack card's icon box had no width/height/background at desktop
widths (min-width:1024px) — it silently fell back to an unstyled full-width
block. Also found that my first pass at the ring CSS was accidentally scoped
inside `max-width:700px`, making it structurally broken at wider viewports
(worked "by accident" on the surface, broke on inspection) — moved the shared
ring structure (position/absolute-SVG/track/fill) to unconditional CSS, with
only sizing varying per breakpoint.

Also removed pre-existing dead code found while working in this area:
`openPacksUI()` and `openStcwUI()` were each declared twice; the earlier
copies were fully shadowed by later ones and never executed.

### 2.2 Pack detail = checklist view — ✅ DONE (`9db0160`)
Clicking a pack card (not its buttons) opens `openPackDetail()`: matched
documents with status pills, a synthesized "N more needed" row, and "+ Add
missing document" that pre-selects the pack's category. Reuses the existing
STCW matrix-row styling rather than inventing new CSS. Scoped to the 4 auto
packs only (`types`/`total` give them a real "required" concept) — custom
packs don't have a defined required-doc list, so they keep the existing
document-picker flow.

### 2.3 Timeline risk visualisation — ✅ DONE (`8f9403c`)
Filter chips (All / Critical / Next 90 days) added, shared between the mobile
card list and desktop month grid. "Critical" reuses the app's own
`reminders.critical` threshold (7 days) rather than a new number; "Next 90
days" lines up with `reminders.secondary`'s default (90). Renewal plan and
Missing document tracker now render above the month grid. Empty months
collapse under a filter instead of showing a bare "-".

### 2.4 Profile + Sea-time presentation — ✅ DONE (`6167479`)
Added a summary card (total days, last vessel) above the sea-time log, hidden
in the add/edit-entry view. Profile modal was checked against "clean identity
card" — already a single-column photo + identity form with no concrete gap,
so left unchanged rather than inventing unrequested redesign work.

**Found and fixed** (2026-08-12, `46e544c`): the Packs modal's card list was
`display:none` for the entire 701–1023px viewport width range — root cause
was `.mobile-pack-list` sharing a "hidden by default" rule with genuinely
mobile-exclusive chrome, with nothing re-enabling it between the
`max-width:700px` and `min-width:1024px` overrides. Fixed by giving
`.mobile-pack-list`/`.mobile-pack-card` their own unconditional visible
defaults; the two breakpoint-specific rules still refine layout at their
own widths via normal cascade order. Verified at 375px/850px/1280px,
byte-identical live.

---

## Phase 3 — Polish & delight — ✅ DONE (2026-08-12)

### 3.1 Entrance animations + success feedback — ✅ DONE (`4cf0b06`)
Category tabs and pack cards now share the existing `.doc` `rise` entrance
animation (staggered `nth-child` delays) instead of only document cards
having one. Found and fixed a real pre-existing gap while doing this:
`.doc`'s animation had no `prefers-reduced-motion` override at all — added
one covering all three animated card types.

Document save now shows a toast: "Document added"/"Document updated"
normally, or "🎉 &lt;Pack name&gt; complete!" when the save pushes an auto-pack
from incomplete to fully matched. Hoisted the previously `openPacksUI()`-local
pack definitions to a shared `PACK_MODELS` constant so both the Packs view
and the save handler read the same data.

### 3.2 Install prominence — ✅ DONE (`4cf0b06`)
Added a dismissible install banner at the top of the Vault view, shown
whenever the app isn't running standalone and hasn't been dismissed before
(persisted via `localStorage`). Reuses the existing
`beforeinstallprompt`/`deferredInstall` logic through a shared
`triggerInstall()` — the original Settings button still works via the same
function. Needed an explicit `grid-area` in the one place `.main` uses
`grid-template-areas` (`min-width:901px`) to avoid CSS Grid guessing where
an unassigned child belongs.

### 3.3 Accessibility pass — ✅ DONE (`5c43a1e`)
- Fixed a real gap: `.search-box input` removed its focus outline with no
  visual replacement — keyboard users got zero indication it was focused.
  Added `.search-box:focus-within` matching the existing `.field` pattern.
- `.x` (modal close buttons, used everywhere) had no explicit hit-area and
  fell under 44px in most contexts (only mobile-specific `!important`
  overrides at 48–52px covered narrow widths). Gave it a 44×44 minimum;
  existing overrides still win where they already applied.
- Bumped the install banner's dismiss button and the timeline filter chips
  to the same 44px minimum.
- Ran an actual WCAG contrast check (relative-luminance formula via
  `getComputedStyle`, not estimation) for `--muted`/`--accent` against
  `--panel-solid` across all 9 themes: 5.8:1–13.8:1 everywhere, comfortably
  clearing the 4.5:1 AA threshold. No changes needed — verified, not assumed.

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

## Phase 1, 2 & 3 status: complete

All twelve roadmap items (1.1–1.5, 2.1–2.4, 3.1–3.3) shipped and verified
live on Cloudflare as of 2026-08-12, plus one pre-existing bug found during
Phase 2 and fixed (`46e544c`): the Packs modal was invisible between
701–1023px viewport width.

One item from the plan was never assigned to a numbered phase item and so
was never in scope for 1.1–3.3: **Settings regrouping** (flat sections →
Appearance / Security / Backup & Sync / Reminders / Data & Storage / Help).
It's a real, separately-schedulable piece of work if wanted next — see the
"Where things actually stand" table above.

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
| Settings grouping | **Done** (`cc65878`) — 6 named collapsible groups | — |
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

**Settings regrouping** (`cc65878`, 2026-08-12) — the one item never assigned
to a numbered phase — is also done: the flat section list is now 6 native
`<details open>` groups (Appearance, Security, Backup & Sync, Reminders,
Data & Storage, Help), collapsible with no new JS. The old "Download &
backup" block had become a catch-all for backup, reminder, and diagnostic
buttons; those were split out into Reminders and a new "Diagnostics &
reports" sub-section under Data & Storage. Verified the `id="..."` set is
byte-identical before/after (nothing added, removed, or duplicated — only
moved), so all existing `getElementById` wiring resolves unchanged.

The entire `desktop redesign plan.pdf` is now implemented end to end. No
open items remain on this roadmap.

---

## Review Round 2 — external UX/UI/Layout report (2026-08-12)

A follow-up review (`Review of the redesigned version.pdf`) assessed the
live app against the original plan post-Phase-3. Its claims were verified
directly against the live site before acting on any of them (several
turned out to be real, current gaps — not stale feedback). Scope: all 11
recommendations, per user direction ("everything including polish").

### High Priority — ✅ DONE

1. **Simplify navigation** (`2f0dadb`) — Header cluster (FULL mode, avatar,
   Lock, Help, Settings) was genuinely still competing with the sidebar/
   bottom nav (verified live: all 5 buttons present alongside the primary
   nav). Folded all four into the Profile sheet per the user's explicit
   choice; header now holds only "+ Add". Found and fixed two real bugs
   surfaced by this: a duplicate `btn-profile` onclick assignment (same
   dead-shadowing pattern as the Phase 2 `openPacksUI`/`openStcwUI` find),
   and the primary-nav Profile tab never actually populating profile
   fields — it only worked before because the header avatar button
   (wired correctly) was always available as a silent workaround.

2. **Strengthen the home hero** (`e77c00a`) — Readiness ring enlarged
   64px→92px (mobile) / 128px (desktop), added a supporting breakdown line
   ("X of 5 core documents ready" + what's missing), and made the ring
   click/keyboard-activatable to open the existing checklist modal for a
   full explain-the-score breakdown — reusing existing UI instead of
   building new.

3. **Fix empty states** (`3893e4b`) — Added the recommended optional
   secondary action ("See required documents for &lt;Pack&gt;") for any
   category that maps to one of the 4 auto-packs.

4. **Reduce first-load noise** (`3893e4b`) — Onboarding-shows-once was
   already correct (verified in code, not a real bug). The actual problem:
   install banner + onboarding modal + update toast could all show at
   once on a first visit. Install banner now waits for onboarding to
   close (all three trigger paths verified: skip, complete-all-steps,
   returning user) instead of firing simultaneously.

### Medium Priority — ✅ DONE

5. **Visual hierarchy & contrast** (assessed) — `#strip-name` ("DOCUMENT
   VAULT") checked directly via `getComputedStyle`: pure white
   (`rgb(255,255,255)`), opacity 1, no text-shadow/fill trickery. The
   "ghosted" impression in the review isn't a measurable contrast defect —
   likely a reaction to the very large font size, not a bug. `--muted`/
   `--accent` contrast was already verified passing WCAG AA across all 9
   themes in Phase 3.3. No code change beyond what item 2 already improved
   (bigger, bolder hero).
6. **Surface Pack progress + next expiry risk** (`65eb903`) — new "Home
   insights" section between the hero and category rail: a horizontally-
   scrollable row of live pack-progress pills (click → pack detail), and a
   "next expiry risk" card showing the single most urgent document
   (most-overdue expired one first, else soonest-expiring), hidden
   entirely when nothing has expiry data. Reuses `getExpiryGroups()` and
   `recommendedPackDocs()` rather than new computation.
7. **Readiness formula explainability** — satisfied by item 2 (click/
   keyboard-activatable ring opens the checklist breakdown). No separate
   formula change was requested beyond explainability.
8. **Spacing/alignment** (`355a8fa`) — assessing this surfaced a real bug,
   not just a taste issue: `.tools-row` had a hardcoded
   `grid-row: 3/4 !important` fighting its own `grid-area: tools`
   assignment, stale since Phase 3.2's install banner added a row (and
   this round's item 6 added another) — the tools row was rendering one
   row too early, overlapping where "insights" belongs. Fixed by removing
   the hardcoded override and letting the named grid area resolve
   correctly. Checked `.cats`/`.docs`/`.section-head` for the same pattern
   — none had it.

### Low Priority (Polish) — ✅ DONE

9. **Micro-interactions** (`a34fd3a`) — `.doc` had a hover lift (translateY
   + border glow + shadow); `.cat` and `.mobile-pack-card` — also
   clickable cards — had none, including `.mobile-pack-card` missing a
   `transition` property entirely. Added matching hover treatment to both.
   Add-success feedback was already shipped in Phase 3.1, not duplicated.
10. **Mobile bottom nav** (assessed) — buttons are 64×61px, active state
    has a clearly distinct accent colour + background tint against a
    muted inactive state. No concrete gap found.
11. **Empty-state illustration** (`a34fd3a`) — no image-generation tooling
    available in this environment, so interpreted honestly as a
    presentation upgrade rather than fabricated illustrations: the emoji
    now sits in an 88px soft gradient circle badge (matching the glow
    treatment already used for pack icons) instead of a bare 52px
    character at reduced opacity.

All 11 items verified in-browser at mobile (375px) + desktop (1280px) with
real interaction (not just DOM presence checks), `npm test` clean after
every commit, and confirmed byte-identical live on Cloudflare. Two more
real pre-existing bugs were found and fixed along the way (beyond the
review's own list): a duplicate `btn-profile` click handler and a
non-functional primary-nav Profile path (item 1), and the stale
`.tools-row` grid-row hardcoding (item 8).

---

## Critical bug found via real iPhone screenshots (2026-08-12, `373c445`)

After Review Round 2 shipped, the user sent real iPhone screenshots ("check
it live on the phone for ios") showing the desktop sidebar nav rendering as
a broken horizontal pill row at the top of the page, oversized text cut off
at the screen edge, and page content overflowing horizontally — on every
phone, not just iOS. This had been live and undetected through this
session's entire mobile-viewport testing, because the test pattern
`document.querySelector('.sidebar-nav ...') || document.querySelector('.mobile-bottom-nav ...')`
used throughout calls `.click()` directly via `querySelector`, which fires
an element's click handler even when the element is `display:none` —
masking exactly this class of bug from every check that used it. Lesson:
geometry/overlap assertions don't substitute for asserting the *visibility*
of elements that are supposed to be hidden.

Two compounding root causes, both real pre-existing bugs (not introduced by
any change this session):

1. `.sidebar-nav` was only ever given `display: flex` inside
   `@media (min-width: 901px)` — there was no unconditional base rule
   hiding it below that width. `.mobile-bottom-nav` (its mobile
   counterpart) had the correct pattern (`display: none` unconditional,
   overridden per breakpoint) the whole time; `.sidebar-nav` never got the
   same treatment when it was added. Fixed by adding the missing
   `.sidebar-nav { display: none; }`.

2. `.main` is `display: flex; flex-direction: column`, and flex items
   default to `min-width: auto` — refusing to shrink below their content's
   intrinsic width. `.profile-strip` becomes `display: block !important`
   at narrow widths (pre-existing, intentional), and once its content
   needed more than the viewport width, the flex item grew instead of
   wrapping, dragging the whole page into horizontal overflow. Fixed with
   the standard `min-width: 0` flexbox fix, applied to all of `.main`'s
   direct children defensively.

Verified at 390px (matching the real device) and 1280px (desktop,
unaffected) — sidebar-nav correctly hidden/shown, no horizontal overflow,
"DOCUMENT VAULT" now wraps to 2 lines instead of forcing overflow. Confirmed
directly on the live production URL after deploy, not just the local build.

**Found, not fixed** (separate, lower severity, doesn't affect real
phones): between 701–900px, *neither* nav renders — `.sidebar-nav` still
gated to `min-width:901px`, `.mobile-bottom-nav` still gated to
`max-width:700px`. Same class of gap-zone bug as the Phase 2 Packs-modal
fix. Flagged as a follow-up, not fixed in this pass — would need matching
adjustments across `.main`'s whole desktop grid-template-areas system, not
just the nav threshold, to do properly.

---

## Real-WebKit testing capability added (2026-08-12)

No Playwright MCP server is connected in this environment, but Playwright
itself ships a genuine WebKit browser build — installed it standalone via
npm directly into the session scratchpad (not this project's own
dependencies, since it's a testing tool, not something the app ships
with). Using `devices['iPhone 14']` gives a real Mobile Safari UA,
`devicePixelRatio: 3`, and actual WebKit CSS/layout resolution — a
materially stronger check than the Chromium-only in-app browser used for
everything up to this point, which cannot emulate WebKit at all (always
reports an Android Chrome UA regardless of viewport size).

Used it immediately to find a second real bug: the "Expiring" stat-pill's
decorative icon was rendering as a transparent blue-outlined square
instead of a filled yellow circle at mobile widths — the visible tail of
a 5-deep chain of competing `!important` declarations for
`.stat-pills .pill.warn::before` across four different `max-width:700px`/
`760px` breakpoint blocks, none of which Chromium-only testing would have
caught since the cascade result is CSS-engine-agnostic (it reproduces
identically on both engines — this was a code bug, not a rendering
difference, but real-WebKit screenshots are what surfaced it in the first
place). Fixed (`edfb0db`) by adding one more `!important` declaration,
placed last in source order within the same breakpoint scope, restoring
the yellow circle and aligning its size (18px) with the other two pills.
Verified via `getComputedStyle(el, '::before')` — not just reading the
CSS text — against both the local build and the live production URL under
real WebKit, plus a direct screenshot.

---

## Full-app iOS conformity walkthrough (2026-08-12)

Walked every major screen (Vault, Document view, Add Document, Packs,
Pack detail, Timeline, Sea Time, Profile, Settings, Help, STCW matrix,
Checklist) under real WebKit at the iPhone 14 viewport, driven via direct
`page.evaluate()` calls into the app's own open/render functions rather
than simulated taps.

**Found and fixed**: the Timeline screen's "Critical" and "Next 90 days"
filter chips visually activated on click (the `.active` class landed
correctly) but silently failed to hide non-matching entries — a document
365 days from expiry still showed up under "Critical". Root cause was the
same class of bug as the stat-pill fix above: `.tl-hidden { display:
none !important }` and a later-in-source-order `.mobile-timeline-card {
display: grid !important }` (declared inside a breakpoint block, several
hundred lines after `.tl-hidden`) tied at (0,1,0) specificity, so source
order let the `grid` declaration win regardless of which element had
`.tl-hidden` applied. Fixed by raising `.tl-hidden`'s specificity for the
two elements the filter actually toggles — `.mobile-timeline-card.tl-hidden`
and `.tl-month.tl-hidden` — rather than chasing source order across the
half-dozen `.mobile-timeline-card` breakpoint blocks. Desktop's
`.tl-item`/`.tl-month` elements were never affected (no competing
`display` declaration exists for them), so this was mobile-only. Verified
via `getComputedStyle` on the seeded test documents before/after the
filter click, confirming `display: none` actually applies now, plus a
before/after screenshot.

**Investigated, not a bug**: two screenshots from an early pass of this
walkthrough (Document view, Add Document) appeared blank — just the
darkened Vault backdrop — despite `getComputedStyle` proving the modal's
own DOM state was fully correct (`opacity: 1`, correct dimensions, real
text content). Root-caused to a WebKit-headless compositor-timing
artifact: screenshotting too soon after several overlay open/close
cycles chained within one long-lived page session produces a stale
composited frame in Playwright, even though the live DOM is already
correct. Re-running each screen with a fresh page load (matching how a
real user actually navigates — one screen at a time, not a rapid
scripted chain) made every capture render correctly, confirming this was
a test-harness artifact, not something a real user would ever see.

---

## Update-available toast made opt-in, not automatic (2026-08-13)

The "New Blue Wallet update available." toast previously fired
unprompted: on every page load, every 30-minute background timer tick,
every tab-visibility change, and immediately whenever the service worker
detected a waiting/installing worker. Flagged as intrusive — it's a
`position:fixed` overlay that lands wherever its CSS places it regardless
of scroll position, so it frequently sat on top of the readiness card or
document counts on first load.

Rather than relocate it (a fixed toast has no truly "safe" spot on a
content-dense phone screen), the automatic paths were changed to update
state silently — `markUpdateAvailable()` now just tracks the pending
registration/worker and updates a status line, with no toast. A new
"Updates" row was added to the **Data & storage** settings group (right
next to the app version chip) with a live status line and a **Check for
Update** button; tapping it is the only path that still calls
`promptAppUpdate()` / shows the toast, whether it finds an update, is
already current, or fails to check. `showAppToast()` itself is untouched
since it's a shared component used for many other in-app messages (pack
actions, print, offline/online, etc.) — only the update-specific
auto-triggers were silenced.

Verified via real WebKit: no toast appears after page load + reload
(waited 1.5s), the Settings row correctly reflects a silently-detected
pending update ("A new version is available." / "Update now"), and
tapping Check for Update surfaces the toast on demand.

---

## PIN standardized to 4 digits; STCW checklist now extensible (2026-08-13)

**PIN**: was previously variable-length (4–6 digits), which required a
"wait for possibly more digits" guess-ahead in `tryUnlock()` since the
app only stores a hash and can't know the intended length upfront.
Standardized to exactly 4 digits throughout — lock screen (4 dots, was
6), Settings PIN fields (`maxlength="4"`), save validation
(`/^\d{4}$/`), and copy in Settings/Help. Simplified `tryUnlock()`
accordingly — no more "Continue entering PIN" prefix-guessing, since
length is now fixed. Verified end-to-end via real WebKit: set a 4-digit
PIN, lock the vault, enter the 4 digits on the pad, confirmed clean
unlock with no error.

**Biometric auto-fill of the PIN was investigated and intentionally not
implemented as literally requested.** The vault's AES-GCM key is derived
via PBKDF2 from the PIN text itself (`deriveVaultKey`) — the app never
stores the PIN, only a verification hash. WebAuthn/biometric assertions
prove presence/identity but do not expose any secret the app could use
to reconstruct the PIN or the key; there is no reversible path from "Face
ID succeeded" to "here is the PIN" without storing the PIN in a
biometric-gated-but-still-extractable form, which would defeat the
purpose of PIN-derived encryption (physical device access would then be
enough to decrypt, bypassing the PIN entirely). The existing behavior
(`tryBiometric()` in the lock screen) already auto-unlocks with no PIN
prompt when encryption is off; when encryption is on, it correctly falls
through to "Biometric OK — enter PIN to decrypt vault" rather than
faking a fill. Raised with the user as a design question rather than
guessed at, since any implementation here is security-sensitive.

**STCW checklist**: previously a fixed, hardcoded 4–7 item matrix per
rank (`STCW_MATRIX`) with no way to track certificates outside that
list. Added a persistent custom-course layer: a "+ Add certificate" field
at the bottom of the STCW Checklist screen appends to
`localStorage['bwCustomStcwCourses']` (deduped case-insensitively) and
re-renders the matrix with the new entry included; custom entries get a
small ✕ remove button the built-in ones don't have. Also wired into
`buildFullBackupData()` / `applyBackupData()` (merged, not overwritten)
so custom certificates survive Export Backup, restore, and Encrypted
Sync Vault round-trips like the rest of the app's settings. Verified via
real WebKit: added "Advanced Fire Fighting", confirmed it renders with a
remove control and persists to `localStorage`, then removed it and
confirmed the list reverts to the 4 built-in Generic-rank items.

---

## Help & FAQ caught up with this session's feature changes (2026-08-13)

A pass through `#modal-help` to fix stale/incorrect content left behind
by earlier changes in this session, not just add coverage for new ones:

- **FAQ "Lite and Full use the same data?"** still said the mode toggle
  lives "from the header" — actually wrong since the header consolidation
  moved it into Profile. Fixed.
- **Install pane** described tapping "the in-app Update button" as if
  updates still surface automatically — no longer true after the
  update-toast opt-in change. Rewritten to point at Settings -> Data &
  storage -> Check for Update.
- **Profile section** didn't mention it now also houses Help, Lock Now,
  and the Lite/Full switch after the header consolidation, or that the
  header itself only keeps + Add. Added.
- **"Lock now" bullet** said "Full mode padlock" with no location —
  updated to point at Profile -> Lock Now.
- **STCW help card** didn't mention the new "+ Add certificate" control.
  Added a line.
- **New "Readiness & insights" section** added to the Start tab covering
  the tappable readiness ring and the Pack progress / Next expiry risk
  cards from Review Round 2, which had no help coverage at all before.

Verified via real WebKit: extracted `innerText` from each changed help
pane after tab-switching and confirmed the new copy renders exactly as
written, plus grepped the built output for the FAQ line directly since
closed `<details>` content doesn't reliably show up in `innerText`
extraction.

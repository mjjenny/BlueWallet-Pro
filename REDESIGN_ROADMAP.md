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
| Readiness hero (score + metrics + CTA) | **Does not exist.** The 22 "readiness" hits in the code are all the unrelated *Release Readiness* QA panel. No progress ring exists either (`stroke-dasharray` hits are the helm logo). | Build from scratch |
| Left rail on desktop | **Done** — added this session, 5 items, wired to existing nav JS | — |
| Bottom nav on mobile | **Done** — shipped in the mobile phase | — |
| Pack cards with progress | **Mostly done** — 4 auto-packs render with progress *bars*, status colours, and completion counts. Plan asks for *rings*. | Restyle only |
| Timeline colour-coding | **Partially done** — `.tl-item.warn` / `.tl-item.bad` colour-code by status; 13-month grid wraps properly on desktop | Add filters + prominence |
| Category status strips | Cards show icon + name + count. **No status strip.** | Small addition |
| Guided empty states | **One generic state** for all categories: "No documents here yet". Not per-category, no benefit copy. | Build from scratch |
| Collapse the "tool dump" | **Not started.** 12 `tool-btn` buttons still in one row — this is the "random tool dump" the plan calls out. | IA change |
| Settings grouping | Sections exist but flat; desktop 2-column already shipped | Regroup into 6 |
| Sea Time as primary tab | **Not done** — currently reached via Profile | Nav change (see decision below) |

---

## ⚠️ One decision needed before Phase 1

**The plan's navigation contradicts the nav we already shipped and that you
signed off on.**

| Current (shipped, agreed in mobile phase) | Plan proposes |
|---|---|
| Vault · Timeline · Packs · Profile · **Settings** | Vault · Packs · Timeline · **Sea Time** · Profile |

The plan promotes **Sea Time** to a primary tab and folds **Settings** into
Profile. That's defensible — Settings is a "visit rarely" destination and
sea-time is core to a seafarer's career record. But it moves a tab you
currently use daily, and `BLUEWALLET_HANDOVER.md` records that the 5-tab set
was a deliberate decision (Vaccines was explicitly demoted to a category at
that time).

**Options:**
- **A — Follow the plan.** Sea Time becomes a tab, Settings moves under Profile.
- **B — Keep current nav.** Sea Time stays under Profile. Lowest disruption.
- **C — Six tabs.** Rejected by default: crowds mobile, and the plan's own goal
  is *fewer* navigation systems, not more.

Nothing in Phase 1 is blocked by this except item 1.5. Decide before then.

---

## Phase 1 — High-impact visual & IA

The plan's own priority order, kept.

### 1.1 Readiness hero *(biggest single win)*
Replace the current `.profile-strip` hero (large name + 3 stat pills) with:
- Circular progress ring showing a readiness score, animated on load
- Three metrics in a row: Total · Expiring soon · Expired *(data already exists —
  `stat-total`, `stat-expiring`, `stat-expired` are populated in `render()`)*
- One primary CTA that adapts: "+ Add first document" when empty → "Complete
  STCW Pack" when a pack is closest to done

**Needs a definition first:** what counts toward "% Ready"? Suggested starting
formula, open to change — core joining docs present and unexpired (passport,
CDC, COC, medical), weighted by expiry proximity. This must be agreed before
building, since a readiness score that disagrees with a seafarer's own judgment
is worse than none.

### 1.2 Category cards with status strips
Add a coloured status strip to each category card (green all-valid / amber
something expiring / red something expired / grey empty). Card markup and counts
already exist — this is a strip plus a per-category status computation.

### 1.3 Guided empty states
Replace the single generic empty state with per-category copy answering the
plan's three questions. Plan's own example:

> "Your passport is the foundation of every joining. Add it once and it stays
> private on this device." → **[ + Add Passport ]**

Needs one short line of copy per category (9 total). Worth writing these
yourself — they're voice-sensitive and you know the domain.

### 1.4 Collapse the 12-button tool row
The plan's "random tool dump". Proposed regrouping:
- **Stay visible:** Search, Sort, Filter (these are vault controls, not tools)
- **Move to a "Tools" overflow menu:** Checklist, Calendar, STCW, Vaccines, Bulk select
- **Move into Profile/Settings:** Summary, Share
- **Already primary nav:** Timeline, Packs

Nothing gets deleted — everything stays reachable, just stops competing for
attention. Worth confirming which of these you actually reach for often, since
that should drive what stays visible.

### 1.5 Nav change *(only if Option A above)*
Sea Time → primary tab; Settings → under Profile.

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

## Two open questions

1. **Readiness formula** (blocks 1.1) — what makes a seafarer "ready"?
2. **Nav decision** (blocks 1.5) — Option A, B, or C above?

Everything else can start without further input.

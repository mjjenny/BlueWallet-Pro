# Phase 19 - Visual Parity QA and Polish

## Goal

Phase 19 pauses release QA and verifies that the React wallet is visually close enough to the preserved stable wallet before release validation resumes.

References used:

- `legacy-root-pwa.html`
- `app.js`
- `styles.css`
- current React preview at `http://127.0.0.1:5173/`
- stable legacy preview at `http://127.0.0.1:5174/legacy-root-pwa.html`

## Visual Mismatches Found

- Category and modal scrollbars used browser-default styling that looked stark against the stable dark maritime glass UI.
- Scanner/OCR modal allowed page/body scrolling behind the dialog and had unclear scroll ownership.
- Scanner/OCR desktop layout was functional but still felt heavier than the stable modal treatment because multiple scrollbars could appear.
- Phone-width setup forms could stay in a two-column grid and clip the confirm PIN field.
- Phone-width top bar retained too much brand copy for narrow screens.
- Form controls used content-box sizing, which made `width: 100%` controls with padding vulnerable to horizontal overflow.

## Fixes Made

- Added app-wide border-box sizing.
- Added stable-themed scrollbar styling.
- Hid the horizontal category rail scrollbar while preserving horizontal scroll behavior.
- Locked body scrolling while modals are open.
- Moved modal scrolling to `.details-body` and scanner panels instead of the modal frame.
- Constrained scanner modal height and width for desktop and mobile.
- Collapsed security/setup forms to one column on phone widths.
- Added defensive wrapping for read-only callouts and badges.
- Hid secondary top-bar brand copy on mobile to keep the stable header compact.
- Added responsive overflow containment for the wallet shell.

## Feature Surface Verification

React wallet surfaces remain available:

- vault setup/unlock/lock
- backup export and encrypted restore
- scanner/OCR workflow
- document CRUD entry points
- maritime toolkit
- sea-service form
- legacy read-only migration assessment

Preserved boundaries:

- no legacy migration execution
- no writes to `SeafarerWalletDB`
- `legacy-root-pwa.html` preserved
- `BlueWalletReactDB` remains the React-owned encrypted store

## Remaining Visual Gaps

- The React app still uses React-specific secure-vault language and controls, so it is not a pixel clone of the legacy wallet.
- The legacy onboarding flow and React vault setup flow are intentionally different because React protects data through the secure vault boundary.
- Mobile scanner OCR was checked through responsive CSS/test guardrails and desktop browser verification; a physical phone pass is still required before release QA resumes.

## Release Decision

Release QA remains stopped. Do not create `v1.0.0` from this branch. Resume release QA only after product owner review accepts the visual parity state.

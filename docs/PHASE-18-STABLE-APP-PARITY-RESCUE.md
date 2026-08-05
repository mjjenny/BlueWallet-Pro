# Phase 18 - Stable App Visual and Feature Parity Rescue

## Objective

Phase 18 stops release QA and restores the React wallet toward the preserved stable wallet experience without replacing the React-owned secure vault architecture.

Stable reference files reviewed:

- `legacy-root-pwa.html`
- `app.js`
- `styles.css`
- root production assets

Protected boundaries:

- `legacy-root-pwa.html` remains preserved as rollback/reference.
- `SeafarerWalletDB` remains read-only from React legacy adapters.
- No legacy migration is executed.
- React encrypted wallet data remains in `BlueWalletReactDB`.
- Root React cutover remains `index.html` to `react-app/index.html`.

## Stable Visual Elements Restored

- Animated ocean background layer with four SVG wave bands.
- Stable-style glass top bar.
- Animated helm brand mark.
- Maritime brand copy: `THE BLUE WALLET` and `OFFSHORE SECURE VAULT`.
- Profile/dashboard strip with compact identity block, local vault summary, and stat pills.
- Stable-style glass panels for dashboard, wallet workspace, migration status, maritime toolkit, and security panels.
- Category rail treatment with pill buttons and horizontal mobile scrolling.
- Document card treatment with glass surface, soft shadow, left accent strip, and entrance animation.
- Rounded modal/bottom-sheet treatment closer to the stable app.
- Reduced-motion fallback for the restored animations.

## Scanner/OCR Rescue

The scanner modal now uses a cleaner responsive layout:

- desktop: three structured panels for capture, OCR review, and document review
- tablet: two-column layout with OCR/review content stacked as needed
- phone: single-column bottom-sheet style layout
- larger touch targets and clearer form spacing
- constrained modal height with internal panel scrolling

OCR behavior remains unchanged:

- image OCR stays lazy-loaded through `tesseract.js`
- manual text review and fallback remain available
- no PDF OCR implementation was added

## Feature Surface Status

Preserved in React:

- encrypted vault setup, unlock, lock, wrong-PIN handling, and key rotation
- React-owned encrypted storage
- document create/edit/delete/view flows
- scanner/OCR image path and manual review fallback
- maritime toolkit
- backup/export and restore/import
- sea-service persistence
- migration status/dry-run analysis without execution

Still intentionally not restored as new functionality:

- legacy migration execution
- writes to `SeafarerWalletDB`
- OCR for PDF text extraction
- camera capture integration
- Face ID/PIN migration from the legacy wallet
- final release tag creation

## Release Decision

Release remains blocked. Phase 18 is a parity rescue branch, not a release-candidate branch. Manual QA and waiver approval must resume after the app is visually stable and the available-device QA evidence is complete.

## Verification Expectations

Automated coverage includes:

- stable shell/parity markers
- scanner modal usability markers
- background animation presence
- security/vault flow regressions through existing wallet tests
- no write path in the legacy `SeafarerWalletDB` adapter

Manual visual checks should confirm:

- desktop dashboard resembles the stable app rather than the earlier bare React dashboard
- scanner modal is spacious, readable, and responsive
- ocean/helm atmosphere is present unless reduced motion is requested
- preview server responds with HTTP 200

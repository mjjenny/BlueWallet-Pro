# Stable App Development Lock

This copy is the base for all future development:

- Branch: `development/stable-app-copy`
- Base commit: `f8a87f02a4df91c1dd71c46ae566192647ec1da3`
- Stable production entry: `index.html` opens `./legacy-root-pwa.html`
- Stable PWA start URL: `./legacy-root-pwa.html?v=stable`
- Stable production host: `https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html`
- Retired host: GitHub Pages / `mjjenny.github.io` is not a production path.

## Hard Rule

Do not change the stable app UI, animation, layout, visual theme, or production entry behavior unless Jenny explicitly gives permission for that specific change.

This includes:

- ocean background and wave animation
- helm brand animation
- top bar layout
- profile strip layout
- category rail layout
- document card/list layout
- modal/bottom-sheet layout
- floating action button behavior and placement
- spacing, colors, glass styling, borders, typography, and responsive layout
- root routing, manifest start URL, and service-worker stable fallback

## Development Rule

Future development should preserve the stable user experience and add functionality without visual churn. If a requested feature appears to require UI, animation, or layout changes, stop first and ask Jenny for permission before editing those surfaces.

Production deployment must use the Cloudflare-backed hosted site. GitHub remains the source repository, but the retired `gh-pages` / GitHub Pages route must not be used for release or end-user access unless Jenny explicitly re-approves that hosting path.

The automated tests include a stable UI lock. If that lock fails, either revert the visual change or record Jenny's explicit approval before updating the lock.

## Approved Visual Changes

- 2026-08-05: Jenny approved changing the category rail so all category tabs stay visible in one row without horizontal scrolling. This approval applies only to the category tab row and does not permit unrelated UI, animation, layout, theme, or routing changes.
- 2026-08-05: Jenny approved changing the tools row so action controls are grouped above the search box, the search box spans a full row, and the tools/search area does not use horizontal scrolling. This approval applies only to the tools/search row arrangement.
- 2026-08-05: Third-party QA reported the first tools-row implementation was not readable at phone/tablet widths. The corrective layout keeps desktop actions in one row, uses a non-scrolling action grid on narrower screens, keeps search full-width below the actions, and preserves no horizontal scrolling. Narrow phone category labels use deliberate short labels instead of accidental clipping.
- 2026-08-05: Third-party QA v2 verified the tools-row fix but found the first category-label correction still clipped. The approved corrective category-row behavior now uses distinct compact codes (`PPT`, `CDC`, `COC`, `VSA`, `CRT`, `MED`, `YF`, `CTR`, `OTH`) below desktop, hides count badges through tablet widths, hides icons on phone widths, and restores full desktop labels/count badges at desktop width. This approval applies only to category-row readability.
- 2026-08-05: Jenny approved backup/restore hardening as a feature iteration. The approved scope is limited to clearer backup version labels, restore confirmation copy, and pre-import integrity/structure validation.
- 2026-08-05: Jenny approved feature iterations for document expiry alerts, unified search, local-only activity log, data safety status, install-to-home-screen guidance, and practical accessibility improvements. The approved scope is limited to these feature behaviors and small supporting text/control additions inside the existing stable layout.
- 2026-08-05: Jenny approved the camera/scanner real-device QA iteration. The approved scope is limited to camera/file picker status messaging, cancel/reset behavior, failed scan/OCR recovery, iOS Safari help text, and third-party real-device test instructions.
- 2026-08-05: Jenny approved roadmap items 2 through 19 as stable-app feature iterations. The approved scope is limited to reminder center, backup health, import preview detail, duplicate detection, renewal timeline, advanced search tokens, document quality checklist, bulk tag/pack tools, data safety, accessibility, printable master index, joining pack builder, flag-state/company notes, document version history, manual reminder notes, missing document tracker, secure share preparation, and offline recovery guidance inside the existing stable layout.
- 2026-08-05: Jenny approved roadmap items 1 and 20 as stable-app feature iterations. The approved scope is limited to a local-only real-device QA pack, exportable QA evidence notes, and a release readiness panel that summarizes real-device QA, backup, PIN, expiry, missing-document, and quality/risk status inside the existing Settings flow.
- 2026-08-05: Jenny approved a targeted OCR/document viewer stability fix. The approved scope is limited to preventing OCR browser hangs, keeping OCR dismiss/retry recoverable, refreshing the service-worker cache, and changing the document display window to a 70% scan/viewing pane with a 30% quality/details pane on non-phone widths.
- 2026-08-06: Jenny approved adding more Settings appearance choices and animated sea themes. The approved scope is limited to the Appearance section, theme color variables, animated wave treatment, saved theme selection, and related cache/test updates. Ocean Blue remains the default stable appearance.
- 2026-08-06: Jenny approved expanding Appearance choices to cover all VIBGYOR colors. The approved scope is limited to adding Violet, Indigo, Blue, Green, Yellow, Orange, and Red sea-themed color options inside Settings, while keeping Ocean Blue as the default stable appearance.
- 2026-08-06: Jenny approved the final-build Help refresh and desktop/mobile optimization pass. The approved scope is limited to comprehensive Help/FAQ content updates, Help tab readability, Settings/Appearance responsiveness, final cache/test updates, and preserving the locked stable UI, animation, layout, theme defaults, routing, and production entry behavior.
- 2026-08-06: Jenny approved optional desktop/mobile homogeneity through an Encrypted Sync Vault. The approved scope is limited to Settings-based Supabase sync configuration, on-device encrypted full-backup upload/download, sync status, auto-check controls, conflict safety, setup SQL, Help text, cache/test updates, and preserving local-only behavior unless sync is explicitly configured.
- 2026-08-06: Jenny reported Supabase statement timeout during encrypted vault upload. The approved scope is limited to hardening Encrypted Sync Vault storage by splitting large encrypted backups into small Supabase chunk rows, updating the setup SQL/test/cache version, and preserving the existing Settings UI, local-only default, encryption model, layout, and animations.

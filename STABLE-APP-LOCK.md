# Stable App Development Lock

This copy is the base for all future development:

- Branch: `development/stable-app-copy`
- Base commit: `f8a87f02a4df91c1dd71c46ae566192647ec1da3`
- Stable production entry: `index.html` opens `./legacy-root-pwa.html`
- Stable PWA start URL: `./legacy-root-pwa.html?v=stable`

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

The automated tests include a stable UI lock. If that lock fails, either revert the visual change or record Jenny's explicit approval before updating the lock.

## Approved Visual Changes

- 2026-08-05: Jenny approved changing the category rail so all category tabs stay visible in one row without horizontal scrolling. This approval applies only to the category tab row and does not permit unrelated UI, animation, layout, theme, or routing changes.
- 2026-08-05: Jenny approved changing the tools row so action controls are grouped above the search box, the search box spans a full row, and the tools/search area does not use horizontal scrolling. This approval applies only to the tools/search row arrangement.
- 2026-08-05: Third-party QA reported the first tools-row implementation was not readable at phone/tablet widths. The corrective layout keeps desktop actions in one row, uses a non-scrolling action grid on narrower screens, keeps search full-width below the actions, and preserves no horizontal scrolling. Narrow phone category labels use deliberate short labels instead of accidental clipping.
- 2026-08-05: Third-party QA v2 verified the tools-row fix but found the first category-label correction still clipped. The approved corrective category-row behavior now uses distinct compact codes (`PPT`, `CDC`, `COC`, `VSA`, `CRT`, `MED`, `YF`, `CTR`, `OTH`) below desktop, hides count badges through tablet widths, hides icons on phone widths, and restores full desktop labels/count badges at desktop width. This approval applies only to category-row readability.
- 2026-08-05: Jenny approved backup/restore hardening as a feature iteration. The approved scope is limited to clearer backup version labels, restore confirmation copy, and pre-import integrity/structure validation.

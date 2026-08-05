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


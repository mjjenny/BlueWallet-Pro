# Production Hosting Workflow

## Current Production Path

The production app is served from:

https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html

GitHub remains the source repository. GitHub Pages is retired and must not be
used for production release, mobile installation, encrypted sync, or end-user
access.

## Workflow

1. Develop in the stable app copy.
2. Preserve the locked stable UI, animation, layout, and default theme unless
   Jenny explicitly approves a scoped change.
3. Run the test/build checks for the stable app.
4. Publish the verified static app through the Cloudflare-backed hosted site.
5. Verify the production URL and service worker version after publishing.

## Retired GitHub Pages Path

The old `gh-pages` route repeatedly stalled in GitHub Pages deployment and is
not a release path anymore. The previous `gh-pages` branch was archived as:

`archive/retired-gh-pages-20260807`

Do not recreate or use `gh-pages` for production unless Jenny explicitly asks to
restore GitHub Pages hosting.

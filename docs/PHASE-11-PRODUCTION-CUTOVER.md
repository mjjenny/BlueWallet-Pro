# Phase 11 Production Cutover

Phase 11 addresses the remaining Phase 10 deferred items:

- Actual production cutover from the root PWA to React.
- Service worker/cache migration.
- Full device/browser matrix plan.
- Full image-to-text OCR engine path.
- Persisted sea-service entries.

## Production Cutover

The root `index.html` now launches the React production bundle at `./react-app/index.html`. The previous root PWA is preserved as `legacy-root-pwa.html` for rollback/reference.

The React build is configured in `next-app/vite.config.ts` to emit production assets into root `react-app/` with relative paths. The PWA manifest now starts at `./react-app/index.html?v=1.0`.

## Service Worker Migration

`service-worker.js` now uses cache version `blue-wallet-react-v1.0.0` and precaches:

- Root launcher.
- React app shell.
- Manifest and offline page.
- Installed app icons.

Old cache names are removed during activation. Navigation requests fall back to the React app shell first, then `offline.html`.

## OCR Engine

Scanner OCR now lazy-loads `tesseract.js` only when the user chooses `Read images`. This provides browser image-to-text OCR while keeping the normal vault/dashboard route smaller. PDF files remain attachable and encrypted; OCR reads image pages in this phase.

The existing MRZ/CDC/certificate parser still handles field suggestions after OCR text is produced.

## Persisted Sea Service

`BlueWalletReactDB` is upgraded to version 3 with an encrypted `seaService` object store. Sea-service entries are:

- Stored as Phase 6 AES-GCM encrypted rows.
- Included in secure backup export/restore.
- Included in data-key rotation.
- Displayed in the maritime toolkit after vault unlock.

Secure backup version 3 is exported. Version 2 secure backups are still accepted and restored with an empty sea-service list.

## Device and Browser Matrix

The production matrix is captured in `next-app/src/test/productionMatrix.ts` and enforced by tests so expected release platforms do not disappear accidentally.

Manual release pass:

| Platform | Browser | Required areas |
| --- | --- | --- |
| iOS | Safari | install, offline, vault, scanner, OCR, maritime |
| iPadOS | Safari | install, offline, vault, scanner, OCR, maritime |
| Android | Chrome | install, offline, vault, scanner, OCR, maritime |
| Windows | Chrome | offline, vault, backup, OCR, maritime |
| Windows | Edge | offline, vault, backup, OCR, maritime |
| macOS | Safari | offline, vault, backup, OCR, maritime |
| macOS | Chrome | offline, vault, backup, OCR, maritime |

## Verification

Required checks:

- `npm test`
- `npm run build`
- `npm run lint`
- Root `index.html` launches `react-app`.
- `service-worker.js` uses `blue-wallet-react-v1.0.0`.
- `SeafarerWalletDB` is not written by Phase 11 code.

## Remaining Manual Risk

The automated matrix validates coverage definitions and app behavior under jsdom. Actual device/browser certification still needs physical or cloud-device execution before release sign-off.

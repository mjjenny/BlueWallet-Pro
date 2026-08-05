# BlueWallet-Pro v1.0 Release Notes Draft

Status: draft pending manual QA sign-off.

## Release Summary

BlueWallet-Pro v1.0 promotes the React encrypted vault to the production app while preserving the legacy root PWA as `legacy-root-pwa.html` for rollback/reference.

The production root entry now launches:

- `./react-app/index.html`

Installed PWAs start at:

- `./react-app/index.html?v=1.0`

## Highlights

- React production cutover through the root `index.html`.
- Encrypted React vault stored in `BlueWalletReactDB`.
- PIN setup, lock, unlock, wrong-PIN failure, key rotation, and secure backup restore.
- Encrypted document and attachment storage.
- Image/PDF attachment support.
- Scanner workflow with manual OCR text review.
- Lazy image OCR path through `tesseract.js`.
- PDF fallback for manual review and attachment storage.
- Maritime readiness toolkit.
- Encrypted sea-service persistence and backup inclusion.
- React v1.0 service-worker cache and offline shell fallback.
- Legacy rollback/reference file preserved as `legacy-root-pwa.html`.

## Security Notes

- React vault data is encrypted before writing to `BlueWalletReactDB`.
- Secure backups do not expose plaintext document data.
- Wrong PIN unlock and restore attempts fail closed.
- `SeafarerWalletDB` remains protected; no React write path is added.
- Losing the React vault PIN may make encrypted React data unrecoverable without a valid backup and PIN.

## Offline and Install Notes

- The service worker cache version is `blue-wallet-react-v1.0.0`.
- Old cache names are removed during activation.
- Navigation offline fallback checks the React shell before `offline.html`.
- Manual install/offline validation is still required across the Phase 12 device matrix before tagging.

## OCR Notes

- Image OCR lazy-loads `tesseract.js` when image pages are read.
- PDF OCR is not included in v1.0; PDFs remain attachable and reviewable through the manual fallback path.
- First-run OCR language data may require network/cache availability depending on browser behavior.
- OCR output is advisory and must be reviewed before saving.

## Known Limitations

- Manual QA evidence is required before final tag creation.
- Browser storage quotas can affect large attachment libraries.
- iOS/iPadOS install and offline behavior must be verified on real devices.
- React-to-legacy data rollback is not automatic; users should export secure React backups before rollback testing.

## Release Tag

Planned tag: `v1.0.0`

Current tag status: blocked until manual QA evidence and sign-off are complete.

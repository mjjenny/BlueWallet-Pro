# Phase 12 - Release Candidate Validation

## Release Candidate Scope

Phase 12 validates the Phase 11 production cutover without adding new product features.

The release candidate preserves:

- Root `index.html` launching `./react-app/index.html`.
- Generated `react-app/` production bundle committed with the repository.
- Manifest `start_url` pointing to `./react-app/index.html?v=1.0`.
- `legacy-root-pwa.html` as the rollback/reference copy of the legacy root PWA.
- `SeafarerWalletDB` as a protected legacy database with no React write path.

## Production Entry Validation

Validated by `next-app/src/test/productionCutover.test.ts`:

- Root `index.html` references `./react-app/index.html`.
- Root launcher registers `service-worker.js`.
- `legacy-root-pwa.html` exists.
- `react-app/index.html` exists.
- React production asset references in `react-app/index.html` resolve to committed files.
- Manifest name includes `v1.0`.
- Manifest `start_url` is `./react-app/index.html?v=1.0`.

## Service Worker and Cache Migration

Validated by `next-app/src/test/productionCutover.test.ts`:

- Cache version is `blue-wallet-react-v1.0.0`.
- Activation removes caches whose names do not match the current cache version.
- Navigation offline fallback checks `./react-app/index.html` before `./offline.html`.
- Every generated React production asset referenced by `react-app/index.html` is pre-cached.

## Encrypted Vault Validation

Validated by `next-app/src/features/react-wallet/__tests__/reactWalletDatabase.test.ts` and shell tests:

- PIN setup accepts 4 to 8 digit PINs and rejects invalid formats.
- Unlock succeeds with the correct PIN.
- Wrong PIN fails closed without mutating encrypted rows.
- Lock and unlock remain reachable from the production shell.
- Documents and attachments are stored as AES-GCM envelopes.
- Secure backup export excludes plaintext document data.
- Secure backup restore requires the backup PIN.
- Key rotation re-encrypts stored data and preserves readable documents.
- Sea-service entries remain encrypted, survive reload, survive key rotation, and are included in backup restore.

## OCR Validation

Validated by `next-app/src/features/scanner/__tests__/ocrEngine.test.ts` and shell tests:

- Image OCR lazy-loads `tesseract.js` only when image pages are present.
- Image pages are passed through the Tesseract worker.
- PDF pages are skipped for OCR and remain attachable for manual review.
- PDF-only OCR returns an empty text result without loading Tesseract.
- Manual OCR text review and parsing remain available.

Known OCR limitations:

- PDF OCR is not implemented in this release candidate.
- First-run language data loading is handled by `tesseract.js` and may require network/cache availability depending on browser behavior.
- OCR output remains advisory; users must review parsed fields before saving.

## Sea-Service Validation

Validated by `next-app/src/features/react-wallet/__tests__/reactWalletDatabase.test.ts`, `next-app/src/app/__tests__/WalletShell.test.tsx`, and maritime rule tests:

- Users can add sea-service entries from the maritime toolkit.
- Entries display in the unlocked React shell.
- Entries persist after database reopen and vault unlock.
- Entries remain encrypted in IndexedDB.
- Entries are included in secure backup export and restore.
- Sea-service day calculations are covered by unit tests.

## Device and Browser Matrix

Automated matrix contract:

- `next-app/src/test/productionMatrix.ts`
- `next-app/src/test/productionMatrix.test.ts`

Manual matrix checklist:

- `docs/PHASE-12-MANUAL-QA-CHECKLIST.md`

Required platforms:

- iOS Safari
- iPadOS Safari
- Android Chrome
- Windows Chrome
- Windows Edge
- macOS Safari
- macOS Chrome

## Deployment Checklist

| Step | Status | Notes |
| --- | --- | --- |
| Confirm clean release branch | Pending manual sign-off | Branch must be `feature/phase12-release-candidate`. |
| Run `npm test` | Passed | 58 tests passed. |
| Run `npm run build` | Passed | React production bundle regenerated in `react-app/`. |
| Run `npm run lint` | Passed with warnings | Existing fast-refresh warnings only. |
| Confirm root launcher | Passed by automated test | Root launches React bundle. |
| Confirm service worker cache | Passed by automated test | React v1.0 cache and fallback verified. |
| Confirm manifest start URL | Passed by automated test | Starts at React app. |
| Confirm rollback file | Passed by automated test | `legacy-root-pwa.html` exists. |
| Confirm preview HTTP 200 | Pending final check | Local preview must respond before sign-off. |
| Complete manual device matrix | Pending manual QA | Use the Phase 12 checklist. |

## Rollback Checklist

| Step | Pass/Fail | Notes |
| --- | --- | --- |
| Confirm `legacy-root-pwa.html` opens locally |  |  |
| Confirm legacy backup export from rollback file |  |  |
| Confirm no deployment removed legacy root assets |  |  |
| Confirm service worker can be bumped for rollback deployment |  |  |
| Confirm support note explains React-to-legacy rollback limits |  |  |
| Confirm React-created encrypted data is backed up before rollback |  |  |

Rollback position:

- Rollback restores the legacy UI shell, not automatic React-to-legacy data migration.
- React secure backups must be exported before rollback if users created React-only data.
- `SeafarerWalletDB` must remain untouched by React rollback operations.

## Known Risks

- Manual device/browser certification is still required outside jsdom.
- iOS and iPadOS install/offline behavior can vary by Safari version and storage pressure.
- Tesseract first-run language data may be slow or unavailable if the browser blocks the fetch/cache path.
- PDF OCR remains manual-review only.
- Users who forget their React vault PIN cannot recover encrypted React data without a valid backup and PIN.
- Browser storage quotas may affect very large attachment sets.

## Sign-Off Criteria

Release candidate can be promoted only after:

- Automated tests, build, and lint pass.
- Manual QA checklist is completed for all required platforms or exceptions are explicitly accepted.
- Root React cutover is verified in a fresh browser profile.
- Offline launch is verified after first online load.
- Secure backup export/restore is verified manually with a non-production PIN.
- Rollback file is verified before deployment.
- No `SeafarerWalletDB` write path is introduced.

## Validation Results

Latest automated validation in this phase:

- `npm test`: passed, 58 tests
- `npm run build`: passed
- `npm run lint`: passed with existing fast-refresh warnings

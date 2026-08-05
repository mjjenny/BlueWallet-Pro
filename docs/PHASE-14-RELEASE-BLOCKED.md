# Phase 14 - Release Tag and Final Packaging

## Decision

Release status: blocked.

The final `v1.0.0` git tag was not created because manual QA evidence is incomplete. Phase 14 reviewed the Phase 13 release sign-off documents and found no completed manual device/browser evidence, screenshots, tester names, dates, or product-owner approval.

## Documents Reviewed

- `docs/PHASE-13-MANUAL-QA-SIGNOFF.md`
- `docs/PHASE-13-RELEASE-TAG-CHECKLIST.md`
- `docs/PHASE-13-MANUAL-EVIDENCE-TEMPLATE.md`
- `docs/RELEASE-NOTES-v1.0-DRAFT.md`

## Missing Manual QA Evidence

The following evidence is required before `v1.0.0` can be tagged:

| Evidence Area | Missing Evidence | Required Before Tag |
| --- | --- | --- |
| Device/browser matrix | Pass/fail rows are blank for iOS Safari, iPadOS Safari, Android Chrome, Windows Chrome, Windows Edge, macOS Safari, and macOS Chrome. | Completed matrix with tester, date, notes, and accepted exceptions. |
| Install/offline | No screenshots or notes proving install and offline launch on mobile platforms. | Install/offline evidence for iOS Safari, iPadOS Safari, and Android Chrome; offline launch evidence for desktop browsers. |
| Root cutover | No manual screenshot or browser evidence proving root URL opens React in a fresh profile. | Fresh-profile root launch evidence. |
| Vault setup/unlock/lock | No manual evidence for PIN setup, lock, or unlock. | Screenshots or notes from at least one clean manual test run. |
| Wrong PIN and key rotation | No manual wrong-PIN failure or key-rotation evidence. | Evidence that wrong PIN fails without data loss and key rotation preserves data. |
| Backup export/restore | No manual secure backup export/restore evidence. | Evidence using non-production data, including wrong-PIN restore failure. |
| OCR image path | No manual image OCR evidence or first-run language-data notes. | Image OCR evidence, including success or clear failure state. |
| PDF fallback | No manual PDF fallback evidence. | Evidence that PDF pages stay attachable and OCR falls back to manual review. |
| Persisted sea service | No manual reload/restore persistence evidence. | Evidence that sea-service entries persist after refresh and backup restore. |
| Rollback file | No manual screenshot proving `legacy-root-pwa.html` opens. | Rollback/reference UI evidence. |
| Sign-off | Engineering, QA, and product-owner sign-off rows are blank. | Named approvals or documented exceptions. |

## Release Gates Rechecked

| Gate | Status | Evidence |
| --- | --- | --- |
| Root production entry launches React | Passed | `index.html` targets `./react-app/index.html`. |
| React production bundle exists | Passed | `react-app/index.html` and generated assets exist. |
| Manifest starts at React app | Passed | `manifest.json` uses `./react-app/index.html?v=1.0`. |
| Service worker cache is React v1.0 | Passed | `service-worker.js` uses `blue-wallet-react-v1.0.0`. |
| Offline fallback targets React shell | Passed | Service worker navigation fallback checks React shell before `offline.html`. |
| Rollback file preserved | Passed | `legacy-root-pwa.html` exists. |
| No `SeafarerWalletDB` write path added | Passed | Legacy adapter remains read-only; no legacy `readwrite` transaction found. |
| Automated tests | Passed | `npm test`: 11 files, 58 tests passed. |
| Production build | Passed | `npm run build` completed; `react-app/` assets remained stable. |
| Lint | Passed with warnings | `npm run lint` completed with existing fast-refresh warnings only. |
| Manual QA evidence | Blocked | Evidence is incomplete. |
| Final tag | Blocked | `v1.0.0` must not be created yet. |

## Release Notes Status

`docs/RELEASE-NOTES-v1.0-DRAFT.md` remains the active draft. `docs/RELEASE-NOTES-v1.0.md` was not created because the release is not approved for final tagging.

## Tag Status

Planned tag: `v1.0.0`

Current status: not created.

Reason: manual QA evidence and sign-off are incomplete.

## Phase 14 Automated Validation

- `npm test`: passed, 11 files / 58 tests
- `npm run build`: passed
- `npm run lint`: passed with existing fast-refresh warnings

## Next Steps

1. Complete `docs/PHASE-12-MANUAL-QA-CHECKLIST.md`.
2. Complete one `docs/PHASE-13-MANUAL-EVIDENCE-TEMPLATE.md` copy per device/browser run or store equivalent evidence in the release tracker.
3. Fill Engineering, QA, and Product owner sign-off rows.
4. Re-run automated checks.
5. Recheck protected files and legacy database write boundary.
6. Create final release notes and annotated tag only after approval.

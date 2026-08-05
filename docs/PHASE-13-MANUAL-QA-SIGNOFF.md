# Phase 13 - Manual QA Sign-Off

## Scope

Phase 13 prepares BlueWallet-Pro v1.0 for manual release sign-off. It does not add product features, does not migrate data, and does not create the final release tag.

Manual QA evidence is not yet present in the repository. The final git tag remains blocked until the evidence log is complete and accepted.

## Source Documents Reviewed

- `docs/PHASE-12-RELEASE-CANDIDATE.md`
- `docs/PHASE-12-MANUAL-QA-CHECKLIST.md`

## Release Gate Status

| Gate | Status | Evidence |
| --- | --- | --- |
| Root production entry launches React | Passed | `index.html` refresh/link/script target `./react-app/index.html`. |
| React production bundle exists | Passed | `react-app/index.html` and `react-app/assets/` exist. |
| Manifest starts installed app at React | Passed | `manifest.json` uses `./react-app/index.html?v=1.0`. |
| Service worker cache is React v1.0 | Passed | `service-worker.js` uses `blue-wallet-react-v1.0.0`. |
| Old service-worker caches are cleaned | Passed | Activation deletes cache names that do not match the current cache version. |
| Offline fallback targets React shell | Passed | Navigation fallback checks `./react-app/index.html` before `./offline.html`. |
| Legacy rollback file preserved | Passed | `legacy-root-pwa.html` exists and was not modified in Phase 13. |
| No `SeafarerWalletDB` write path added | Passed | Legacy code path remains read-only; no legacy `readwrite` transaction was found. |
| Automated tests | Passed | `npm test`: 11 files, 58 tests passed. |
| Production build | Passed | `npm run build` completed and regenerated `react-app/`. |
| Lint | Passed with warnings | `npm run lint` completed with existing fast-refresh warnings only. |
| Manual device/browser QA | Blocked | Checklist evidence is blank. |
| Final release tag | Blocked | Do not tag until manual QA evidence is complete. |

## Manual QA Sign-Off Log

| Area | Required Evidence | Status | Owner | Date | Notes |
| --- | --- | --- | --- | --- | --- |
| iOS Safari install/offline | Screenshots and pass/fail row | Not started |  |  |  |
| iPadOS Safari install/offline | Screenshots and pass/fail row | Not started |  |  |  |
| Android Chrome install/offline | Screenshots and pass/fail row | Not started |  |  |  |
| Windows Chrome vault/backup/OCR | Screenshots and pass/fail row | Not started |  |  |  |
| Windows Edge vault/backup/OCR | Screenshots and pass/fail row | Not started |  |  |  |
| macOS Safari vault/offline/OCR | Screenshots and pass/fail row | Not started |  |  |  |
| macOS Chrome vault/offline/OCR | Screenshots and pass/fail row | Not started |  |  |  |
| Rollback file review | Screenshot of `legacy-root-pwa.html` | Not started |  |  |  |
| Secure backup restore | Backup/restore evidence using test data | Not started |  |  |  |
| Sea-service persistence | Reload/restore evidence | Not started |  |  |  |

## Release Decision

Current decision: blocked for final tag.

Reason: manual device/browser QA evidence has not been completed. Automated validation can proceed, but v1.0 tagging requires filled pass/fail rows, screenshots or notes, tester identity, dates, and accepted exceptions.

## Phase 13 Automated Validation

Commands to run before commit:

- `npm test`: passed, 11 files / 58 tests
- `npm run build`: passed
- `npm run lint`: passed with existing fast-refresh warnings

Preview requirement:

- Local preview must remain running.
- `http://127.0.0.1:5173/` must return HTTP 200.

# Phase 17 - Release Decision

## Decision

Release decision: blocked.

Phase 17 records the available-device QA evidence structure and proposes macOS Safari and macOS Chrome waivers. No device row has been marked `Pass`, and the macOS waivers are not approved.

## Blocking Items

- iOS Safari evidence is not supplied.
- iPadOS Safari evidence is not supplied.
- Android Chrome evidence is not supplied.
- Windows Chrome evidence is not supplied.
- Windows Edge evidence is not supplied.
- macOS Safari is not tested and waiver is not approved.
- macOS Chrome is not tested and waiver is not approved.
- Install/offline evidence is not supplied.
- Vault setup/unlock/lock evidence is not supplied.
- Backup export/restore evidence is not supplied.
- Wrong PIN/key rotation evidence is not supplied.
- OCR image path and PDF fallback evidence is not supplied.
- Persisted sea-service evidence is not supplied.
- Rollback file verification evidence is not supplied.
- Engineering, QA, and product-owner sign-off are not supplied.

## Protected Boundaries

- `v1.0.0` was not created.
- Legacy migration was not executed.
- No write path to `SeafarerWalletDB` was added.
- `legacy-root-pwa.html` remains preserved.
- Root React cutover remains intact.

## Phase 17 Validation Results

- `npm test`: passed, 12 files / 61 tests
- `npm run build`: passed
- `npm run lint`: passed with existing fast-refresh warnings
- Preview HTTP 200: passed for `http://127.0.0.1:5173/`

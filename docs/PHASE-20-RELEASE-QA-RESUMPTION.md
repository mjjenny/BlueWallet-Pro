# Phase 20 - Release QA Resumption

## Status

Release QA may resume after product-owner acceptance of the Phase 19 visual parity state.

The release remains blocked until real device/browser evidence or approved waivers are recorded. Do not create `v1.0.0` from this branch yet.

## Resumption Basis

Phase 19 stopped release QA so the React wallet could be visually checked against the preserved stable wallet. Product-owner direction to proceed was received after Phase 19 completion.

References:

- `docs/PHASE-19-VISUAL-PARITY-QA.md`
- `docs/PHASE-15-QA-RUNBOOK.md`
- `docs/PHASE-15-EVIDENCE-TRACKER.md`
- `docs/PHASE-17-AVAILABLE-DEVICE-QA.md`
- `docs/PHASE-13-RELEASE-TAG-CHECKLIST.md`

## Automated Validation

Validation was refreshed on commit `a64d3bfaeeb5a37d2581ad6566129f7961e0eca0`.

| Check | Result | Notes |
| --- | --- | --- |
| `npm test` | Passed | 13 test files, 66 tests. |
| `npm run build` | Passed | Production build completed and `react-app/` bundle remained stable. |
| `npm run lint` | Passed with warnings | Existing fast-refresh warnings only. |
| Preview HTTP | Passed | `http://127.0.0.1:5173/` returned HTTP 200. |

## Protected Boundary Verification

| Boundary | Result | Notes |
| --- | --- | --- |
| `legacy-root-pwa.html` preserved | Passed | Rollback/reference file exists. |
| Root entry launches React | Passed | `index.html` redirects to `./react-app/index.html`. |
| Manifest starts at React | Passed | `start_url` is `./react-app/index.html?v=1.0`. |
| Service worker v1.0 cache retained | Passed | Cache version is `blue-wallet-react-v1.0.0`. |
| No `v1.0.0` tag exists | Passed | Tag remains uncreated. |
| React legacy adapter remains read-only | Passed | Guardrail tests pass and `legacyDatabase.ts` uses readonly transactions for `SeafarerWalletDB`. |

## Manual QA Required Before Tagging

The Phase 15 tracker still needs real evidence or approved waivers for:

- iOS Safari.
- iPadOS Safari.
- Android Chrome.
- Windows Chrome.
- Windows Edge.
- macOS Safari.
- macOS Chrome.
- Install and offline behavior.
- Vault setup, unlock, lock, wrong PIN, backup, restore, and key rotation.
- OCR image path and PDF/manual fallback.
- Sea-service persistence after reload and backup restore.
- `legacy-root-pwa.html` rollback/reference rendering.
- Engineering, QA, and product-owner release sign-off.

## Next Action

Run the Phase 15 QA runbook on the required devices and browsers. Record evidence in `docs/PHASE-15-EVIDENCE-TRACKER.md` and defects in `docs/PHASE-15-DEFECT-LOG.md`.

Create `v1.0.0` only after every required row is `Pass` or formally `Waived`, sign-off is complete, and the final branch check is clean.


# Phase 21 - Stable App Rollback

## Decision

The stable wallet is restored as the production app.

React release QA is stopped. Do not create `v1.0.0` from the React cutover state.

## What Changed

- Root `index.html` now opens `./legacy-root-pwa.html`.
- `manifest.json` now starts installed PWAs at `./legacy-root-pwa.html?v=stable`.
- `service-worker.js` now uses the stable rollback cache and falls back to `./legacy-root-pwa.html` while offline.
- The React production bundle remains in `react-app/` for reference, but it is no longer the production landing path.
- The production contract test now verifies the stable rollback path instead of the React cutover path.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| `npm test` | Passed | 13 test files, 66 tests. |
| `npm run build` | Passed | React bundle still builds and remains available separately. |
| `npm run lint` | Passed with warnings | Existing fast-refresh warnings only. |
| Static root preview | Passed | `http://127.0.0.1:5174/` returns HTTP 200 and targets `legacy-root-pwa.html`. |
| Stable app preview | Passed | `http://127.0.0.1:5174/legacy-root-pwa.html` returns HTTP 200. |

## Release Interpretation

This is a rollback to the known stable app, not a React release. React QA, waiver collection, and the `v1.0.0` release tag remain stopped unless a future decision restarts that release path.


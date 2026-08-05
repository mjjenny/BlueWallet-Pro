# Phase 15 - Manual QA Execution

## Status

Manual QA execution is open and not signed off.

The release remains blocked until real device/browser evidence is recorded in the Phase 15 tracker or linked from it. Phase 15 does not create the `v1.0.0` tag.

## Objective

Execute and record the manual QA evidence required by Phase 14:

- Device/browser matrix sign-off.
- Install/offline evidence.
- Fresh-profile root cutover evidence.
- Vault setup, unlock, lock, wrong PIN, backup, restore, and key-rotation evidence.
- OCR image path and PDF/manual fallback evidence.
- Persisted sea-service reload and backup/restore evidence.
- `legacy-root-pwa.html` rollback verification evidence.
- Engineering, QA, and product-owner sign-off.

## Evidence Rules

- Do not mark a row `Pass` without a tester name, date, device/browser, and evidence reference.
- Do not mark a row `Fail` without a defect ID or notes describing the failure.
- Do not mark a row `Waived` without an approver, date, reason, and release impact.
- Screenshots, screen recordings, console logs, exported sample backups, or written notes are acceptable evidence.
- Use non-production sample data only.
- Do not include real passport numbers, CDC numbers, medical details, phone numbers, or private identity documents in evidence.

## Execution Order

1. Start from a clean browser profile or cleared site data.
2. Open the root app URL.
3. Confirm the root cutover opens the React app.
4. Install or pin the PWA where the browser supports it.
5. Load once online, then test offline launch.
6. Create a test vault with a 4 to 8 digit PIN.
7. Create test documents with image and PDF attachments.
8. Export a secure backup and confirm the JSON has no visible plaintext document title.
9. Test wrong PIN unlock and wrong PIN restore failure.
10. Rotate the vault key and confirm documents remain readable.
11. Test scanner image OCR and manual OCR text parsing.
12. Test PDF attachment fallback.
13. Add a sea-service entry, refresh, unlock, and verify persistence.
14. Export and restore a backup containing the sea-service entry.
15. Open `legacy-root-pwa.html` and verify the rollback/reference UI renders.
16. Record evidence and sign-off.

## Active Documents

- `docs/PHASE-15-EVIDENCE-TRACKER.md`
- `docs/PHASE-15-QA-RUNBOOK.md`
- `docs/PHASE-15-DEFECT-LOG.md`

## Release Decision

Current release decision: blocked.

Reason: manual QA evidence has not been supplied in this repository.

The next phase can tag `v1.0.0` only after the tracker is complete or formally waived.

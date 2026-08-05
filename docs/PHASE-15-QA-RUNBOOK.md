# Phase 15 - QA Runbook

Use this runbook for every manual device/browser run. Record results in `docs/PHASE-15-EVIDENCE-TRACKER.md`.

## Before You Start

1. Use non-production sample data.
2. Start from a clean profile, private window, simulator reset, or cleared site data.
3. Confirm the tested commit is recorded.
4. Keep screenshots or notes for every pass/fail decision.
5. If a test fails, add a row to `docs/PHASE-15-DEFECT-LOG.md`.

## Required Test Data

Use sample values only:

- PIN: `123456`
- Wrong PIN: `000000`
- Passport title: `QA Passport`
- Certificate title: `QA STCW Basic Safety`
- Vessel: `MV QA Test`
- Sea-service dates: `2026-01-01` to `2026-01-31`
- OCR text sample:

```text
P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
L898902C36UTO7408122F3204159ZE184226B<<<<<10
```

## Root Cutover

1. Open the root app URL.
2. Confirm the browser lands on the React app.
3. Hard refresh.
4. Confirm the React shell renders.
5. Record screenshots or notes.

## Install and Offline

1. Load once while online.
2. Confirm service worker registration if browser tooling is available.
3. Install or add to home screen where supported.
4. Turn off network.
5. Open the app again.
6. Confirm React shell or offline fallback behavior is usable.

## Vault

1. Set up a new vault PIN.
2. Lock and unlock.
3. Try the wrong PIN.
4. Confirm data is not lost.
5. Create a document with an image attachment.
6. Create a document with a PDF attachment.
7. Export backup.
8. Open the backup in a text editor and confirm the sample title is not visible.
9. Restore backup with correct PIN.
10. Restore backup with wrong PIN and confirm failure.
11. Rotate key and verify documents remain readable.

## OCR

1. Open scanner.
2. Import a sample image.
3. Use `Read images`.
4. Record first-run language data behavior.
5. Confirm OCR text appears or a clear failure message appears.
6. Paste the MRZ sample if image OCR is not available on that device.
7. Parse OCR and save encrypted scan after review.
8. Import a PDF and confirm manual fallback.

## Sea Service

1. Add a sea-service entry for `MV QA Test`.
2. Confirm inclusive day count is `31 days`.
3. Refresh or close/reopen the browser.
4. Unlock the vault.
5. Confirm the entry persists.
6. Export backup and restore into a clean run.
7. Confirm the sea-service entry is restored.

## Rollback

1. Open `legacy-root-pwa.html` directly.
2. Confirm the legacy rollback/reference UI renders.
3. Confirm a React secure backup was exported before any rollback testing.

## Finish

1. Update the evidence tracker.
2. Add defects for every failure.
3. Mark any waiver with an approver and release impact.
4. Do not request release tagging until all required rows are `Pass` or formally `Waived`.

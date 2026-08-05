# Phase 16 - Evidence Intake Packet

Use this packet when collecting the remaining Phase 15 manual QA evidence.

## Evidence Folder Naming

Use one folder per test run:

```text
phase15-evidence/<run-id>/
```

Recommended run IDs:

- `ios-safari-YYYYMMDD`
- `ipados-safari-YYYYMMDD`
- `android-chrome-YYYYMMDD`
- `windows-chrome-YYYYMMDD`
- `windows-edge-YYYYMMDD`
- `macos-safari-YYYYMMDD`
- `macos-chrome-YYYYMMDD`

## Required Files Per Run

Each run should include:

- Root launch screenshot or note.
- Installed app screenshot where supported.
- Offline launch screenshot or note.
- Vault setup, lock, unlock, and wrong-PIN evidence.
- Backup export and restore evidence.
- Key rotation evidence.
- Scanner image OCR evidence or clear failure state.
- PDF fallback evidence.
- Sea-service reload and restore evidence.
- `legacy-root-pwa.html` rollback screenshot or note.
- Console or browser storage notes when available.

## Evidence Redaction

Use sample data only.

Do not include:

- Real passport numbers.
- Real CDC numbers.
- Real medical details.
- Real phone numbers.
- Real addresses.
- Private identity documents.

## Tracker Update Rules

Update `docs/PHASE-15-EVIDENCE-TRACKER.md` only after evidence is saved or linked.

- Mark `Pass` only with tester, date, device/browser, and evidence reference.
- Mark `Fail` only with defect ID or clear failure notes.
- Mark `Waived` only with approver, date, reason, and release impact.
- Leave rows as `Not Started` when evidence has not been collected.

## Defect Rules

Log every failed check in `docs/PHASE-15-DEFECT-LOG.md`.

Release-blocking examples:

- Root URL does not open React.
- Offline app cannot open after install.
- Vault data is lost after wrong PIN or restore failure.
- Backup contains visible plaintext document data.
- Sea-service entries do not persist after reload or restore.
- React code writes to `SeafarerWalletDB`.


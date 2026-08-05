# Phase 17 - Available Device QA Execution

## Scope

Phase 17 prepares manual QA evidence capture for the devices currently available to the tester. It uses the Phase 15 runbook and Phase 16 evidence intake packet.

No product features were added. No row is marked `Pass` without real evidence. The release remains blocked until every required row is either `Pass` with evidence or formally `Waived` with approval.

## Source Documents Used

- `docs/PHASE-15-QA-RUNBOOK.md`
- `docs/PHASE-16-EVIDENCE-INTAKE-PACKET.md`
- `docs/PHASE-15-EVIDENCE-TRACKER.md`
- `docs/PHASE-16-LOCAL-QA-EVIDENCE.md`
- `docs/PHASE-16-RELEASE-DECISION.md`

## Available Device Matrix

| QA ID | Platform | Browser | Phase 17 Status | Evidence Folder | Tester | Date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| QA-IOS-SAFARI | iOS | Safari | Not Started | `phase15-evidence/ios-safari-YYYYMMDD/` |  |  | Do not mark pass until install/offline, vault, OCR, backup, sea-service, and rollback evidence is recorded. |
| QA-IPADOS-SAFARI | iPadOS | Safari | Not Started | `phase15-evidence/ipados-safari-YYYYMMDD/` |  |  | Do not mark pass until install/offline, vault, OCR, backup, sea-service, and rollback evidence is recorded. |
| QA-ANDROID-CHROME | Android | Chrome | Not Started | `phase15-evidence/android-chrome-YYYYMMDD/` |  |  | Do not mark pass until install/offline, vault, OCR, backup, sea-service, and rollback evidence is recorded. |
| QA-WIN-CHROME | Windows | Chrome | Not Started | `phase15-evidence/windows-chrome-YYYYMMDD/` |  |  | Do not mark pass until offline, vault, OCR, backup, sea-service, and rollback evidence is recorded. |
| QA-WIN-EDGE | Windows | Edge | Not Started | `phase15-evidence/windows-edge-YYYYMMDD/` |  |  | Do not mark pass until offline, vault, OCR, backup, sea-service, and rollback evidence is recorded. |

## Per-Device Evidence Structure

Copy the following table once for each available-device run. Keep every row `Not Started` until actual evidence exists.

| Field | Value |
| --- | --- |
| Run ID |  |
| QA ID |  |
| Platform |  |
| Browser |  |
| Device model |  |
| OS version |  |
| Browser version |  |
| App URL |  |
| Tested commit |  |
| Tester |  |
| Date |  |
| Overall result | Not Started |
| Evidence folder/link |  |

| Check | Status | Evidence Required | Evidence Reference | Defect / Waiver | Notes |
| --- | --- | --- | --- | --- | --- |
| Root URL opens React app | Not Started | Screenshot or notes from fresh profile root load |  |  |  |
| React shell renders after hard refresh | Not Started | Screenshot or notes |  |  |  |
| Manifest install starts at React app | Not Started | Install result or browser limitation note |  |  |  |
| No blocking console errors | Not Started | Console screenshot or note |  |  |  |
| Service worker registered after first online load | Not Started | Browser application/storage evidence or note |  |  |  |
| App opens while offline | Not Started | Offline screenshot or note |  |  |  |
| Navigation fallback shows React shell offline | Not Started | Offline navigation evidence |  |  |  |
| App icon and title look correct when installed | Not Started | Installed app screenshot where supported |  |  |  |
| Safe-area layout is usable | Not Started | Screenshot or note |  |  |  |
| Create PIN | Not Started | Screenshot or note using sample PIN |  |  |  |
| Lock vault | Not Started | Screenshot or note |  |  |  |
| Unlock vault | Not Started | Screenshot or note |  |  |  |
| Wrong PIN fails without data loss | Not Started | Failure screenshot and data still readable afterward |  |  |  |
| Create document with image attachment | Not Started | Screenshot or note |  |  |  |
| Create document with PDF attachment | Not Started | Screenshot or note |  |  |  |
| Export secure backup | Not Started | Backup file evidence using sample data only |  |  |  |
| Exported backup has no visible plaintext document title | Not Started | Text-editor check note |  |  |  |
| Restore backup with correct PIN | Not Started | Restore evidence |  |  |  |
| Restore backup with wrong PIN fails | Not Started | Failure evidence |  |  |  |
| Rotate key and confirm documents remain readable | Not Started | Before/after note |  |  |  |
| Import image into scanner | Not Started | Screenshot or note |  |  |  |
| Run image OCR | Not Started | OCR result or clear failure state |  |  |  |
| First-run OCR language data behavior recorded | Not Started | Note on load behavior |  |  |  |
| Review OCR text manually | Not Started | Screenshot or note |  |  |  |
| Parse OCR suggestions | Not Started | Parsed-field screenshot or note |  |  |  |
| Save encrypted scan | Not Started | Saved document evidence |  |  |  |
| Import PDF and confirm fallback | Not Started | PDF fallback screenshot or note |  |  |  |
| Add sea-service entry | Not Started | Screenshot or note |  |  |  |
| Entry displays with correct day count | Not Started | `31 days` evidence using Phase 15 sample data |  |  |  |
| Refresh browser and unlock | Not Started | Reload/unlock evidence |  |  |  |
| Entry persists after reload | Not Started | Screenshot or note |  |  |  |
| Backup includes sea-service entry after restore | Not Started | Restore evidence |  |  |  |
| `legacy-root-pwa.html` opens | Not Started | Rollback file screenshot or note |  |  |  |
| Legacy rollback/reference UI renders | Not Started | Screenshot or note |  |  |  |
| No React workflow writes to `SeafarerWalletDB` | Not Started | Code inspection plus manual observation notes |  |  |  |

## Release Gate Interpretation

Available-device QA is not complete. The release remains blocked because no Phase 17 available-device evidence has been supplied yet.

Do not create `v1.0.0` until:

- Every available-device row above is completed with evidence and marked `Pass`, or has an approved waiver.
- macOS Safari and macOS Chrome are either tested or formally waived with product-owner approval.
- Engineering, QA, and product-owner sign-off are recorded.

## Phase 17 Automated Validation

Commands run before commit:

- `npm test`: passed, 12 files / 61 tests
- `npm run build`: passed
- `npm run lint`: passed with existing fast-refresh warnings

Preview requirement:

- `http://127.0.0.1:5173/` returned HTTP 200 during Phase 17 validation.

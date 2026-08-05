# Phase 15 - Evidence Tracker

Status values: `Not Started`, `Pass`, `Fail`, `Blocked`, `Waived`.

Do not change a row from `Not Started` unless real evidence is available.

## Device and Browser Matrix

| ID | Platform | Browser | Status | Tester | Date | Evidence Reference | Defect / Waiver | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QA-IOS-SAFARI | iOS | Safari | Not Started |  |  |  |  |  |
| QA-IPADOS-SAFARI | iPadOS | Safari | Not Started |  |  |  |  |  |
| QA-ANDROID-CHROME | Android | Chrome | Not Started |  |  |  |  |  |
| QA-WIN-CHROME | Windows | Chrome | Not Started |  |  |  |  |  |
| QA-WIN-EDGE | Windows | Edge | Not Started |  |  |  |  |  |
| QA-MAC-SAFARI | macOS | Safari | Not Started |  |  |  |  |  |
| QA-MAC-CHROME | macOS | Chrome | Not Started |  |  |  |  |  |

## Release Gate Evidence

| Gate ID | Gate | Required Evidence | Status | Evidence Reference | Notes |
| --- | --- | --- | --- | --- | --- |
| GATE-ROOT-CUTOVER | Fresh root URL opens React | Screenshot or notes from fresh profile root load | Not Started |  |  |
| GATE-INSTALL-OFFLINE | Install/offline behavior | Installed-app screenshot and offline launch screenshot/notes | Not Started |  |  |
| GATE-SERVICE-WORKER | React service worker cache | Browser application/storage evidence or notes | Not Started |  |  |
| GATE-VAULT | Vault setup/unlock/lock | Screenshots or notes using non-production data | Not Started |  |  |
| GATE-WRONG-PIN | Wrong PIN fails safely | Screenshot/notes and data still readable afterward | Not Started |  |  |
| GATE-BACKUP | Backup export/restore | Backup export, no plaintext check, restore success, wrong-PIN restore failure | Not Started |  |  |
| GATE-KEY-ROTATION | Key rotation | Notes showing readable data before and after rotation | Not Started |  |  |
| GATE-OCR-IMAGE | Image OCR | Screenshot/notes of image OCR result or clear failure state | Not Started |  |  |
| GATE-PDF-FALLBACK | PDF fallback | PDF attachment and manual review fallback evidence | Not Started |  |  |
| GATE-SEA-SERVICE | Sea-service persistence | Add, refresh, unlock, backup restore evidence | Not Started |  |  |
| GATE-ROLLBACK | Legacy rollback file opens | Screenshot/notes for `legacy-root-pwa.html` | Not Started |  |  |
| GATE-NO-LEGACY-WRITE | No React write to `SeafarerWalletDB` | Code inspection result and manual observation notes | Not Started |  |  |

## Per-Run Evidence Intake

Copy this table once per device/browser run.

| Field | Value |
| --- | --- |
| Run ID |  |
| Tester |  |
| Date |  |
| Device |  |
| OS version |  |
| Browser |  |
| Browser version |  |
| App URL |  |
| Build commit |  |
| Result | Not Started |
| Evidence folder/link |  |

| Check | Status | Evidence Reference | Defect / Waiver | Notes |
| --- | --- | --- | --- | --- |
| Root URL opens React app | Not Started |  |  |  |
| React shell renders after hard refresh | Not Started |  |  |  |
| Manifest install starts at React app | Not Started |  |  |  |
| No blocking console errors | Not Started |  |  |  |
| Service worker registered after first online load | Not Started |  |  |  |
| App opens while offline | Not Started |  |  |  |
| Navigation fallback shows React shell offline | Not Started |  |  |  |
| App icon and title look correct when installed | Not Started |  |  |  |
| Safe-area layout is usable | Not Started |  |  |  |
| Create PIN | Not Started |  |  |  |
| Lock vault | Not Started |  |  |  |
| Unlock vault | Not Started |  |  |  |
| Wrong PIN fails without data loss | Not Started |  |  |  |
| Create document with image attachment | Not Started |  |  |  |
| Create document with PDF attachment | Not Started |  |  |  |
| Export secure backup | Not Started |  |  |  |
| Exported backup has no visible plaintext document title | Not Started |  |  |  |
| Restore backup with correct PIN | Not Started |  |  |  |
| Restore backup with wrong PIN fails | Not Started |  |  |  |
| Rotate key and confirm documents remain readable | Not Started |  |  |  |
| Import image into scanner | Not Started |  |  |  |
| Run image OCR | Not Started |  |  |  |
| Review OCR text manually | Not Started |  |  |  |
| Parse OCR suggestions | Not Started |  |  |  |
| Save encrypted scan | Not Started |  |  |  |
| Import PDF and confirm fallback | Not Started |  |  |  |
| First-run OCR language data behavior recorded | Not Started |  |  |  |
| Add sea-service entry | Not Started |  |  |  |
| Entry displays with correct day count | Not Started |  |  |  |
| Refresh browser and unlock | Not Started |  |  |  |
| Entry persists after reload | Not Started |  |  |  |
| Backup includes sea-service entry after restore | Not Started |  |  |  |
| `legacy-root-pwa.html` opens | Not Started |  |  |  |
| Legacy rollback/reference UI renders | Not Started |  |  |  |

## Sign-Off

| Role | Name | Decision | Date | Evidence Reference | Notes |
| --- | --- | --- | --- | --- | --- |
| Engineering |  | Not Started |  |  |  |
| QA |  | Not Started |  |  |  |
| Product owner |  | Not Started |  |  |  |

## Current Release Status

Release status: blocked.

Reason: no manual QA rows have been completed in this tracker.

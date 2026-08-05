# Phase 12 Manual QA Checklist

Use one row per platform/browser run. Fill `Pass/Fail`, tester, date, and notes before release sign-off.

## Device Matrix

| Platform | Browser | Install | Offline launch | PIN setup | Unlock/lock | Wrong PIN | Backup export | Backup restore | Key rotation | Scanner import | Image OCR | PDF fallback | Sea service add/display | Reload persistence | Result | Tester | Date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| iOS | Safari |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| iPadOS | Safari |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Android | Chrome |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Windows | Chrome | N/A |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Windows | Edge | N/A |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| macOS | Safari | N/A |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| macOS | Chrome | N/A |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Root Cutover Checks

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| Root `/index.html` redirects to `/react-app/index.html` |  |  |
| React app shell loads after hard refresh |  |  |
| Manifest install opens React app URL |  |  |
| `legacy-root-pwa.html` is still available for rollback review |  |  |
| No console error blocks initial render |  |  |

## Offline and Install Checks

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| First online load registers service worker |  |  |
| App opens offline after first online load |  |  |
| Offline navigation falls back to React shell |  |  |
| Icons display in installed app context |  |  |
| No page content appears under device safe areas |  |  |

## Vault Checks

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| Create secure vault with a 4 to 8 digit PIN |  |  |
| Lock and unlock with correct PIN |  |  |
| Wrong PIN fails without data loss |  |  |
| Create document with image and PDF attachments |  |  |
| Export secure backup and confirm no visible plaintext document data |  |  |
| Restore secure backup with correct PIN |  |  |
| Restore with wrong PIN fails |  |  |
| Rotate data key and verify documents remain readable |  |  |

## Scanner and OCR Checks

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| Import image page into scanner |  |  |
| Run image OCR and receive text or a clear failure message |  |  |
| Manually enter OCR text and parse fields |  |  |
| Save encrypted scan after review |  |  |
| Import PDF and confirm manual fallback messaging |  |  |
| Confirm no OCR promise blocks saving reviewed fields |  |  |

## Maritime and Sea-Service Checks

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| Maritime toolkit displays after unlock |  |  |
| Add sea-service entry |  |  |
| Entry appears with inclusive day count |  |  |
| Refresh/reopen app and unlock |  |  |
| Sea-service entry persists after reload |  |  |
| Export and restore backup containing sea-service entry |  |  |

## Rollback Checks

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| Open `legacy-root-pwa.html` directly |  |  |
| Confirm legacy UI renders for rollback/reference |  |  |
| Confirm React secure backup is exported before rollback test |  |  |
| Confirm no workflow writes to `SeafarerWalletDB` from React |  |  |

## Sign-Off

| Role | Name | Pass/Fail | Date | Notes |
| --- | --- | --- | --- | --- |
| Engineering |  |  |  |  |
| QA |  |  |  |  |
| Product owner |  |  |  |  |

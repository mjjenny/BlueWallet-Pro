# Phase 13 - Manual Evidence Template

Use this template for each manual QA run. Attach screenshots or screen recordings in the release tracker and reference their filenames or links in the evidence fields.

## Test Session

| Field | Value |
| --- | --- |
| Tester |  |
| Date |  |
| Device |  |
| OS version |  |
| Browser |  |
| Browser version |  |
| App URL |  |
| Build commit |  |
| Result | Pass / Fail / Blocked |

## Evidence Index

| Evidence Item | File or Link | Notes |
| --- | --- | --- |
| Initial load screenshot |  |  |
| Installed app screenshot |  |  |
| Offline launch screenshot |  |  |
| Vault setup screenshot |  |  |
| Unlock/lock screenshot |  |  |
| Wrong PIN failure screenshot |  |  |
| Backup export evidence |  |  |
| Backup restore evidence |  |  |
| Key rotation evidence |  |  |
| Scanner import evidence |  |  |
| Image OCR evidence |  |  |
| PDF fallback evidence |  |  |
| Sea-service persistence evidence |  |  |
| Rollback file evidence |  |  |

## Root Cutover

| Check | Pass/Fail | Evidence | Notes |
| --- | --- | --- | --- |
| Root URL opens React app |  |  |  |
| React shell renders after hard refresh |  |  |  |
| Manifest install starts at React app |  |  |  |
| No blocking console errors |  |  |  |

## Offline and Install

| Check | Pass/Fail | Evidence | Notes |
| --- | --- | --- | --- |
| Service worker registered after first online load |  |  |  |
| App opens while offline |  |  |  |
| Navigation fallback shows React shell offline |  |  |  |
| App icon and title look correct when installed |  |  |  |
| Safe-area layout is usable |  |  |  |

## Vault

Use non-production sample data only.

| Check | Pass/Fail | Evidence | Notes |
| --- | --- | --- | --- |
| Create PIN |  |  |  |
| Lock vault |  |  |  |
| Unlock vault |  |  |  |
| Wrong PIN fails without data loss |  |  |  |
| Create document with image attachment |  |  |  |
| Create document with PDF attachment |  |  |  |
| Export secure backup |  |  |  |
| Confirm exported backup has no visible plaintext document title |  |  |  |
| Restore backup with correct PIN |  |  |  |
| Restore backup with wrong PIN fails |  |  |  |
| Rotate key and confirm documents remain readable |  |  |  |

## Scanner and OCR

| Check | Pass/Fail | Evidence | Notes |
| --- | --- | --- | --- |
| Import image into scanner |  |  |  |
| Run image OCR |  |  |  |
| Review OCR text manually |  |  |  |
| Parse OCR suggestions |  |  |  |
| Save encrypted scan |  |  |  |
| Import PDF and confirm fallback |  |  |  |
| Confirm first-run language data behavior |  |  |  |

## Sea Service

| Check | Pass/Fail | Evidence | Notes |
| --- | --- | --- | --- |
| Add sea-service entry |  |  |  |
| Entry displays with correct day count |  |  |  |
| Refresh browser and unlock |  |  |  |
| Entry persists after reload |  |  |  |
| Backup includes sea-service entry after restore |  |  |  |

## Rollback

| Check | Pass/Fail | Evidence | Notes |
| --- | --- | --- | --- |
| `legacy-root-pwa.html` opens |  |  |  |
| Legacy rollback/reference UI renders |  |  |  |
| React secure backup exported before rollback test |  |  |  |
| No React workflow writes to `SeafarerWalletDB` |  |  |  |

## Exceptions

| Exception | Accepted By | Date | Release Impact |
| --- | --- | --- | --- |
|  |  |  |  |

## Sign-Off

| Role | Name | Decision | Date | Notes |
| --- | --- | --- | --- | --- |
| Engineering |  |  |  |  |
| QA |  |  |  |  |
| Product owner |  |  |  |  |

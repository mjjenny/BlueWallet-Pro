# BlueWallet-Pro Stable App - Independent Third-Party Testing Handover

## Purpose

This handover is for an independent third-party tester or QA agency to perform a complete review of the BlueWallet-Pro stable app before any release decision.

The testing must cover:

- complete feature functionality
- architecture integrity
- local/offline data behavior
- PWA install and offline quality
- build and source quality
- browser/device compatibility
- user acceptance criteria
- bugs, shortcomings, discrepancies, and recommended improvements

The tester must return a detailed written report with evidence, severity ratings, reproduction steps, screenshots or recordings, and release recommendations.

## Product Under Test

BlueWallet-Pro is an offline-first maritime document wallet for seafarers. It stores personal maritime documents, profile information, reminders, sea-time/vaccine logs, scan attachments, and backup files locally in the user's browser.

Current test target:

- App copy: `BlueWallet-Pro-stable-app-copy`
- Branch: `development/stable-app-copy`
- Current commit: `7023b643099105513648908a98328c71c1fbd465`
- Production entry: `index.html`
- Stable app file: `legacy-root-pwa.html`
- PWA start URL: `./legacy-root-pwa.html?v=stable`
- Frozen deploy backup branch: `backup/stable-production-f8a87f0`
- Frozen stable base commit: `f8a87f02a4df91c1dd71c46ae566192647ec1da3`

Important: the React app under `next-app/` and `react-app/` is preserved for reference and automated guardrails, but the production app under test is the stable app served by `legacy-root-pwa.html`.

## Non-Negotiable UI Lock

The current stable app UI, animation, layout, visual theme, and production routing are locked unless Jenny explicitly approves a specific change.

Approved UI changes already recorded:

- Category tabs must be visible in one row without horizontal scrolling.
- At phone/tablet widths, category tabs may use the locked compact codes `PPT`, `CDC`, `COC`, `VSA`, `CRT`, `MED`, `YF`, `CTR`, and `OTH`; each code must remain readable and distinct.
- Tools/action controls must be readable and non-scrolling: desktop may keep all actions in one row, while phone/tablet widths may use a non-scrolling action grid.
- Search must span a full row below the tools/actions.
- No horizontal scrolling is allowed in the category rail or tools/search area.

The third-party tester must verify that no unapproved UI, animation, layout, theme, or routing changes have been introduced.

## Source Package Overview

Core production files:

| File | Purpose |
| --- | --- |
| `index.html` | Root launcher. Must open `./legacy-root-pwa.html`. |
| `legacy-root-pwa.html` | Stable production app containing main UI, styles, and application logic. |
| `manifest.json` | PWA manifest. Must start at `./legacy-root-pwa.html?v=stable`. |
| `service-worker.js` | Offline cache and navigation fallback. Must cache/fallback to stable app. |
| `offline.html` | Offline fallback page. |
| `styles.css` | Legacy/static style companion retained in deploy package. |
| `app.js` | Legacy/static script companion retained in deploy package. |
| icon files | PWA icons and Apple touch icon. |

Reference/development files:

| Path | Purpose |
| --- | --- |
| `next-app/` | React/Vite/TypeScript project used for tests and future development reference. |
| `react-app/` | Built React bundle retained, but not the production entry. |
| `docs/` | Architecture history, release decisions, QA plans, and this handover. |
| `STABLE-APP-LOCK.md` | Explicit lock preventing unapproved UI/layout changes. |

## Build And Validation Commands

Run from `next-app/`:

```bash
npm ci
npm test
npm run lint
npm run build
```

Expected current automated result:

- `npm test`: pass
- `npm run lint`: pass with existing fast-refresh warnings only
- `npm run build`: pass

Serve the stable app from the repo root:

```bash
python -m http.server 5175 --bind 127.0.0.1
```

Open:

- `http://127.0.0.1:5175/`
- `http://127.0.0.1:5175/legacy-root-pwa.html`

The root URL must lead to the stable app, not the React app.

## Architecture Integrity Checks

The tester must inspect and verify:

1. Root routing
   - `index.html` redirects/links/scripts to `./legacy-root-pwa.html`.
   - It must not route production users to `./react-app/index.html`.

2. PWA manifest
   - `manifest.json` `start_url` must be `./legacy-root-pwa.html?v=stable`.
   - Icons must resolve.
   - Installed app title/icon must look correct.

3. Service worker
   - Cache version must be stable rollback cache.
   - Stable app must be cached.
   - Offline navigation fallback must check `./legacy-root-pwa.html` before `offline.html`.
   - Old React caches should not trap users on stale React screens.

4. Data architecture
   - Production stable app uses browser local storage and IndexedDB.
   - No external backend should receive private document data.
   - Clearing browser site data should remove local wallet data.
   - Backup export/import is the required user-controlled transfer mechanism.

5. Privacy and security posture
   - Documents and scans must remain local unless the user manually exports/shares.
   - Backup JSON handling must be reviewed for plaintext exposure and realistic user risk.
   - PIN, auto-lock, biometric registration, and encrypted/unencrypted states must be tested.
   - OCR libraries may load from CDN when OCR is used; document this behavior clearly.

6. UI lock integrity
   - Ocean animation, helm animation, glass theme, top bar, category row, tools/search row, cards, modals, FAB, and responsive layout must match the stable approved app.
   - Any discrepancy from the approved stable UI must be reported.

## Required Device And Browser Matrix

Test at minimum:

| Platform | Browser | Required |
| --- | --- | --- |
| iOS | Safari | Yes |
| iPadOS | Safari | Yes |
| Android | Chrome | Yes |
| Windows | Chrome | Yes |
| Windows | Edge | Yes |
| macOS | Safari | Preferred or formally waived |
| macOS | Chrome | Preferred or formally waived |

For each run record:

- device model
- OS version
- browser version
- app URL
- commit tested
- tester name
- date/time
- network condition
- installed/PWA state
- evidence folder or links

## Feature Test Suite

Use sample data only. Do not use real passport numbers, CDC numbers, medical details, phone numbers, addresses, or identity documents.

Suggested sample data:

- PIN: `123456`
- Wrong PIN: `000000`
- Passport title: `QA Passport`
- CDC title: `QA CDC`
- Certificate title: `QA STCW Basic Safety`
- Vessel: `MV QA Test`
- Sea-service dates: `2026-01-01` to `2026-01-31`
- OCR MRZ sample:

```text
P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
L898902C36UTO7408122F3204159ZE184226B<<<<<10
```

### 1. Launch, Install, And Offline

Test:

- Root URL opens the stable app.
- Direct `legacy-root-pwa.html` opens the stable app.
- Hard refresh does not break the app.
- PWA install/add-to-home-screen works where supported.
- App launches from installed icon.
- First online load registers/caches offline assets.
- App opens while offline.
- Navigation fallback remains usable offline.
- App survives browser restart.

Evidence:

- screenshots or recordings
- browser application/storage screenshot if available
- installed icon screenshot
- offline screenshots or notes

### 2. Stable UI, Animation, And Layout

Test:

- Ocean background renders.
- Helm brand animation renders.
- Reduced-motion setting disables or minimizes motion where supported.
- Top bar remains usable on phone, tablet, and desktop.
- Category tabs all fit in one row with no horizontal scrolling.
- Category labels remain readable and distinct on phone/tablet widths, including the compact code labels.
- Tools/action controls are readable and non-scrolling on phone, tablet, and desktop.
- Search box spans a full row below the tools/actions.
- No horizontal scrolling in category row or tools/search rows.
- Document cards, profile strip, modals, FAB, and glass theme remain consistent.
- Text does not overlap, clip, or escape controls.

Evidence:

- desktop screenshot
- phone screenshot
- tablet screenshot
- notes on visual discrepancies

### 3. Profile

Test:

- Open profile modal.
- Add/edit sample seafarer profile fields.
- Add/change profile photo using sample image.
- Save and reload.
- Confirm profile values and photo persist.
- Confirm no layout break from long names/ranks.

### 4. Document CRUD

Test all categories:

- Passport
- CDC
- COC
- Visas
- Certificates
- Medical
- Yellow Fever
- Contract
- Other

For each:

- create document
- enter title, number, authority, issue date, expiry date
- test no-expiry option
- add notes, tags, flag notes, favourite
- attach image
- attach PDF
- view details
- edit
- delete
- verify category counts update
- verify reminder/status badge accuracy

### 5. Search, Sort, Filter, And View Toggle

Test:

- Search by title.
- Search by number.
- Search by authority.
- Sort by expiry.
- Sort by name.
- Sort by type.
- Sort by recent.
- Filter all status.
- Filter valid.
- Filter expiring.
- Filter expired.
- Filter no expiry.
- Toggle list/grid view.
- Confirm no visual overflow in tools row.

### 6. Checklist, Summary, Share, Calendar, Timeline

Test:

- Checklist opens and reflects current documents.
- Summary print/download renders correctly.
- Share action works where browser supports Web Share.
- Share gracefully falls back where unsupported.
- Calendar export creates valid `.ics` with expiry dates.
- Timeline opens/closes and displays correct chronological data.

Evidence:

- screenshots
- exported `.ics`
- summary output
- notes on unsupported browser APIs

### 7. Packs, STCW, Sea Time, Vaccines

Test:

- Packs UI opens and supports create/edit/delete or intended workflow.
- STCW matrix opens and reflects rank/profile where relevant.
- Sea-time entry can be created for `MV QA Test`.
- Inclusive day count for `2026-01-01` to `2026-01-31` should be checked against expected behavior.
- Sea-time persists after reload.
- Vaccines UI opens and supports intended entries/reminders.
- Backup/restore preserves packs, STCW-related metadata, sea-time, and vaccines.

### 8. Bulk Selection

Test:

- Enter select mode.
- Select multiple documents.
- Favourite selected.
- Share selected where supported.
- Delete selected only after confirmation.
- Cancel select mode.
- Counts and UI state reset correctly.

### 9. Attachments, Camera, Files, PDFs

Test:

- Camera capture on supported mobile browsers.
- File picker image upload.
- PDF upload.
- Large file guardrail.
- Image optimization behavior.
- Preview image/PDF.
- Download attachment.
- Print attachment.
- Reload and confirm attachments persist.

### 10. OCR

Test:

- OCR button appears in Full mode.
- OCR does not appear or is limited in Lite mode as designed.
- OCR runs on image attachment over localhost/HTTPS.
- First-run OCR library loading behavior is recorded.
- OCR failure states are clear and recoverable.
- MRZ sample can be pasted/reviewed if image OCR is unavailable.
- Apply suggestions updates document fields correctly.
- Dismiss OCR does not corrupt data.
- PDF OCR fallback behavior is documented.

### 11. PIN, Lock, Auto-Lock, Biometric

Test:

- Set PIN.
- Confirm current PIN required for changes where applicable.
- Lock now.
- Unlock with correct PIN.
- Unlock with wrong PIN.
- Wrong PIN must fail without data loss.
- Auto-lock setting saves and behaves as expected.
- Remove PIN after confirmation.
- Biometric registration behavior on supported devices.
- Biometric unsupported behavior is clear and non-blocking.
- Lost PIN message/behavior is understandable.

### 12. Backup, Restore, Import, Export

Test:

- Full backup download.
- Backup filename and JSON metadata clearly identify the stable backup version.
- New stable backups include a SHA-256 integrity block.
- Backup JSON structure and contents.
- Assess whether sensitive document titles, numbers, notes, or image data are plainly visible.
- Import backup into clean browser profile.
- Restore shows a confirmation summary before writing any imported records.
- Confirm all documents and attachments restore.
- Confirm profile restores.
- Confirm packs/logs/sea-time/vaccines/reminders restore.
- Wrong/corrupt/tampered backup file fails cleanly before any import write.
- Duplicate import behavior is documented.
- Meta transfer exports only intended lightweight metadata.
- Status summary download works.

### 13. Lite And Full Mode

Test:

- Toggle Full to Lite.
- Toggle Lite to Full.
- Confirm Lite hides intended Full-only tools.
- Confirm core document wallet remains usable in Lite.
- Confirm no data loss when switching modes.
- Confirm layout remains clean in both modes.

### 14. Settings And Theme

Test:

- Theme toggle.
- Reminder windows save.
- Install/Add to Home Screen action.
- Export/import settings behavior.
- Clear all data requires confirmations.
- Clear all data removes expected local data.
- Settings modal scroll/spacing on phone.

### 15. Error Handling And Resilience

Test:

- Refresh during modal use.
- Back/forward navigation where relevant.
- Offline while opening app.
- Offline while saving data.
- Unsupported Web Share.
- Unsupported WebAuthn/biometric.
- Unsupported OCR.
- Denied camera permission.
- Blocked IndexedDB/localStorage.
- Private browsing restrictions.
- Very long document titles/tags/notes.
- Many documents, at least 100 sample records if practical.

## Build Quality Assessment

The tester should assess:

- whether production files are understandable and maintainable
- whether the stable single-file app creates maintainability risk
- whether inline scripts/styles should be split in future
- whether service worker cache invalidation is robust
- whether automated tests sufficiently guard production routing and UI lock
- whether build scripts and deploy package are clear
- whether dependency footprint is appropriate
- whether generated React artifacts confuse deployment or release ownership

## Security And Privacy Assessment

The tester should explicitly answer:

- What sensitive data is stored?
- Where is it stored?
- Is anything transmitted externally?
- Does OCR load third-party code or data?
- Are backups encrypted, obfuscated, or plaintext?
- Can a user reasonably understand backup risk?
- What happens when a device is shared, lost, or browser data is cleared?
- Are PIN/biometric claims accurate in real browsers?
- Is there any misleading security language?

## User Acceptance Criteria

The app should be considered user-acceptable only if:

- stable app opens from root and installed PWA
- all key document categories are usable
- document CRUD works without data loss
- attachments work for images and PDFs
- backup/export/import works reliably
- offline launch works after first online load
- UI remains stable, polished, and non-scrolling in the approved tab rows
- no critical browser/device blocks remain unresolved
- no privacy or security claim is materially misleading
- tester can complete core seafarer workflows without developer help

## Defect Severity

Use this severity scale:

| Severity | Meaning | Examples |
| --- | --- | --- |
| S1 Critical | Blocks release or risks data loss/security failure | data lost after reload, backup cannot restore, app will not open, private data uploaded unexpectedly |
| S2 High | Major workflow broken or misleading | cannot add key document category, offline unusable, PIN behavior unsafe, mobile layout prevents use |
| S3 Medium | Usability or compatibility issue with workaround | OCR unreliable on one browser, print layout poor, text clipping in edge case |
| S4 Low | Cosmetic or minor polish issue | small spacing inconsistency, unclear label, minor animation issue |

## Required Final Report Format

The third-party report must include the following sections.

### 1. Executive Summary

- Overall recommendation: Pass, Conditional Pass, or Fail.
- Top release blockers.
- Highest-risk user workflows.
- Whether the app meets user acceptance criteria.

### 2. Test Environment

For each environment:

- device
- OS
- browser/version
- install/PWA state
- online/offline state
- URL tested
- commit tested
- tester
- date

### 3. Architecture Integrity Findings

Address:

- root routing
- manifest/start URL
- service worker/offline fallback
- local data storage
- privacy/security claims
- stable UI lock compliance
- deploy package clarity

### 4. Feature Results Matrix

Use this format:

| Feature Area | Result | Evidence | Defects | Notes |
| --- | --- | --- | --- | --- |
| Launch/install/offline | Pass/Fail/Partial | link/screenshot | IDs | notes |
| Profile | Pass/Fail/Partial | link/screenshot | IDs | notes |
| Documents | Pass/Fail/Partial | link/screenshot | IDs | notes |
| Attachments | Pass/Fail/Partial | link/screenshot | IDs | notes |
| OCR | Pass/Fail/Partial | link/screenshot | IDs | notes |
| Backup/restore | Pass/Fail/Partial | link/screenshot | IDs | notes |
| PIN/biometric | Pass/Fail/Partial | link/screenshot | IDs | notes |
| Packs/STCW/logs | Pass/Fail/Partial | link/screenshot | IDs | notes |
| UI/layout | Pass/Fail/Partial | link/screenshot | IDs | notes |

### 5. Defect Log

Use this format for every issue:

| ID | Severity | Title | Environment | Steps | Expected | Actual | Evidence | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

### 6. Shortcomings And Discrepancies

List:

- missing features
- unclear features
- behavior that differs from user expectations
- documentation gaps
- browser limitations
- accessibility gaps
- security/privacy gaps

### 7. User Acceptance Assessment

For each acceptance criterion:

- Met / Partially Met / Not Met
- evidence
- explanation
- required fix or waiver

### 8. Improvements Recommended

Separate:

- release-blocking fixes
- post-release improvements
- documentation improvements
- architecture improvements
- UX improvements requiring Jenny approval

### 9. Final Sign-Off

The report must end with:

- tester name and organization
- date
- final recommendation
- open release blockers
- explicit statement whether the app is ready for release as stable production

## Evidence Handling Rules

- Use sample data only.
- Do not include real personal documents in evidence.
- Redact any accidental private information.
- Attach screenshots/recordings for every pass/fail decision where practical.
- Include exported sample backups only if they contain fake data.
- Label evidence by device/browser and test case.

## Release Decision Rule

Do not release based only on automated tests. Release should proceed only after:

- all S1 and S2 defects are fixed or formally waived
- core workflows pass on required browsers/devices
- privacy/security claims are verified or corrected
- backup/restore is proven with sample data
- offline/PWA behavior is proven
- Jenny approves any UI/UX changes that affect the locked stable app

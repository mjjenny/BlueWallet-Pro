# BlueWallet Pro Stable App - Current Status Handover

Date prepared: 2026-08-09  
Prepared for: Jenny / BlueWallet Pro stable app continuity  
Purpose: hand this note to a new Codex task or another AI assistant so future work can continue without breaking the existing workflow, UI, data model, or deployment chain.

## 1. Executive Status

The stable app is working and currently deployed through the Sites/Cloudflare path, not the older GitHub Pages path.

Live stable app:

`https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html`

Current app shell/cache version:

`blue-wallet-stable-rollback-v0.19`

Current stable source branch:

`development/stable-app-copy`

Current stable source commit:

`599c8ad02a689cbdc45bfa69f836340dbab99c64`

Current hosted Sites source commit:

`946102fa174c4533e92e6fcbd76ff4df26c3325a`

Current Sites project ID:

`appgprj_6a74d7c5b9f4819192ac2f63287fa26d`

Current deployed Sites version:

Version `6`

Current production deployment status:

Succeeded and verified live. The deployed HTML and service worker both contain `v0.19`. Live verification confirmed:

- PDF-capable OCR code is present.
- Encrypted Sync Vault is present.
- In-app update prompt/update button wiring is present.
- Service worker is on `blue-wallet-stable-rollback-v0.19`.

## 2. Non-Negotiable Product Rules

The stable app UI, animation, visual identity, and layout are locked unless Jenny explicitly approves a visual redesign.

Future work must preserve:

- Ocean/glass visual shell.
- Wave animation and theme motion.
- Desktop and mobile layout shape.
- Category row visibility.
- Tools row/search layout.
- 70/30 document viewer split on larger screens.
- Existing stable controls and labels unless Jenny asks for change.
- Local-first privacy model.

Do not casually redesign the app. For feature work, add behavior inside the existing surfaces wherever possible.

Saved documents must not be deleted, reset, migrated, or overwritten without explicit confirmation. Most user data lives in the browser/device storage, not in the git repo.

## 3. Current Primary Workflow

The preferred production workflow is now:

Developer local stable source  
-> Git commit on `development/stable-app-copy`  
-> Push to GitHub repo as source backup/history  
-> Copy production shell files into Sites wrapper  
-> Commit and push Sites wrapper source  
-> Save Sites version  
-> Deploy Sites version  
-> End user opens Sites/Cloudflare URL  
-> App update button/service worker updates installed desktop/mobile app

Current production URL:

`https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html`

Avoid treating GitHub Pages as the production path. It caused repeated confusion and deployment/cache delays earlier. GitHub remains useful as source control; Sites is the better live delivery path.

## 4. Important Local Paths

Stable source repo:

`C:\Users\Jenny\Documents\Codex\2026-08-05\mjjenny-bluewallet-pro\work\BlueWallet-Pro-stable-app-copy`

Hosted Sites wrapper:

`C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6`

Sites hosting config:

`C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6\.openai\hosting.json`

Supabase SQL setup script:

`C:\Users\Jenny\Documents\Codex\2026-08-05\mjjenny-bluewallet-pro\work\BlueWallet-Pro-stable-app-copy\docs\SUPABASE-ENCRYPTED-SYNC-VAULT.sql`

Primary app file:

`legacy-root-pwa.html`

Service worker:

`service-worker.js`

React migration app:

`next-app`

Legacy production shell is still the stable production entry. The React app exists and is tested, but the live stable wallet entry is `legacy-root-pwa.html`.

## 5. Current Architecture

### 5.1 App Shell

The stable user-facing app is a single-file offline-first PWA:

- `legacy-root-pwa.html` contains the main UI, local data logic, backup/sync tools, OCR, print handling, settings, themes, and feature flows.
- `service-worker.js` caches the app shell and supports offline loading.
- `manifest.json`, icons, and static assets support installed PWA behavior.
- `offline.html` is the fallback.

### 5.2 Local Data

Primary local store:

`IndexedDB` database named `SeafarerWalletDB`

Important local data types include:

- Documents and scan/PDF attachments.
- Seafarer profile.
- Packs.
- Sea-time entries.
- Vaccines.
- Activity/audit log.
- Quality checklist metadata.
- Reminder settings.
- App settings and theme selection.
- PIN/biometric settings.
- Sync settings, if configured.

The app is local-first. Documents are not automatically uploaded anywhere.

### 5.3 Backup/Restore

The app supports full backup export/import:

- Current backup label: full backup v6.
- Backup has version label and integrity check.
- Restore shows a confirmation summary before import.
- Restore merges/updates local records.
- Backup files are user-owned JSON downloads.

Important: If a backup says only `Sea time entries: 22` and `Documents: 0`, that file only contains sea-time data. It will not restore documents. The full document backup must show document counts before restore.

### 5.4 Encrypted Sync Vault

Encrypted Sync Vault is optional Supabase sync.

Tables:

- `bluewallet_sync_vaults`
- `bluewallet_sync_vault_chunks`

The app encrypts the full backup locally before upload. Supabase stores unreadable encrypted payload/chunks only. Another device pulls and decrypts with the same Supabase URL, anon key, vault ID, and sync passphrase.

Required one-time Supabase setup:

Run `docs/SUPABASE-ENCRYPTED-SYNC-VAULT.sql` in Supabase SQL Editor.

If sync fails:

- Confirm Supabase project is active, not paused.
- Confirm both sync tables exist.
- Confirm the anon key and project URL are correct.
- Confirm same vault ID and passphrase on both devices.
- Check Supabase Database logs for exact failed query.

### 5.5 OCR

Current OCR status: upgraded in v0.19.

OCR now supports:

- JPG/PNG scan OCR.
- PDF OCR by rendering PDF pages in-browser first.
- Enhanced contrast preparation.
- Safe layout zones.
- MRZ/passport band check where possible.
- Reusable OCR worker to reduce repeated startup cost.
- First 4 PDF pages per file for stability.

OCR still has realistic limitations:

- Browser OCR is not perfect on poor scans.
- It depends on external OCR/PDF libraries being reachable when OCR is pressed.
- It requires HTTPS or localhost.
- User must always review extracted values before applying/saving.
- Very faint, skewed, cropped, handwritten, or low-resolution scans may still need manual entry.

### 5.6 Print

Recent print fixes:

- Desktop document print works cleanly.
- PDF blank-print issue was fixed.
- Mobile PDF print opens a mobile-friendly action page with Back to Blue Wallet, Share/Print PDF, and Open PDF.

Known mobile behavior:

- iOS printing depends on Safari/PWA share sheet behavior.
- If the print action opens a document view, user may need Share -> Print.

### 5.7 Update Flow

The app has an in-app update prompt/update button.

Version source:

- HTML: `APP_CACHE_VERSION`
- Service worker: `CACHE_VERSION`

Current value:

`blue-wallet-stable-rollback-v0.19`

Every deployed app-code update must bump both values. Otherwise installed desktop/mobile PWAs may not show the update prompt reliably.

## 6. User Interface Summary

### 6.1 Desktop

Desktop UI contains:

- Sticky top bar with brand, mode toggle, profile, lock, help, settings, and add button.
- Document vault profile/status strip.
- Category tabs in one visible row with no horizontal scrolling.
- Tools row arranged cleanly with search below/full-width.
- Document cards grouped by category/status.
- Full document viewer with about 70% scan/PDF preview and 30% quality/version/details area.
- Settings & Backup sheet.
- Help section.
- OCR controls in Add/Edit.
- Print/download/share controls.

Desktop must remain dense, functional, and scan-friendly. Avoid marketing-page style layouts.

### 6.2 Mobile

Mobile UI contains:

- Compact top bar.
- Category labels shortened where needed but unclipped.
- Tools row/search adjusted to avoid horizontal scroll.
- Add/Edit modal sized to fit phone widths.
- Scanner/camera flow with cancel recovery.
- Mobile PDF print action page.
- PWA install behavior.
- Update prompt/button.

Mobile must preserve:

- No horizontal scrolling for category/tools rows.
- Readable labels.
- Large enough touch targets.
- No clipped forms.
- Modal body scroll that does not trap the page awkwardly.

## 7. Current Feature Set

Core wallet:

- Add/edit/delete documents.
- Attach scans/photos/PDFs.
- Download files.
- Print files.
- View document status.
- Search/sort/filter.
- Category tabs.
- Expiry banner.
- No-expiry support.
- Document quality checklist.
- Notes, tags, flag notes.
- Favorites.

Maritime features:

- Passport, CDC, COC, visas, certificates, medical, yellow fever, contracts, other.
- STCW tools.
- Packs.
- Sea-time log.
- Vaccines.
- Calendar/reminder exports.
- Timeline.
- Summary.
- Printable index/status summary.

Security/privacy:

- Local-first IndexedDB storage.
- Optional PIN.
- Optional biometric/WebAuthn on HTTPS/localhost.
- AES-GCM style encrypted local vault behavior where configured.
- Encrypted sync vault optional.
- No external document upload unless user explicitly uses encrypted sync.

Recovery/data movement:

- Full backup export/import.
- Integrity checks.
- Corrupt-file recovery behavior.
- Multi-device encrypted vault sync.
- Meta transfer.

Quality/audit:

- Activity log.
- Backup health.
- Release readiness panel.
- Real device QA pack.
- Accessibility/test safeguards.

Appearance:

- Ocean Blue default.
- VIBGYOR theme choices.
- Animated sea-themed motion styles.
- Stable visual shell locked.

## 8. Build/Test/Deploy Commands

Stable app source tests:

From:

`C:\Users\Jenny\Documents\Codex\2026-08-05\mjjenny-bluewallet-pro\work\BlueWallet-Pro-stable-app-copy\next-app`

Run:

`npm test`

Expected latest result:

`21 passed / 101 tests passed`

Build:

`npm run build`

Lint:

`npm run lint`

Known lint output:

Only existing React Fast Refresh warnings. These warnings existed before and are not release blockers.

Hosted wrapper test:

From:

`C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6`

Run:

`npm test`

Expected:

Build passes and 2 rendered HTML tests pass.

## 9. Deployment Procedure

### 9.1 Stable Source

1. Make code changes in stable source repo.
2. Run `npm test`, `npm run build`, `npm run lint` from `next-app`.
3. Bump `APP_CACHE_VERSION` in `legacy-root-pwa.html`.
4. Bump `CACHE_VERSION` in `service-worker.js`.
5. Update tests expecting the cache version.
6. Commit on `development/stable-app-copy`.
7. Push to `origin development/stable-app-copy`.

### 9.2 Sites Deployment

1. Copy updated `legacy-root-pwa.html` and `service-worker.js` into:

   `C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6\public`

2. Update hosted wrapper tests if version or markers changed.
3. Run hosted `npm test`.
4. Commit hosted wrapper changes.
5. Push to Sites remote using a short-lived Sites source repository credential.
6. Save a Sites version using the exact pushed commit SHA.
7. Deploy the saved Sites version.
8. Verify live production URL:

   `https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html`

Verification should check:

- HTML contains the expected `APP_CACHE_VERSION`.
- Service worker contains the expected `CACHE_VERSION`.
- Key changed feature markers are present.
- Old/removed broken markers are absent.

## 10. Known Issues / Remaining Work

### 10.1 Real Device QA

Still required for final assurance:

- iOS Safari real device.
- Android Chrome real device.
- Windows Chrome.
- Windows Edge.
- Installed PWA behavior on desktop/mobile.
- Camera permissions.
- Mobile PDF print/share behavior.
- Offline reload after update.
- Supabase sync upload/pull across actual devices.

### 10.2 OCR Quality

OCR is improved but should be field-tested with real documents:

- Passport stamps.
- Certificates.
- CDC pages.
- Visa pages.
- Multi-page PDFs.
- Low-light camera scans.
- Cropped/rotated scans.

Possible future OCR improvements:

- User-selectable OCR page range.
- Rotate before OCR.
- Crop before OCR.
- Per-page OCR preview.
- Confidence warnings.
- Better date/number parsing per document category.
- Local OCR fallback packaging if CDN access becomes a problem.

### 10.3 Sync UX

Encrypted Sync Vault works conceptually and was used successfully after Supabase setup. Future polish:

- Friendlier error messages for Supabase table/setup errors.
- Clearer “last uploaded / last pulled” status.
- Show document/sea-time counts before upload and after pull.
- Safer conflict summary before merging device data.

### 10.4 Backup Discipline

Jenny should keep periodic full backups, especially before:

- Importing data.
- Syncing a new device.
- Major feature updates.
- Clearing browser/site data.

### 10.5 Deployment Hygiene

Do not return to GitHub Pages as primary deployment unless explicitly requested. Sites deployment is currently the better live path.

There are old untracked generated archives in the hosted wrapper `build/` folder from prior packaging attempts. They are not part of the current release and should be ignored unless a cleanup is explicitly requested.

## 11. Data Safety Notes

User documents are stored locally in the browser/device IndexedDB. They are not stored in the git repo.

Changing app code does not delete saved documents by itself.

Risk to documents comes from:

- Clearing browser/site data.
- Importing a backup that does not contain expected documents.
- Using a different URL/origin, because browser storage is origin-specific.
- Device/browser storage cleanup.
- Accidental reset/clear-all action.

Before any risky operation:

1. Export a full backup.
2. Confirm backup preview shows expected document count.
3. Keep the downloaded JSON file safely.

## 12. New Assistant Start Prompt

Use this prompt in a new chat/task:

```
We are continuing BlueWallet Pro stable app development.

Read docs/CURRENT-STATUS-HANDOVER-2026-08-09.md first.

Stable source repo:
C:\Users\Jenny\Documents\Codex\2026-08-05\mjjenny-bluewallet-pro\work\BlueWallet-Pro-stable-app-copy

Branch:
development/stable-app-copy

Current stable source commit:
599c8ad02a689cbdc45bfa69f836340dbab99c64

Hosted Sites wrapper:
C:\Users\Jenny\Documents\Codex\2026-08-05\phase-19-is-complete-on-feature\work\bluewallet-sites-deploy-v6

Live stable app:
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html

Current app version:
blue-wallet-stable-rollback-v0.19

Rules:
- Do not change the stable UI, animation, layout, or visual identity unless I explicitly approve.
- Do not delete, reset, migrate, or overwrite saved documents.
- Keep the app local-first.
- Use Sites/Cloudflare deployment, not GitHub Pages, for production.
- Bump both APP_CACHE_VERSION and CACHE_VERSION for every deployed code update.
- Run tests/build/lint before deploying.
- Preserve desktop and mobile behavior.

Current known next work should be scoped, tested, and deployed through the existing workflow.
```

## 13. Quick Current Status Line

As of 2026-08-09: BlueWallet Pro stable app is live on Sites at `v0.19`, with working update detection, full backup/import, encrypted Supabase sync support, desktop/mobile print fixes, VIBGYOR themes, locked stable UI, and upgraded image/PDF OCR. Remaining must-do work is real-device QA and careful future feature iteration without altering the approved visual shell.


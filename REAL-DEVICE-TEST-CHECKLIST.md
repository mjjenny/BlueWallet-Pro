# Real-Device Test Checklist

Playwright's suite (`PLAYWRIGHT_AUDIT.md`) covers real Chromium/WebKit rendering
engines across three viewport profiles, but that is not the same as an actual
phone in someone's hand: camera/scanner hardware, native share sheets, real
PWA install flow, real touch/gesture behavior, and actual offline conditions
are all out of its reach. This checklist is scoped to exactly those gaps.

There is no automated substitute for this pass — it requires a human with
physical devices. See `BLUEWALLET_HANDOVER.md` §10 for context on why this is
still open.

**App URL:** `https://bluewallet-pro.cl76380.workers.dev/legacy-root-pwa`

## Before you start

- Note the exact device model, OS version, and browser version for each device tested.
- Do a first pass in a fresh/incognito profile (clean onboarding), then a second pass on a normal profile with the app actually installed.
- Have a real (or realistic dummy) document photo ready to test scanning/OCR with — a passport-style photo page is the best test of the MRZ path specifically.

## iOS Safari / PWA

1. Install to Home Screen (Share → Add to Home Screen) — icon and name correct; opens standalone with no Safari chrome.
2. Onboarding walkthrough completes and does not reappear on reopen.
3. Camera capture on Add Document actually opens the camera and captures a usable photo.
4. OCR ("Read text from scan") on that photo — suggestions appear and are reasonably accurate, especially the MRZ band on a passport-style document (this pipeline was just reworked — worth specifically confirming it's better than before, not just "not broken").
5. Attach a PDF, view it, and use Share / Print PDF — the iOS share sheet and AirPrint actually open and work.
6. Share a Pack via the native share sheet.
7. Face ID / Touch ID unlock, if enabled in Settings.
8. Airplane Mode: app still opens, existing documents are visible, adding a document while offline works and isn't lost when back online.
9. After a new deploy, the app picks it up (update toast appears / applies) without requiring a hard refresh.
10. Touch targets (bottom nav, buttons) are comfortably tappable — no dead zones, no accidental double-activation.
11. No content hidden behind the notch / home-indicator safe areas.

## Android Chrome / PWA

1. Install (banner prompt or menu → Install app) — icon/name correct, opens standalone.
2. Onboarding as above.
3. Camera capture as above.
4. OCR as above.
5. PDF/print flow — Android's print dialog differs from iOS's, confirm it actually works.
6. Native share sheet for Pack sharing.
7. Fingerprint/biometric unlock, if supported.
8. Airplane Mode as above.
9. Update flow as above.
10. Hardware/gesture Back button closes an open modal rather than backing out of the whole app (Android-specific — no iOS equivalent).
11. Touch targets as above.

## Windows Desktop (Edge/Chrome)

1. Optional install as a desktop app.
2. File-picker upload flow for documents (desktop has no camera-capture path).
3. Print dialog / print preview renders correctly.
4. Keyboard navigation spot-check (Tab order, Escape closes modals) — Playwright already covers this synthetically; confirm on a real keyboard.
5. Window resize to odd/narrow widths doesn't break layout.

## Cross-device: Encrypted Sync (only if you have it configured)

1. Upload the encrypted vault from Device A.
2. Pull it on Device B with the same vault ID and passphrase — documents match.
3. A wrong passphrase is rejected with a clear error and does not corrupt local data on the pulling device.

## Reporting a bug found during this pass

For each issue, capture:

- Device / OS version / browser version
- Steps to reproduce
- Expected vs. actual behavior
- A screenshot or screen recording if at all possible
- Severity: blocks core use / annoying but workable / cosmetic

Bring these back the same way findings from the Playwright audit came back — concrete and reproducible, not "it feels off."

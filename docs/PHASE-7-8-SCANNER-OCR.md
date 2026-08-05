# Phase 7-8 Scanner and OCR

Phase 7-8 adds a React-owned scanner and OCR review workflow on top of the Phase 6 encrypted vault. The production root PWA remains untouched, and `SeafarerWalletDB` remains read-only.

## Scope

- Browser camera capture through mobile/desktop file capture controls.
- Multi-page image and PDF import.
- Best-effort image cleanup, orientation handling, and JPEG compression when browser canvas/image bitmap APIs are available.
- OCR review panel with local text parsing.
- Passport MRZ parsing.
- CDC and certificate field extraction.
- Confidence scoring and field-level review.
- Review-before-save workflow.
- Encrypted save through the Phase 6 `BlueWalletReactDB` vault.

## Architecture

Scanner modules live under `next-app/src/features/scanner`:

- `ScannerWorkflow.tsx`: capture/import UI, page queue, OCR review, document-field review, and encrypted save.
- `scannerPipeline.ts`: scan page normalization, image cleanup/compression fallback, duplicate-page handling, and file conversion.
- `scannerOcr.ts`: local OCR-text parser for MRZ, CDC, certificate, and generic document suggestions.

The scanner does not write directly to IndexedDB. It calls the existing React wallet provider, which requires an unlocked Phase 6 vault and encrypts documents/attachments before writing to `BlueWalletReactDB`.

## OCR Behavior

Phase 7-8 treats OCR output as suggestions, not facts:

- Passport MRZ lines can suggest document type, title, passport number, authority/nationality, and expiry date.
- CDC text can suggest CDC number, authority, issue date, and expiry date.
- Certificate text can suggest certificate number, issue date, expiry date, and category.
- Every suggestion has a confidence score and must pass the normal document validation before save.
- Users can edit fields before the encrypted save.

## Offline Handling

- Capture/import and encrypted save are local.
- OCR parsing is local once OCR text is available.
- If browser image cleanup APIs are unavailable, the original image/PDF is retained.
- No network OCR service is called in this phase.

## Security Boundary

- Scanner saves go through `createDocument` in the React wallet provider.
- Documents and attachments are encrypted as AES-GCM envelopes before storage.
- No scanner code opens or writes `SeafarerWalletDB`.
- No legacy migration execution is implemented.

## Deferred

- Full image-to-text OCR engine with trained language data.
- Automatic crop rectangle UI.
- Perspective correction handles.
- AI model-based field extraction.
- Camera stream UI beyond browser file capture controls.
- Maritime toolkit modules.

## Test Coverage

Automated coverage includes:

- MRZ parsing.
- CDC number and expiry extraction.
- Certificate issue/expiry extraction.
- Scanner controls render after vault unlock.
- Scanner-created document saves through the encrypted React wallet flow.
- Existing Phase 6 encrypted CRUD, backup, PIN, and key-rotation coverage remains green.

# Phase 3: Read-Only React Wallet Shell

## Scope

Phase 3 builds a production-quality React/TypeScript read-only shell under `next-app/`. The root PWA remains the production baseline and was not modified.

The React shell can inspect compatible legacy data, display readable records, identify encrypted records, and report malformed rows without writing to IndexedDB, localStorage, or sessionStorage.

## Components Created

Application shell:

- `src/app/App.tsx`
- `src/app/routes.tsx`
- `src/app/WalletShell.tsx`
- `src/app/providers/LegacyDataProvider.tsx`

Dashboard and status:

- `src/features/dashboard/Dashboard.tsx`
- `src/features/migration-status/MigrationStatus.tsx`
- `src/features/profile/ProfileSummary.tsx`

Documents:

- `src/features/documents/CategoryNav.tsx`
- `src/features/documents/DocumentToolbar.tsx`
- `src/features/documents/DocumentList.tsx`
- `src/features/documents/DocumentCard.tsx`
- `src/features/documents/DocumentDetails.tsx`
- `src/features/documents/documentCategories.ts`
- `src/features/documents/documentModel.ts`
- `src/features/documents/documentSelectors.ts`

Shared helpers:

- `src/shared/dates/dateUtils.ts`
- `src/shared/files/fileUtils.ts`
- `src/shared/status/documentStatus.ts`
- `src/shared/formatting/text.ts`
- `src/hooks/useOnlineStatus.ts`
- `src/components/Badge.tsx`

Styling:

- `src/App.css`
- `src/index.css`

## Legacy Adapters Used

The shell uses Phase 2 read-only adapters:

- `detectLegacyDatabase`
- `readLegacyDocumentsFromDatabase`
- `readLegacyProfileFromDatabase`
- `readFallbackDocumentsFromStorage`
- `readLegacySettingsFromStorage`
- `parseLegacyDocumentRecord`
- encrypted-record detection from `legacyCryptoRecords`

The provider opens IndexedDB only after safe detection reports the legacy database as present. Reads use `readonly` transactions. If IndexedDB cannot be safely confirmed, the provider can inspect Safari fallback rows from localStorage without writing.

## User Flows Implemented

- Read-only load state: loading, success, partial-data, unavailable, and error.
- Wallet dashboard: readable, encrypted, valid, expiring, expired, no-expiry, malformed counts.
- Category navigation: Passport, CDC, COC, Visa, Certificate, Medical, Yellow Fever, Contract, Other.
- Read-only document list with title, number, authority, category, expiry, status, favorite state, attachment count, and tags.
- Encrypted/unavailable record representation without decryption attempts.
- Read-only details modal with metadata, notes, flag-state notes, source format, attachment list, image preview, and PDF fallback.
- Search across title, document number, authority, notes, flag notes, and tags.
- Filters for all, valid, expiring, expired, no expiry, and encrypted/unavailable.
- Sorting by expiry, name, category, and recently updated.
- Migration status panel with database status, readable/encrypted/malformed counts, warnings, source, and read-only statement.
- Online/offline status indicator.

## Accessibility Decisions

- Category navigation is a semantic `nav` with accessible buttons and `aria-current`.
- Details view uses `role="dialog"` and `aria-modal`.
- Loading and empty states use live-region-friendly sections.
- Controls are native `button`, `input`, and `select` elements.
- Minimum touch target height is 44px.
- Focus-visible styling is explicit and high contrast.
- No edit or delete controls are rendered in Phase 3.
- Encrypted records are labeled as unavailable instead of silently hidden.

## Mobile Layout Decisions

- Layout uses `100svh` and safe-area padding for standalone PWA viewports.
- Header and sticky areas account for `env(safe-area-inset-top)`.
- Category navigation scrolls horizontally and avoids page-width overflow.
- The primary layout collapses from two columns to one column under tablet width.
- Document cards collapse to a single-column action layout on small screens.
- At 320px width, category tabs retain readable labels and fixed touch targets.
- Reduced-motion users get effectively disabled transitions and animations.

## Tests Added

Test setup:

- `src/test/setup.ts`
- `src/test/testSnapshots.ts`

Unit tests:

- `src/features/documents/__tests__/documentSelectors.test.ts`

React/UI tests:

- `src/app/__tests__/WalletShell.test.tsx`

Coverage:

- Dashboard counts.
- Document status calculations.
- Category filtering.
- Search behavior.
- Sorting path.
- Empty states.
- Encrypted-record representation.
- Malformed records excluded from document lists and counted.
- Read-only provider path performs no storage writes.
- Mobile/category navigation accessibility.
- No edit/delete controls rendered.

## Known Limitations

- Encrypted records are visible only as locked placeholders; Phase 3 does not implement PIN, key derivation, or decryption.
- No document create/edit/delete is available.
- No profile writes are available.
- No backup import/export writes are available.
- No automatic migration is available.
- Safe database discovery can report `unknown` on browsers without `indexedDB.databases()`.
- PDF preview depends on the browser's native data-URL PDF support; a clear fallback message is shown.
- The UI is not yet wired to a service worker or production deployment path.

## Criteria Before Write Functionality

Write functionality must not be introduced until all of these are true:

1. Storage write adapters have tests proving they preserve the root PWA record shape.
2. Existing root PWA backups import successfully after React-created records are exported.
3. React-created records appear correctly in the root PWA.
4. Root PWA-created records appear correctly in React after reload.
5. Legacy single-file records remain readable after any write path is added.
6. Encrypted vault behavior is covered by compatibility tests before any encrypted write path exists.
7. Malformed records are never silently overwritten or repaired without explicit user action.
8. A rollback plan exists before replacing any production root files.
9. Service-worker cache cutover is designed and tested separately.

## Verification

- `npm test`: 28 tests passed.
- `npm run build`: passed.
- Vite dev server smoke check: `http://127.0.0.1:5173/` returned HTTP 200.

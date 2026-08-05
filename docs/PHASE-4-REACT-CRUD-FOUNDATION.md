# Phase 4 - React CRUD Foundation

## Scope

Phase 4 creates the first write-capable React wallet surface while keeping the legacy root PWA as the production baseline.

The React wallet writes only to the new IndexedDB database:

- Database: `BlueWalletReactDB`
- Version: `1`
- Object stores: `documents`, `profile`, `settings`, `attachments`

The React wallet must never write to `SeafarerWalletDB`. The migration wizard remains read-only and explanatory.

## Files Created

- `next-app/src/features/react-wallet/reactWalletTypes.ts`
- `next-app/src/features/react-wallet/reactWalletValidation.ts`
- `next-app/src/features/react-wallet/reactWalletDatabase.ts`
- `next-app/src/features/react-wallet/reactWalletSelectors.ts`
- `next-app/src/features/react-wallet/ReactWalletProvider.tsx`
- `next-app/src/features/react-wallet/ReactWalletShell.tsx`
- `next-app/src/features/react-wallet/__tests__/reactWalletDatabase.test.ts`
- `docs/PHASE-4-REACT-CRUD-FOUNDATION.md`

## Files Modified

- `next-app/package.json`
- `next-app/package-lock.json`
- `next-app/src/App.css`
- `next-app/src/app/WalletShell.tsx`
- `next-app/src/app/__tests__/WalletShell.test.tsx`
- `next-app/src/test/setup.ts`

No root production PWA files were modified.

## BlueWalletReactDB Schema

### `documents`

Key path: `id`

Fields:

- `id: string`
- `type: LegacyDocumentType`
- `title: string`
- `number: string`
- `authority: string`
- `issueDate: string | null`
- `expiryDate: string | null`
- `noExpiry: boolean`
- `notes: string`
- `flagNotes: string`
- `tags: string[]`
- `favourite: boolean`
- `attachmentIds: string[]`
- `createdAt: string`
- `updatedAt: string`
- `deletedAt: string | null`

### `attachments`

Key path: `id`

Fields:

- `id: string`
- `documentId: string`
- `name: string`
- `type: string`
- `size: number`
- `data: string`
- `createdAt: string`

Attachments are stored as browser data URLs in Phase 4. This supports images and PDFs without requiring a backend.

### `profile`

Key path: `key`

Fields:

- `key: "owner"`
- `name: string`
- `rank: string`
- `nationality: string`

The store is created for the Phase 4 schema, but the UI does not yet write profile records.

### `settings`

Key path: `key`

Fields:

- `key: "wallet"`
- `defaultSort: ReactWalletSortKey`
- `autoSave: boolean`
- `updatedAt: string`

The store is created for the Phase 4 schema. Draft auto-save is currently UI-local and does not write settings or drafts.

## Features Implemented

- Create document
- Edit document
- View document details
- Soft delete document
- Undo delete
- Upload image attachments
- Upload PDF attachments
- Multi-file attachments
- Category assignment
- Tags
- Favourites
- Search across title, number, authority, notes, flag-state notes, and tags
- Sorting by expiry, name, category, and recently updated
- Filtering by status, favourites, and deleted items
- Image thumbnails
- PDF preview with browser fallback
- Expiry status badges
- Backup export for `BlueWalletReactDB`
- Backup restore into `BlueWalletReactDB`
- Validation for required title and expiry/no-expiry rules
- Migration Wizard page for legacy detection, statistics, estimates, and risk explanation

## Explicit Non-Goals

Phase 4 does not implement:

- Encryption
- PIN
- Legacy migration
- OCR
- Camera capture
- Face ID or biometric flows
- Service-worker cutover
- Writes to `SeafarerWalletDB`

## Migration Wizard Behavior

The Migration Wizard uses the Phase 2/3 read-only legacy snapshot. It displays:

- Legacy database status
- Readable legacy records
- Encrypted legacy records
- Malformed legacy records
- Estimated records requiring review
- Risks that must be resolved before any future migration

There is no migration execution button and no automatic import path from legacy storage.

## Backup Format

React backups use:

- `app: "BlueWallet-Pro React"`
- `version: 1`
- `exportedAt: string`
- `documents: ReactWalletDocument[]`
- `attachments: ReactWalletAttachment[]`
- `profile: ReactWalletProfile | null`
- `settings: ReactWalletSettings | null`

Restore rejects payloads whose `app` or `version` do not match the React wallet backup contract.

## Tests Added

React Testing Library coverage:

- React database dashboard renders
- Migration wizard renders without migration execution controls
- Create document
- View document
- Edit document
- Soft delete
- Undo delete
- Image and PDF uploads
- Multi-file attachment display
- Category filtering
- Search
- Expiring status filter
- No PIN, encryption, OCR, camera, or migration execution controls

IndexedDB/unit coverage:

- `BlueWalletReactDB` opens at version 1
- Required object stores are created
- Legacy database name is not used
- Create, update, soft delete, and undo delete
- Multi-file image/PDF attachments
- Backup export/import
- Required field validation

## Validation Results

Commands run:

- `npm test`
- `npm run build`

Results:

- Test files: 4 passed
- Tests: 31 passed
- Build: passed

## Remaining Risks

- Attachments are stored as data URLs in IndexedDB, which is simple but may need quota handling and file-size limits before broad production use.
- Backup import trusts the React v1 shape after the top-level app/version check; deeper schema validation should be added before accepting user-supplied backups in production.
- Draft auto-save is currently visible as a UI state but does not persist drafts across reloads.
- Encryption, PIN, and biometric behavior remain intentionally absent and must be designed before sensitive production data is moved into React.
- No legacy migration can be introduced until encrypted and malformed legacy cases have explicit handling and user-confirmed recovery flows.

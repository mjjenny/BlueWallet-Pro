# Phase 2: Legacy Data Contracts and Compatibility Tests

## Scope

The root PWA remains the production baseline. Phase 2 documents the persisted data formats used by the active root `index.html` and adds read-only TypeScript contracts/tests under `next-app/src/legacy`.

No production root files were modified.

## IndexedDB Schema

Database:

- Name: `SeafarerWalletDB`
- Version: `2`

Object stores:

- `documents`
  - Key path: `id`
  - Stores plaintext document records or encrypted document records.
- `profile`
  - Key path: `key`
  - Current profile photo row uses key `photo`.

Important compatibility note: opening IndexedDB with `indexedDB.open(name)` can create a missing database. The React migration adapter therefore uses `indexedDB.databases()` for detection when available and reports `unknown` when discovery is unavailable rather than creating legacy state by accident.

## Document Record Schemas

### Plaintext Document

Current React contract: `LegacyPlaintextDocument`.

Fields observed in the active PWA:

- `id: string`
- `type: "passport" | "cdc" | "coc" | "visa" | "certificate" | "medical" | "yellowfever" | "contract" | "other"`
- `title: string`
- `number?: string`
- `authority?: string`
- `issueDate?: string | null`
- `expiryDate?: string | null`
- `noExpiry?: boolean`
- `notes?: string`
- `flagNotes?: string`
- `tags?: string[] | string`
- `favourite?: boolean`
- `files?: { data: string; name: string; type: string }[]`
- `updatedAt?: string`
- legacy single-file fields: `fileData?: string`, `fileName?: string`, `fileType?: string`

Normalization behavior:

- Legacy single-file records are converted in memory to `files[]`.
- Comma-separated string `tags` are converted to string arrays.
- Unknown document types are reported and normalized to `other`.
- `noExpiry: true` keeps `expiryDate: null`.
- Malformed records without a usable `id` are rejected for migration.

### Encrypted Document

Current React contract: `LegacyEncryptedDocumentRecord`.

Fields:

- `_enc: number`
- `id: string`
- `iv: string`
- `data: string`

Detection rule mirrors the root PWA:

- `_enc`, `iv`, and `data` are present.
- `title` and `files` are absent.
- The adapter identifies encrypted rows but does not decrypt them.

Encryption constants found:

- Encryption version: `1`
- Algorithm: AES-GCM
- IV length: 12 random bytes
- Key derivation: PBKDF2 SHA-256
- Iterations: `210000`
- Salt key: `bwEncSalt`
- Enabled flag: `bwEncEnabled`

## Profile Record Schema

Object store: `profile`

Plaintext row:

- `key: "photo"`
- `data: string | null`

Encrypted row:

- `key: "photo"`
- `_enc: number`
- `iv: string`
- `data: string`

Safari/localStorage fallback key:

- `bwFallbackProfile`

The profile payload is currently a data URL string for the profile photo.

## localStorage Keys

Fallback storage:

- `bwFallbackDocuments`
- `bwFallbackProfile`

Metadata:

- `bwSeafarer`
- `bwPacks`
- `bwSeatime`
- `bwVaccines`
- `bwReminders`
- `bwIdleMins`

PIN metadata:

- `bwPinHash`
- `bwPinHashV`
- `bwPinRequired`
- `bwPinSalt`
- `bwPinFails`
- `bwPinLockUntil`

Encryption metadata:

- `bwEncSalt`
- `bwEncEnabled`

Biometric metadata:

- `bwBio`
- `bwWebAuthnId`

App settings:

- `bwAppMode`
- `bwTheme`
- `greenVaultTheme`
- `bwIosBannerDismiss`
- `bwOnboardDone`

## sessionStorage Keys

- `bwUnlocked`

This is session-only unlock state. It must never be interpreted as sufficient to decrypt an encrypted vault without a PIN-derived key.

## Metadata Schemas

### Seafarer

Stored in `bwSeafarer`.

- `name?: string`
- `rank?: string`
- `nationality?: string`
- `cdc?: string`
- `passport?: string`
- `nok?: string`
- `nokPhone?: string`

### Packs

Stored in `bwPacks`.

- `id: string`
- `name: string`
- `docIds: string[]`

### Sea-Time

Stored in `bwSeatime`.

- `id: string`
- `vessel: string`
- `rank?: string`
- `signOn?: string`
- `signOff?: string`
- `notes?: string`

The active UI currently writes `id`, `vessel`, `rank`, `signOn`, and `signOff`.

### Vaccines

Stored in `bwVaccines`.

- `id: string`
- `name: string`
- `dose?: string`
- `date?: string`
- `expiry?: string`
- `notes?: string`

The active UI currently writes `id`, `name`, `dose`, `date`, and `expiry`.

### Reminders

Stored in `bwReminders`.

- `primary: number`, default `183`
- `secondary: number`, default `90`
- `urgent: number`, default `30`
- `critical: number`, default `7`

## Backup JSON Compatibility Matrix

| Backup shape | Exported by active root PWA | Root import behavior | React Phase 2 parser |
| --- | --- | --- | --- |
| `{ version: 4, documents: [...], exportedAt, profile, seafarer, packs, seatime, vaccines, reminders, settings }` | Yes | Supported | Supported |
| `{ documents: [...] }` with no version | Not current export | Accepted by root import if `documents` is non-empty | Accepted with warning |
| `{ version: 3, documents: [...] }` or other unknown version | Not current export | Accepted by root import if `documents` is non-empty | Accepted with warning |
| `{ version: 4, documents: [] }` | No useful export | Rejected by root import | Rejected |
| `{ docs: [...] }` from older compact scripts | Not accepted by active root import | Rejected because `documents` is missing | Rejected |
| Invalid JSON | No | Rejected | Rejected |

The active root app intentionally excludes PIN hashes and WebAuthn credential metadata from backups.

## Read-Only Adapters Added

Files:

- `next-app/src/legacy/legacyTypes.ts`
- `next-app/src/legacy/legacyStorageKeys.ts`
- `next-app/src/legacy/legacyDatabase.ts`
- `next-app/src/legacy/legacyBackup.ts`
- `next-app/src/legacy/legacyCryptoRecords.ts`

Capabilities:

- Detect whether the legacy IndexedDB can be discovered without opening/creating it.
- Read `documents` object store with a `readonly` transaction.
- Parse plaintext document records.
- Identify encrypted document records without decrypting.
- Read the `profile` object store with a `readonly` transaction.
- Read localStorage/sessionStorage metadata without writing.
- Parse and validate backup JSON.
- Report malformed rows and unsupported/unknown versions as structured compatibility issues.

## Tests Added

Fixtures:

- `next-app/src/legacy/__fixtures__/legacyRecordFixtures.ts`

Test file:

- `next-app/src/legacy/__tests__/legacyContracts.test.ts`

Coverage:

- Plaintext document parsing.
- Encrypted record detection.
- Legacy single-file normalization.
- Multi-file document normalization.
- No-expiry document handling.
- Malformed record reporting.
- Version 4 backup parsing.
- Unversioned backup warning/compatibility.
- Unknown backup version warning/compatibility.
- localStorage/sessionStorage key mapping.
- Metadata reads do not write to storage.
- Fallback document reads do not mutate storage.
- IndexedDB detection does not call `open()` when safe discovery is unavailable.

## Migration Risks

- Encrypted records cannot be migrated while locked. React must show counts/status for encrypted rows only after a user unlock flow exists.
- Biometric presence cannot derive the AES key. Existing behavior still requires PIN for encrypted vault decryption.
- `indexedDB.databases()` is not universally available. Safe detection may report `unknown`; the app should ask for explicit user action before opening unknown IndexedDB state.
- The root import path is permissive about backup versions. React should preserve import compatibility but make warnings visible.
- Existing localStorage JSON may be malformed because values are manually written by browser APIs and older builds.
- Root startup does less sanitization than backup import. React should avoid silently changing records during read-only migration.
- Legacy `fileData/fileName/fileType` records must remain readable until all documents have been migrated to `files[]`.
- Object URLs/data URLs can be large; test fixtures intentionally use small fake payloads.

## Unsupported Cases

- Decryption of `_enc` records is intentionally unsupported in Phase 2.
- Writing to the legacy database is intentionally unsupported in Phase 2.
- CRUD workflows are intentionally unsupported in Phase 2.
- Older compact `app.js` backups using `docs` instead of `documents` are not supported by the active root PWA import and are not accepted by the Phase 2 parser.
- Empty backups are rejected to match root import behavior.

## Proposed Read-Only Migration Sequence

1. Keep root PWA as production.
2. Use the Phase 2 contracts to inventory local legacy state.
3. Display a read-only React wallet shell using parsed plaintext records only.
4. Show encrypted records as locked placeholders until Phase 5 security migration exists.
5. Compare React read-only counts/statuses with the root PWA.
6. Add write adapters only after storage compatibility tests cover documents, backups, settings, and encryption edge cases.
7. Delay production cutover until backup export/import and encrypted vault compatibility both pass.

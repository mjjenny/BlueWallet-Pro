# Phase 6 Security Boundary

Phase 6 adds a React-owned encrypted vault around `BlueWalletReactDB`. The production PWA files at repository root remain the production baseline and are not modified by this phase. The legacy `SeafarerWalletDB` adapter remains read-only; Phase 6 does not execute legacy migration.

## Scope

- React-owned documents, attachments, profile, and settings are encrypted before they are stored.
- The React vault lives in `BlueWalletReactDB` version 2.
- Security metadata lives in the React-only `security` object store.
- Legacy records are still assessed through the existing read-only migration wizard.
- Camera, OCR, maritime workflows, and legacy migration execution are deferred.

## Architecture

`BlueWalletReactDB` object stores:

- `documents`: encrypted document rows keyed by `id`.
- `attachments`: encrypted attachment rows keyed by `id`.
- `profile`: encrypted profile rows keyed by `key`.
- `settings`: encrypted settings rows keyed by `key`.
- `security`: plaintext cryptographic metadata keyed by `key`.

The security store contains only the vault record:

- PBKDF2 parameters: algorithm, SHA-256 hash, salt, and iteration count.
- Wrapped random vault data key.
- PIN verifier encrypted by the PIN-derived key.
- Rotation counter and timestamps.

The document/profile/settings/attachment stores contain versioned AES-GCM envelopes. Plaintext fields such as title, document number, attachment name, profile name, and notes are not written as top-level IndexedDB fields.

## Cryptography

- PIN format: 4 to 8 digits.
- PIN key derivation: PBKDF2-SHA-256 with a per-vault random salt.
- Vault data key: random 256-bit AES-GCM key.
- Row encryption: AES-256-GCM with a random 96-bit IV per encrypted row.
- Envelope version: `1`.
- Additional authenticated data binds each row to `BlueWalletReactDB`, row kind, row identity, and envelope version.
- Backups export encrypted rows plus the vault record; they do not export plaintext data or the unwrapped data key.

## Session Locking

- The React app starts in setup, locked, loading, ready, or error state.
- Decrypted data is held only in React state while the session is unlocked.
- Sessions auto-lock after five minutes.
- The vault locks on page backgrounding, page hide, or window blur.
- Manual lock clears decrypted documents and undo state.
- Failed PIN attempts do not mutate stored rows.
- After repeated incorrect PIN attempts, unlock is temporarily throttled in memory.

## PIN Management

- Setup creates the vault record and encrypts any existing React-owned plaintext rows from earlier React-only phases.
- Change PIN verifies the current PIN, keeps the same data key, and re-wraps it under a new PBKDF2-derived key.
- Remove PIN is destructive by design: it erases React-owned vault data instead of storing an unprotected data key.
- Key rotation decrypts React-owned rows with the current data key, creates a new random data key, re-encrypts rows, re-wraps the new key, and increments the rotation counter.

## Biometric and WebAuthn Boundary

Phase 6 checks whether WebAuthn presence APIs are available and can request a presence check when supported. WebAuthn does not replace the PIN and does not derive or unwrap the vault data key. PIN fallback remains required.

## Recovery-Safe Failure Handling

- Wrong PIN unlock attempts fail closed and leave encrypted rows unchanged.
- Backup restore verifies the supplied backup PIN and decryptability before writing replacement rows.
- Unsupported backup versions are rejected.
- Unsupported crypto envelopes are rejected.
- Legacy `SeafarerWalletDB` data is never opened for write by the Phase 6 code path.

## Threat Model

Mitigated:

- Casual local inspection of `BlueWalletReactDB` rows.
- Plaintext disclosure through IndexedDB records or JSON backups.
- Accidental React writes into the production legacy database.
- Data exposure after app backgrounding or idle sessions.
- Wrong-PIN restore or unlock attempts corrupting stored data.

Not fully mitigated:

- A compromised browser, malicious extension, or active XSS while the vault is unlocked.
- Device-level malware or memory inspection.
- Weak user PIN choices within the allowed 4 to 8 digit range.
- Loss of PIN. There is no recovery key in Phase 6.
- Full hardware-backed biometric key binding. WebAuthn is presence-only in this phase.

## Test Coverage

Automated coverage includes:

- React database version and store boundaries.
- PIN length validation.
- Encrypted CRUD and soft-delete flows.
- Multi-file attachment encryption.
- Raw IndexedDB rows do not contain document or attachment plaintext.
- Wrong PIN failure leaves rows unchanged.
- PIN change rejects the old PIN and accepts the new PIN.
- Data-key rotation changes encrypted row ciphertext while preserving readable data.
- Encrypted backup export and PIN-verified restore.
- Destructive PIN removal clears React-owned vault stores.
- React UI setup, lock, unlock, CRUD, attachment, filtering, and no camera/OCR/migration execution controls.

## Protected Surfaces

Protected root production PWA files remain out of scope for Phase 6:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`
- `offline.html`
- icon assets and root release notes

Protected legacy database:

- `SeafarerWalletDB` remains read-only.
- No Phase 6 code writes to `SeafarerWalletDB`.
- No legacy migration execution is implemented.

# Phase 9 Maritime Suite

Phase 9 adds a maritime readiness layer to the React wallet. It builds on the Phase 6 encrypted vault and Phase 7-8 scanner workflow without touching the production root PWA or writing to `SeafarerWalletDB`.

## Scope

- Ready-to-join dashboard.
- STCW matrix.
- Joining checklist signals.
- Document packs.
- Vaccination tracker.
- Sea-service log calculator.
- Medical, travel, contract, and certification readiness grouping.

## Architecture

Maritime modules live under `next-app/src/features/maritime`:

- `maritimeRules.ts`: requirement matching, readiness scoring, pack summaries, vaccination filtering, and sea-service day calculation.
- `MaritimeToolkit.tsx`: operational UI rendered after the React vault is unlocked.

The toolkit derives its state from decrypted React-owned documents in memory. It does not create new legacy stores and does not execute migration.

## Readiness Model

Critical requirements have double weight:

- Passport.
- CDC / Seaman Book.
- COC / License.
- STCW Basic Safety.
- Medical Fitness.
- Contract.

Non-critical but tracked requirements:

- Yellow Fever.
- Visa.

Ready documents count fully. Expiring documents count at half weight. Missing and expired documents count as zero.

## Packs

The toolkit currently summarizes:

- Joining Pack: passport, CDC, COC, STCW Basic Safety, medical, contract.
- Medical Pack: medical and Yellow Fever.
- Travel Pack: passport, visa, contract.

## Security Boundary

- Maritime logic receives documents only after the Phase 6 vault is unlocked.
- No maritime code opens IndexedDB directly.
- No maritime code writes `SeafarerWalletDB`.
- No root production PWA files are modified.

## Deferred

- Persisted sea-service entries.
- Company-specific pack templates.
- Flag-state configurable requirement sets.
- Maritime timeline notifications.
- Exportable joining packs.
- Production migration execution.

## Test Coverage

Automated coverage includes:

- Ready-to-join scoring.
- STCW/identity/medical requirement status.
- Document pack readiness.
- Vaccination filtering.
- Inclusive sea-service day calculation.
- Shell rendering after vault unlock.

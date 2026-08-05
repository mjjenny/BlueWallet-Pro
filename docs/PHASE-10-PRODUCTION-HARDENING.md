# Phase 10 Production Hardening

Phase 10 prepares the React wallet for production review without replacing the root production PWA and without executing legacy migration. The root PWA remains protected, and `SeafarerWalletDB` remains read-only.

## Scope

- Recoverable React error boundary.
- Accessibility landmark and keyboard skip link.
- Large-wallet render guard.
- Safer encrypted backup restore failure handling.
- Large dataset selector tests.
- Production hardening documentation.

## Runtime Hardening

- `AppErrorBoundary` catches render failures and shows a recovery screen instead of leaving a blank app.
- The recovery screen tells the user stored vault data was not changed.
- Backup restore catches unsupported JSON, wrong PIN, or invalid payload errors and reports them in-app.
- The wallet has a stable `main` target and `#document-workspace` anchor for keyboard navigation.

## Performance Hardening

Large wallets can have thousands of documents and attachments. The React document list now keeps filtered totals intact but renders the first 100 matching cards at a time. Users are prompted to narrow the result set with search, category, status, or sort controls when more matches exist.

This keeps the current app responsive without introducing pagination state before production cutover.

## Accessibility Review

Added:

- Skip link to document workspace.
- Stable `main` landmark.
- Recovery screen with `role="alert"`.
- Existing modal labels, button labels, and form labels remain covered by UI tests.

Remaining manual checks:

- Screen reader pass on Safari, Chrome, and Edge.
- Keyboard-only pass on mobile hardware keyboard and desktop.
- Color contrast pass on production device settings.

## Security Review

Retained from earlier phases:

- React-owned data is encrypted before IndexedDB writes.
- Decrypted documents exist only in unlocked React state.
- Scanner and maritime modules consume decrypted in-memory documents only after unlock.
- No root PWA files are modified.
- No code path writes to `SeafarerWalletDB`.

Remaining risks:

- XSS or compromised browser while unlocked.
- Weak user PIN choices.
- Full production migration/cutover is not executed in this phase.

## Verification

Required before merge:

- `npm test`
- `npm run build`
- `npm run lint`
- Preview smoke test
- Root PWA diff check
- `SeafarerWalletDB` write check

## Deferred

- Production cutover from root PWA to React.
- Service worker cache migration.
- Persisted sea-service entries.
- Full image-to-text OCR engine.
- End-to-end browser/device matrix beyond automated unit and component tests.

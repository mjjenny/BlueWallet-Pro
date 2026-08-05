# BlueWallet-Pro Phase 1 React Migration Plan

## 1. Architecture Review

BlueWallet-Pro is currently a static offline-first PWA deployed from repository root files. The production user experience is contained primarily in `index.html`, which includes the document markup, all styling, and the application JavaScript in a single file. The root `manifest.json`, `service-worker.js`, icon files, and `offline.html` provide the installable PWA shell.

The app is client-only. There is no backend, build system, package manager metadata, test runner, or framework in the root application. All data is stored locally in the browser.

Current runtime responsibilities:

- `index.html`: production app shell, UI structure, CSS, JavaScript, feature workflows, and startup.
- `service-worker.js`: app-shell caching, navigation fallback, cache versioning, and update handling.
- `manifest.json`: install metadata, app identity, icons, display mode, theme colors, and scope.
- `offline.html`: fallback page.
- `app.js` and `styles.css`: compact foundation implementation not referenced by current `index.html`; treat as historical or alternate build until proven otherwise.
- release notes and upload instructions: manual release history and deployment notes.

Primary feature areas identified in `index.html`:

- Offline document wallet with category filters.
- IndexedDB document storage with localStorage fallback for constrained Safari contexts.
- Document add, edit, view, delete, download, print, backup, and import.
- Multiple file attachments, camera capture, image optimization, and OCR integration.
- PIN lock, PIN hashing, AES-GCM encryption, session unlock, idle lock, and WebAuthn biometric presence checks.
- Seafarer profile, profile photo, document counts, status summaries, and reminder windows.
- Lite and Full modes.
- Theme switching.
- Joining checklist, packs, timeline, STCW matrix, sea-time log, vaccine log, calendar export, bulk selection, favorites, quick share, and summary export.
- PWA install prompt, service-worker update prompt, online/offline toasts, and onboarding.

Key architectural characteristic: state, persistence, rendering, event binding, validation, security workflows, and UI concerns are tightly coupled in one global script.

## 2. Technical Debt Report

### High priority

- Monolithic `index.html`: app markup, CSS, business logic, storage logic, security logic, and rendering are bundled together, making isolated feature changes risky.
- Global mutable state: variables such as `documents`, `cat`, `pendingFiles`, `vaultKey`, `vaultLocked`, `seafarer`, `packs`, `seatime`, and `vaccines` are shared across many workflows.
- Manual DOM rendering and event binding: `innerHTML` rendering plus repeated `getElementById` event setup increases regression risk and makes component migration harder.
- No automated tests: storage migrations, encryption, PIN lockout, backup/import, and expiry calculations are unprotected.
- Security-critical logic mixed with UI code: PIN hashing, key derivation, AES-GCM encryption, WebAuthn, and lock state should be isolated and covered by tests.
- Persistence shape is implicit: IndexedDB schemas, localStorage keys, backup JSON versions, and legacy plaintext/encrypted rows need explicit TypeScript types and migration tests.

### Medium priority

- Root app has no build or dependency manifest, so production changes are manual and harder to reproduce.
- Inline CSS and inline styles make theming and component reuse harder.
- `app.js` and `styles.css` appear disconnected from the active `index.html`, creating ambiguity about the source of truth.
- Feature detection and Safari fallbacks are embedded throughout startup and storage logic instead of being centralized.
- OCR CDN loading and OpenCV/Tesseract orchestration are tied to form DOM state.
- Manual release/upload instructions suggest deployment is not yet automated.
- Error handling is mostly alert/prompt based, which limits testability and consistent UX.

### Lower priority

- Naming still contains some legacy references such as `greenVaultTheme`.
- Some app labels and metadata reference different version names.
- Emoji/text buttons are useful for the current single-file app but should become accessible icon/button components.
- Current CSS has broad global selectors and page-level styling that should be normalized during component migration.

## 3. Folder Restructuring Plan

The existing root PWA must remain untouched during incremental migration. The React application now lives beside it:

```text
BlueWallet-Pro/
  index.html                  # existing production PWA, unchanged
  service-worker.js           # existing PWA service worker, unchanged
  manifest.json               # existing PWA manifest, unchanged
  offline.html                # existing offline fallback, unchanged
  app.js                      # existing historical/alternate script, unchanged
  styles.css                  # existing historical/alternate stylesheet, unchanged
  docs/
    PHASE-1-REACT-MIGRATION.md
  next-app/
    index.html
    package.json
    package-lock.json
    vite.config.ts
    tsconfig*.json
    public/
    src/
      main.tsx
      App.tsx
      App.css
      index.css
      assets/
```

Recommended target structure inside `next-app/src` as migration begins:

```text
src/
  app/
    App.tsx
    providers/
  components/
    layout/
    modals/
    documents/
    settings/
    profile/
    tools/
    shared/
  features/
    documents/
      components/
      hooks/
      model.ts
      storage.ts
      documentService.ts
    security/
      crypto.ts
      pin.ts
      webauthn.ts
      lockState.ts
    profile/
    reminders/
    packs/
    seatime/
    vaccines/
    ocr/
    pwa/
  lib/
    indexedDb.ts
    localStorage.ts
    date.ts
    file.ts
    ids.ts
  styles/
    tokens.css
    global.css
  test/
    fixtures/
```

Guiding rule: move behavior by feature boundary, not by copying the whole page at once.

## 4. Migration Strategy

### Preserve the working app

- Keep root `index.html`, `service-worker.js`, `manifest.json`, icons, and fallback files unchanged until the React app reaches functional parity for a chosen slice.
- Do not delete the root app or replace it with Vite output during migration.
- Treat `index.html` as the production baseline and source of truth for behavior.

### Establish a compatibility contract

- Document current storage keys, IndexedDB database name, object stores, backup schema versions, and localStorage settings.
- Add TypeScript models that match the existing data exactly before changing persistence.
- Build migration tests around real backup examples and representative IndexedDB records.

### Extract pure logic first

Prioritize logic that can be moved without changing UI:

- Date and expiry calculations.
- Reminder-window status classification.
- Document normalization and sanitization.
- Backup import/export schema handling.
- File metadata normalization.
- Category labels, colors, and icons.
- PIN validation and hashing adapters.

### Build React in parallel

- Keep the Vite app independent in `next-app/`.
- Initially use mocked fixtures or imported sample data to validate UI components.
- Add a compatibility storage adapter that reads and writes the existing browser data format.
- Migrate one user-visible workflow at a time behind a route or development-only entry point.

### Verify each slice

Each migrated feature should pass:

- TypeScript build.
- Unit tests for extracted logic.
- Browser smoke test for the user workflow.
- Manual comparison with the root `index.html` behavior.
- Backup/import compatibility check when storage is touched.

## 5. React Migration Roadmap

### Phase 1: Foundation

- Create `react-migration` branch.
- Create `next-app/` with React, TypeScript, and Vite.
- Keep current root app untouched.
- Record architecture review, debt report, restructuring plan, and migration roadmap.
- Verify the Vite scaffold builds.

Status: complete.

### Phase 2: Contracts and Safety Net

- Add TypeScript domain models for documents, files, profile, reminders, packs, sea-time entries, vaccines, settings, and backup payloads.
- Add unit tests for `daysUntil`, status classification, `normalizeDoc`, `sanitizeDoc`, backup parsing, and reminder windows.
- Create fixtures from representative v0.2/v0.2.1 backup shapes.
- Add lint/test scripts and CI-ready commands inside `next-app`.

Exit criteria:

- Domain models represent current persisted data.
- Existing backup payloads can be parsed without data loss.
- Core pure logic has test coverage.

### Phase 3: Read-Only Wallet Shell

- Build React layout for header, profile strip, category tabs, stats, search/filter/sort controls, document list, empty state, and mode/theme controls.
- Read documents through a compatibility adapter from the existing IndexedDB/localStorage shape.
- Do not write or mutate production data in this phase.

Exit criteria:

- React app can display existing wallet data read-only.
- Counts, filters, sorting, and status bands match the root PWA.

### Phase 4: Document CRUD

- Migrate add/edit/delete document flows.
- Migrate multi-file selection, camera input, PDF/image attachment storage, file chips, and previews.
- Preserve existing data shape and attachment format.
- Keep backup export from the root app available until React export is verified.

Exit criteria:

- Documents created in React appear correctly in the root PWA.
- Documents created in the root PWA appear correctly in React.
- Edit/delete behavior matches current app.

### Phase 5: Security Boundary

- Isolate PIN hashing, AES-GCM encryption, key derivation, lock state, idle lock, and unlock behavior.
- Add tests around legacy PIN hash compatibility and encrypted/plaintext row handling.
- Migrate lock screen and settings PIN controls only after compatibility tests pass.

Exit criteria:

- Existing encrypted vaults unlock in React with the same PIN.
- React writes records readable by the root PWA.
- PIN removal and re-key flows preserve data.

### Phase 6: Backup, Import, and PWA

- Migrate full backup export/import and summary export.
- Migrate service-worker update UX and install prompt handling.
- Decide whether React eventually gets its own service worker or adopts the existing one after production cutover.

Exit criteria:

- Backup from React imports into root PWA.
- Backup from root PWA imports into React.
- Offline behavior is tested on localhost and HTTPS.

### Phase 7: Full-Mode Tools

- Migrate checklist, packs, timeline, STCW matrix, sea-time log, vaccines, calendar export, bulk select, favorites, and quick share.
- Move each tool as an isolated feature module with its own tests where logic exists.

Exit criteria:

- Full mode has feature parity.
- Lite mode hides/shows the same capabilities as the current app.

### Phase 8: OCR and Advanced Device APIs

- Move Tesseract/OpenCV dynamic loading behind an OCR service.
- Migrate OCR panel, suggestions, MRZ parsing, image enhancement, and apply-to-fields flow.
- Migrate WebAuthn UI once PIN/encryption migration is stable.

Exit criteria:

- OCR works in secure contexts.
- Failure states match or improve current user guidance.
- Device/browser constraints are handled centrally.

### Phase 9: Cutover Preparation

- Run a full parity checklist against root `index.html`.
- Add migration notes for service worker cache versioning.
- Decide deployment path:
  - keep root PWA as production and host React separately during beta, or
  - replace root entry only after explicit approval and parity signoff.
- Archive historical single-file implementation only after a tagged release and explicit approval.

Exit criteria:

- React app is functionally equivalent or intentionally improved.
- Storage compatibility is verified.
- Offline install and update behavior are verified.
- Production cutover has an explicit rollback plan.

## Immediate Next Engineering Work

No production feature code should be written until Phase 2 starts. The next safe changes are:

1. Add domain TypeScript interfaces in `next-app/src/features/*/model.ts`.
2. Add a test runner such as Vitest.
3. Add fixtures based on current backup/export shapes.
4. Extract pure functions from `index.html` by behavior, not by wholesale copy.
5. Build compatibility tests before any React write path touches browser storage.

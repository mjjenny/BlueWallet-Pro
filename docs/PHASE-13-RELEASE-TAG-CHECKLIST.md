# Phase 13 - Release Tag Checklist

## Intended Tag

Proposed tag after manual sign-off:

- `v1.0.0`

Do not create this tag until every required manual QA evidence field is complete or formally waived.

## Tagging Prerequisites

| Requirement | Status | Notes |
| --- | --- | --- |
| Release branch is clean | Pending final check | Branch is `feature/phase13-manual-qa-release`; final check required after commit. |
| Phase 13 commit exists | Pending final commit | Commit message: `Phase 13 manual QA release signoff`. |
| `npm test` passes | Passed | 11 files, 58 tests passed. |
| `npm run build` passes | Passed | `react-app/` bundle regenerated successfully. |
| `npm run lint` passes | Passed with warnings | Existing fast-refresh warnings reviewed. |
| Root entry launches React | Passed | `index.html` points to `./react-app/index.html`. |
| Manifest starts at React app | Passed | `./react-app/index.html?v=1.0`. |
| Service worker uses React v1.0 cache | Passed | `blue-wallet-react-v1.0.0`. |
| Rollback file preserved | Passed | `legacy-root-pwa.html` exists. |
| Manual QA evidence complete | Blocked | Evidence has not been supplied. |
| Product owner sign-off | Blocked | Awaiting completed manual QA. |

## Tagging Procedure

After manual evidence is complete:

1. Confirm branch is clean with `git status --short --branch`.
2. Confirm final commit hash with `git log -1 --oneline`.
3. Confirm no protected rollback/root files were accidentally changed.
4. Confirm no `SeafarerWalletDB` write path was introduced.
5. Create annotated tag:

```bash
git tag -a v1.0.0 -m "BlueWallet-Pro v1.0.0"
```

6. Verify tag:

```bash
git show v1.0.0 --stat
```

7. Push release branch and tag only after approval:

```bash
git push origin feature/phase13-manual-qa-release
git push origin v1.0.0
```

## Tag Status

Current status: blocked.

The tag was not created because manual QA evidence is not complete.

# BlueWallet Pro Hosted Site

This project hosts the stable BlueWallet Pro app outside GitHub Pages.

Production URL (primary, auto-deploys on push to `feature/desktop-grok-redesign`):

https://bluewallet-pro.cl76380.workers.dev/legacy-root-pwa

A legacy deployment is still live but requires a manual Codex handoff to update:

https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full deploy workflow and gotchas.

The app files in `public/` are copied from the stable app source. The root route
redirects to `legacy-root-pwa.html`.

GitHub Pages is retired. Do not use `gh-pages` or `mjjenny.github.io` as the
production path unless Jenny explicitly re-approves that hosting route.

## Branches, backups & releases

| Ref | Purpose |
|---|---|
| `feature/desktop-grok-redesign` | Live deploy source — Cloudflare builds and deploys this branch on every push. Treat as production. |
| `main` | Mirrors the production code (kept in sync via fast-forward/merge from the deploy branch). Not itself a deploy source. |
| `backup/pre-cleanup-stable` | Snapshot of the working state immediately before the v1.0.0 repository cleanup (dead scaffolding removal, dependency pruning). Rollback point if the cleanup ever needs reverting. |
| `archive/original-main` | The original `main` history (the old flat static-file dump, unrelated to the current codebase) preserved after `main` was force-updated to match production. Kept so that history isn't lost, not for active use. |
| `v1.0.0` (tag) | Annotated tag on the production release commit. Fastest rollback point: `git checkout v1.0.0`. |

Tagging a new release after future changes:

```bash
git tag -a vX.Y.Z -m "vX.Y.Z -- <summary of what shipped>"
git push origin vX.Y.Z
```

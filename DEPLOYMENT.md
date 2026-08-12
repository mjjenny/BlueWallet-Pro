# DEPLOYMENT

How to get code from any tool (Claude Code, etc.) into production at
`https://bluewallet-pro-stable.cl76380.chatgpt.site/`. Confirmed with Codex
directly on 2026-08-12 — read this before trying to improvise a different path.

## The constraint

Production is served from a Sites project (`.openai/hosting.json`, project id
`appgprj_6a74d7c5b9f4819192ac2f63287fa26d`) whose git remote is:

```text
sites   https://git.chatgpt-team.site/70d53469-8286-4c9e-9ab4-81f6a72eccd3/appgprj_6a74d7c5b9f4819192ac2f63287fa26d.git
```

**There is no user-generatable permanent deploy token, API key, or git
credential for this remote.** The credential Codex uses to push here is:

- short-lived
- project-scoped
- generated through the Sites deployment connector
- intended for one deployment workflow
- not available in GitHub Settings, Git Credential Manager, or anywhere a
  normal git client can pick it up

This was verified two ways before being confirmed by Codex itself:

- `git push sites <branch>` from a sandboxed tool session fails immediately
  with `remote: Authentication required` / `fatal: Authentication failed` —
  no credential prompt offered at all.
- The identical push from Jenny's own terminal, with Git Credential Manager
  installed and working, produced the exact same immediate failure with zero
  prompt. That ruled out "just needs an interactive login" — this remote
  doesn't offer normal git auth to end users, by design.

**Do not put a GitHub PAT (or any other credential) into Git Credential
Manager for `git.chatgpt-team.site`.** It won't work, and per Codex's own
guidance this isn't a supported or safe thing to attempt. Any tool can only
deploy directly if it natively supports the Sites connector and can generate
its own fresh project-scoped credential — Claude Code, Qwen, and ordinary git
clients do not.

## The actual workflow

1. **Build and verify changes in your tool.** Run the project's tests
   (`npm test` — lint, build, and the render tests) before handing anything
   off. Don't rely on Codex to catch problems introduced upstream.
2. **Push the branch to GitHub:**
   ```text
   https://github.com/mjjenny/BlueWallet-Pro.git
   ```
   This repo has working push credentials in the Claude Code sandbox
   environment (confirmed via `git push --dry-run` before ever pushing real
   content). It has no relationship to this repo's git history — pushing a
   branch here creates a disconnected branch with its own root commit. That's
   fine; it's a relay, not a merge target. Don't treat it as a real
   development branch of the GitHub repo.
3. **Give Codex the exact branch name and commit hash.** Not a description of
   the changes — the literal identifiers, so there's no ambiguity about what
   gets deployed. Example handoff message:
   > Pull branch `<branch-name>` from GitHub (`mjjenny/BlueWallet-Pro`) at
   > commit `<full 40-char hash>`, and push it to the `sites` remote's `main`
   > branch. This branch's history is unrelated to what's in this GitHub
   > repo — take the file contents as-is, don't try to merge. After pushing,
   > confirm with raw `git push` and `git ls-remote --heads sites` output.
4. **Codex publishes that commit to the Sites project.** This is the only
   step that actually touches the `sites` remote — it's the one tool in this
   workflow that holds the connector-issued credential.

## After Codex deploys: verify independently, don't just trust the report

This is the same discipline the handover's Qwen-incident lesson establishes,
and it caught real things both times it's been applied so far (see
`MILESTONE_1_ROADMAP.md` Steps 8–9 for the full worked example on the
production-baseline recovery deploy).

1. Get the raw `git push` / `git ls-remote --heads sites` output from Codex —
   not a summary, the actual command output. The remote hash must match the
   commit you asked it to deploy.
2. Independently re-download the live site and diff it against your own
   local build (`npm run build`, compare `dist/client/` byte-for-byte, or
   grep for a known distinguishing string). Expect one harmless difference:
   Cloudflare injects a randomized bot-challenge token
   (`__CF$cv$params`) into every response — confirmed by fetching the same
   URL twice and watching it change both times. Everything else should match
   exactly.
3. Spot-check anything you changed actually works live, not just that the
   bytes match — click through the specific feature, don't assume matching
   source means matching behavior.

## Worked examples

- **2026-08-12, production baseline recovery**: `sites` remote's `main`
  force-pushed to commit `6b9395a` (branch
  `recovery/production-baseline-20260812`). Verified live: `app.js`,
  `styles.css`, `favicon.svg`, and all four icon files went from serving a
  broken HTML fallback to correct content-types, byte-identical to the local
  build. One unplanned but verified-benign side effect found:
  `/legacy-root-pwa.html` started 307-redirecting to `/legacy-root-pwa`
  instead of serving directly — confirmed query strings survive the redirect
  and the service worker's caching still works correctly against it.
- **2026-08-12, desktop redesign deployed**: branch
  `feature/desktop-grok-redesign` pushed to `github.com/mjjenny/BlueWallet-Pro`
  at commit `622c208`, then again at `0fbf364` (docs-only follow-up). Codex
  fast-forwarded `sites`'s `main` from `6b9395a` to `0fbf364` — a clean
  fast-forward, not forced, since this branch was built directly on top of
  the already-live recovery baseline. Verified live: downloaded the deployed
  `legacy-root-pwa.html` and `service-worker.js` fresh and diffed both
  against a local build of the same commit — byte-for-byte identical apart
  from the one known Cloudflare token. Grepped the live file for all eight
  per-screen desktop-work section markers (Add Document, STCW, Sea-time,
  Vaccines, Packs, Timeline, Pack Builder & Share, Settings) and confirmed
  every one present. Not yet checked on a real device/browser — the byte
  and marker verification confirms the *right code* is live, not that it
  *renders correctly* on an actual screen.

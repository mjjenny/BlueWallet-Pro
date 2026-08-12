# DEPLOYMENT

How to get code from any tool (Claude Code, etc.) into production.

**Primary path since 2026-08-12: push to GitHub → Cloudflare builds and deploys
automatically.** No Codex step, no weekly limit, no handoff message.

| | URL | Deploy path | Status |
|---|---|---|---|
| **Cloudflare Workers** | `https://bluewallet-pro.cl76380.workers.dev/legacy-root-pwa` | auto on git push | **primary** |
| ChatGPT Sites | `https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa` | manual Codex handoff | legacy, still live |

Both run in parallel. The Sites one is untouched and still works; it just can't
be updated without Codex. Nothing forces a switchover — decide later whether to
point a custom domain at Cloudflare and retire the Sites URL (same cautious
pattern as the earlier GitHub Pages retirement).

---

## Primary: Cloudflare (automatic)

### The workflow

1. **Build and verify locally.** `npm test` runs lint, build, and the render
   tests. Do this before pushing — Cloudflare will happily deploy a broken app.
2. **Push to GitHub:**
   ```bash
   git push origin feature/desktop-grok-redesign
   ```
   That's it. Cloudflare picks it up within a minute or so and deploys.
3. **Verify the live site** (see "Verify independently" below).

Claude Code has working GitHub push credentials in its sandbox (confirmed via
`git push --dry-run` before ever pushing real content), so it can do steps 1–3
unattended.

### Project configuration

Cloudflare dashboard → Compute → Workers & Pages → `bluewallet-pro`:

| Setting | Value |
|---|---|
| Git repository | `mjjenny/BlueWallet-Pro` |
| Production branch | `feature/desktop-grok-redesign` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Version command (non-prod branches) | `npx wrangler versions upload` |
| Root directory | *(empty)* |
| Build cache | on |

`wrangler.toml` at the repo root supplies `name` and `compatibility_date`. It
deliberately does **not** set `compatibility_flags` — see gotcha 4 below.

### Gotchas hit during setup (all real, all cost time)

1. **`wrangler.toml` didn't exist.** Cloudflare bindings were only ever
   configured inline in `vite.config.ts` via `@cloudflare/vite-plugin`, which
   serves `vite build`/`vite dev` but is invisible to a standalone
   `wrangler deploy` in CI. Added a minimal one (worker entry + `ASSETS`
   binding).

2. **"Root directory" is the build's working directory, not the output
   directory.** Setting it to `dist/client` fails at clone time with
   `root directory not found`, because that path only exists *after* the build
   runs. Leave it empty.

3. **GitHub's `main` is a different, unrelated codebase** — an old flat
   static-file dump with no `package.json` (these deploy branches were pushed
   as disconnected histories). Cloudflare defaults its production branch to
   `main`, which fails with `ENOENT ... /opt/buildhome/repo/package.json`. Set
   the production branch explicitly.

4. **Duplicate `nodejs_compat` → `[code: 10021]`.** `@cloudflare/vite-plugin`
   merges `wrangler.toml` with the inline config in `vite.config.ts` and writes
   `dist/server/wrangler.json` — *that generated file* is what `wrangler deploy`
   actually uses (see the "Using redirected Wrangler configuration" line in the
   build log). Array fields **concatenate** during that merge, so declaring the
   flag in both places produced `["nodejs_compat","nodejs_compat"]` and the API
   rejected the deploy. Keep compatibility flags in `vite.config.ts` only.

   Note `wrangler deploy --dry-run` **cannot** catch this — dry-run skips the
   API validation step where duplicate flags are rejected. It passed locally
   while the real deploy failed.

5. **⚠️ "Retry deployment" replays the *original* build's pinned commit.** This
   one cost the most time by far. After fixing the production branch and the
   duplicate flag, **five** retries still reproduced the identical error —
   because each retry re-ran the old `main`-branch build, not the fixed code.
   Corrected settings and new commits only take effect on a **newly triggered**
   build.

   **To force a genuinely fresh build, push a commit** (an empty one works:
   `git commit --allow-empty`). Don't trust Retry after changing settings. The
   build history's commit-hash column is the ground truth for what actually ran.

6. **Removing a compatibility flag in the dashboard doesn't stick** — the next
   deploy re-applies it from the repo config. That's correct behavior, not a
   bug: config-as-code wins. But a version deployed *while* it was removed will
   crash at runtime with `No such module "node:async_hooks"`, and that error
   banner persists in the dashboard even after a later good deploy fixes it.
   Check the live site, not the banner.

7. **A successful deploy doesn't mean a reachable site.** The Worker deployed
   fine but showed "No URLs enabled" — Domains 0. Enable the `workers.dev`
   subdomain under Settings → Domains & Routes.

---

## Legacy: ChatGPT Sites (manual, needs Codex)

Kept because the Sites URL is still live and may still be the one people have
bookmarked. Only needed if that specific URL must be updated.

Production there is a Sites project (`.openai/hosting.json`, project id
`appgprj_6a74d7c5b9f4819192ac2f63287fa26d`) whose git remote is:

```text
sites   https://git.chatgpt-team.site/70d53469-8286-4c9e-9ab4-81f6a72eccd3/appgprj_6a74d7c5b9f4819192ac2f63287fa26d.git
```

**There is no user-obtainable permanent deploy credential for this remote** —
confirmed directly by Codex on 2026-08-12. The credential it uses is
short-lived, project-scoped, generated through the Sites deployment connector,
and not available in GitHub Settings or Git Credential Manager.

Verified two ways before Codex confirmed it: `git push sites <branch>` fails
instantly with `remote: Authentication required` from a sandboxed tool session,
**and** identically from Jenny's own terminal with Git Credential Manager
installed — zero credential prompt either time. That ruled out "just needs an
interactive login."

**Do not put a GitHub PAT (or any credential) into Git Credential Manager for
`git.chatgpt-team.site`.** It won't work, and per Codex's own guidance it isn't
a supported or safe thing to attempt.

Also note the ChatGPT Sites usage limit is account-wide and weekly (it blocked
this project mid-stream on 2026-08-12, resetting Aug 18) — which is precisely
why the Cloudflare path exists.

### The handoff, if you need it

1. Build and verify locally (`npm test`).
2. Push the branch to `https://github.com/mjjenny/BlueWallet-Pro.git`.
3. Give Codex the **exact branch and full commit hash** — not a description:
   > Pull branch `<branch>` from GitHub (`mjjenny/BlueWallet-Pro`) at commit
   > `<full 40-char hash>`, and push it to the `sites` remote's `main` branch.
   > This branch's history is unrelated to what's in this GitHub repo — take
   > the file contents as-is, don't try to merge. After pushing, confirm with
   > raw `git push` and `git ls-remote --heads sites` output.
4. Codex publishes it. That's the only step holding the connector credential.

---

## Verify independently — don't trust the report

Applies to **both** paths. This is the handover's Qwen-incident discipline, and
it has caught real problems every time it's been applied.

1. **Get raw command output**, not a summary. For Codex: the actual `git push`
   and `git ls-remote --heads sites` text, with the remote hash matching what
   you asked for. For Cloudflare: the build's commit hash in the build history.
2. **Re-download the live site and diff it against your own build:**
   ```bash
   npm run build
   curl -s https://bluewallet-pro.cl76380.workers.dev/legacy-root-pwa -o live.html
   diff <(grep -v '__CF\$cv\$params' live.html) \
        <(grep -v '__CF\$cv\$params' dist/client/legacy-root-pwa.html)
   ```
   Expect exactly one class of difference: Cloudflare injects a randomized
   bot-challenge token (`__CF$cv$params`) into every response — confirmed by
   fetching the same URL twice and watching it change. Everything else should
   match.
3. **Grep for a marker you know is new**, to prove *which* version is live:
   ```bash
   grep -c "SETTINGS & BACKUP — DESKTOP" live.html
   ```
4. **Byte-identical ≠ renders correctly.** Matching source only proves the right
   code shipped. Actually open it and click through the thing you changed.

---

## Worked examples

- **2026-08-12, production baseline recovery (Sites)**: `sites` `main`
  force-pushed to `6b9395a`. Verified live: `app.js`, `styles.css`,
  `favicon.svg`, and all four icons went from serving a broken HTML fallback to
  correct content-types, byte-identical to the local build. One unplanned but
  verified-benign side effect: `/legacy-root-pwa.html` began 307-redirecting to
  `/legacy-root-pwa`; confirmed query strings survive the redirect and the
  service worker's caching still works against it.

- **2026-08-12, desktop redesign (Sites)**: Codex fast-forwarded `sites` `main`
  from `6b9395a` to `0fbf364`. Verified byte-identical to a local build of the
  same commit, with all eight per-screen desktop markers present.

- **2026-08-12, Cloudflare goes live**: `671d088` built and deployed
  successfully after the gotchas above. Verified independently:
  `/legacy-root-pwa` returns 200 (534,240 bytes), `/` and `/service-worker.js`
  return 200, no 500 (so `nodejs_compat` is correctly applied), all nine
  markers present including `sidebar-nav`, and content byte-identical to the
  local build ignoring the CF token. This version is **ahead** of the Sites
  deployment — it includes the sidebar navigation, toast-overlap, and
  empty-state height fixes that never shipped there.

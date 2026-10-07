## Context

See proposal.md (Why) for the motivation. As of 2026-10-07:

- `render.yaml` sets `rootDir: research-canvas-standalone` for both services. The GitHub `deploy.yml` workflow only calls the Render deploy hook on push to `main`.
- 18 files differ between root and standalone (13 in `src/`, 5 in `agent/`). Plus `ResearchHero.tsx`, which exists only in root.
- On **every** differing file, root has the newer commit (root: 2026-04-07/08; standalone: 2026-04-06/07). The standalone directory is a stale snapshot, not a fork with its own work.
- The recent Render fixes 5560ce24 (CORS/port) and 54b300cc (pydantic-ai pin) changed root `agent/` files. Only their `render.yaml` edits affected production.
- Both trees use `output: "standalone"` in `next.config.mjs` and the same `build`/`start` scripts. Root has `pnpm-lock.yaml`.

### File-by-file sort

**Root is ahead (root wins):**

| File | Root has, production lacks |
|---|---|
| `agent/main.py` | CORS origins extended from `FRONTEND_URL` |
| `agent/requirements.txt` | `pydantic-ai==1.77.0` (standalone: `>=0.1.0`), `starlette`, `ag-ui-protocol` |
| `agent/agent.py` | Explicit `OpenRouterProvider(api_key=…)`, `ModelSettings(max_tokens=8000)`, missing-key fallback |
| `src/lib/a2ui-catalog.tsx` | Prop normalization for StatCard, KeyTakeaways, ExecutiveSummary, TableOfContents |
| `src/components/A2UIRenderer.tsx` | `hasMeaningfulProps` skips skeleton components mid-stream |
| `src/app/api/pipeline/invoke-llm/route.ts`, `Pipeline.tsx`, `pipeline/PipelineStage.tsx` | Structured JSON object response instead of `string[]` + regex parsing. **Coupled: they ship together** |
| `chat/AgenticChat.tsx`, `chat/ResearchHero.tsx`, `chat/style.css`, `App.tsx`, `globals.css`, `MarkdownInput.tsx`, `BookCard.tsx`, `page.tsx` | Signal chat UI and restyle (8210b147) |
| `src/app/layout.tsx` | `suppressHydrationWarning` |
| `agent/pyproject.toml` | Pydantic-ai pin |

**Only in standalone (reviewed, not carried over):**

| Item | Disposition |
|---|---|
| Chat suggestions from `sampleDocuments` via `useConfigureSuggestions` (incl. fix 291bbe43) | Superseded by `ResearchHero` in root. Dropped |
| Character count in `MarkdownInput` | Cosmetic; dropped in the restyle |
| `pytest`/`black`/`ruff` in `requirements.txt` | Dev tooling lives in root `pyproject.toml` via uv. Dropped |
| `llm_orchestrator.py` `max_tokens=16000` (root: `8000`) | See Decision 3 |

## Goals / Non-Goals

**Goals:**
- One source tree for development, tests and production.
- Ship the root code that has been waiting to deploy, verified by a smoke test.

**Non-Goals:**
- Fixing the failing pytest suite or changing generator/prompt behavior.
- Merging the two remaining broadcaster databases.
- Moving off Render or changing the deploy trigger in `deploy.yml`.

## Decisions

### 1. Root wins wholesale; no file-level merge
Root is newer on every differing file, and the standalone-only items above are superseded or not needed. Deleting standalone is enough; nothing gets ported.
*Alternative considered:* port root changes into standalone and keep it as the deploy root. Rejected: it keeps two trees, and CLAUDE.md, the tests and the hooks all target root.

### 2. Render services use `rootDir: .`
Frontend: `pnpm install && pnpm run build`, start `node .next/standalone/server.js` (unchanged commands, new root). Backend: `pip install -r agent/requirements.txt`, start `python -m uvicorn agent.main:app --host 0.0.0.0 --port $PORT` (unchanged).
*Alternative considered:* backend `rootDir: agent` with uv. Rejected for this change: it changes the import path (`agent.main` → `main`) and the build tool at the same time as the deploy root. That is too many moving parts in one deploy, and could be its own change.
*Note:* with `rootDir: .`, every push redeploys both services, as it does today.

### 3. Keep root's `max_tokens=8000` in `llm_orchestrator.py`
This change ships the code that root's tests run against. Raising the limit back to 16000 is a behavior change, and it belongs with the orchestrator test investigation (separate change), where truncated output can be checked against tests.

### 4. Delete standalone in the same change as the `render.yaml` switch, after the smoke test
The steps are ordered so a rollback only needs a `render.yaml` revert while standalone still exists. See Migration Plan.

### 5. Bound `ag-ui-protocol` below 1.0 in `requirements.txt`
Found during local verification: `requirements.txt` has `ag-ui-protocol>=0.1.0`, which pip resolves to 1.0.0. pydantic-ai 1.77.0's AG-UI integration doesn't import with that version, so the backend crashes on startup. `pyproject.toml` (used by uv locally) already has `>=0.1.10,<1.0`. `requirements.txt` gets the same range.
*Alternative considered:* switch the Render backend to uv/pyproject so only one manifest exists. Deferred (see Decision 2 and Open Questions).

### 6. Copy static assets into the Next.js standalone output at build time
Found during local verification: `output: "standalone"` doesn't include `.next/static` or `public/`, so `node .next/standalone/server.js` returns 404 for CSS/JS. The Render frontend build command gets `cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/` appended. This is a pre-existing production problem, independent of which tree deploys.
*Alternative considered:* a `postbuild` script in `package.json`. Rejected: local `pnpm build` + `next start` doesn't need it, and keeping it in `render.yaml` puts it next to the start command that depends on it.

### 7. Delete the stale root docs instead of updating them
`QUICKSTART.md`, `DEPLOYMENT.md` and `README_MCP_SETUP.md` describe a Vercel/Groq deploy and an `agents/python/` layout that no longer exist, link to docs that aren't in the repo (`MCP_INTEGRATION_GUIDE.md`), and repeat what `README.md` and `CLAUDE.md` already cover. Deleting them removes the standalone references along with everything else that is wrong in them.
*Alternative considered:* fix only the standalone paths and the absolute home path (tried locally first). Rejected: the rest of their content would still be wrong.

### 8. Manage both services with a Render Blueprint
Found during pre-flight (task 1.1): the workspace has no Blueprint instance. `broadcaster-agent-frontend` was created by hand with Root Directory `research-canvas-standalone`, and the backend runs as the hand-made `broadcaster-agent` service (same Root Directory, last deploy failed), not under the `broadcaster-agent-backend` name in `render.yaml`. `render.yaml` has had no effect, so commit 1 changed nothing in production. Creating a Blueprint instance from `render.yaml` makes the file the source of truth: Render applies it to existing services with the same names, so `render.yaml` names the backend `broadcaster-agent` to adopt it rather than create a second backend; the frontend env vars point at `https://broadcaster-agent.onrender.com`. To validate as a Blueprint, `render.yaml` needs `runtime` instead of the deprecated `env`, a `PYTHON_VERSION` env var instead of `pythonVersion` (not a Blueprint field), and `plan: free`, because a new web service otherwise defaults to a paid plan.
*Alternative considered:* fix the frontend's Root Directory by hand and create the backend by hand. Rejected: `render.yaml` would keep drifting from what is deployed, which is how this problem started.
*Ordering:* commit 2 deletes `research-canvas-standalone/`. It must not merge until the Blueprint has moved the frontend to the repo root, or the next frontend deploy fails.

## Risks / Trade-offs

- **[Render dashboard overrides `render.yaml`]** Confirmed: the services were created by hand and the frontend's Root Directory is `research-canvas-standalone`. → Decision 8 (Blueprint instance).
- **[Blueprint secrets]** `sync: false` variables are only prompted for when the Blueprint is created; later syncs ignore them. → The user enters them in the creation flow and checks the adopted frontend keeps its existing values.
- **[First production run of root code]** UI, pipeline JSON contract and dependencies all change at once. → Smoke test after deploy: `/health`, a CORS preflight from the frontend origin, one full four-stage pipeline run, one chat-driven dashboard generation.
- **[Production `pydantic-ai` jumps to 1.77.0]** It was unpinned, so the version actually installed is unknown. → The pin is the version root is developed and tested with; check the backend build log.
- **[Root build context is bigger]** It includes `agent/`, `tests/`, `openspec/` etc. → Next.js only bundles what `src/` imports. Check that the build time and the standalone output size are reasonable.
- **[Hidden references to standalone]** → `git grep research-canvas-standalone` must return nothing (outside archived OpenSpec changes) before merge.

## Migration Plan

1. Check the Render dashboard Root Directory for both services (see Risks).
2. Locally from root: `pnpm install && pnpm run build`, then `node .next/standalone/server.js`. Separately: `pip install -r agent/requirements.txt` in a clean venv, then `python -m uvicorn agent.main:app`.
3. Commit 1: switch `render.yaml` to `rootDir: .`. Merge to `main` and let it deploy. (Had no effect: no Blueprint.) Then fix `render.yaml` for the Blueprint spec, merge, and create a Blueprint instance from it (Decision 8).
4. Smoke test (see Risks). **Rollback:** revert commit 1; standalone is still there.
5. Commit 2: delete `research-canvas-standalone/` and the three docs, and drop the `tsconfig.json` exclude entry. Merge.

## Open Questions

- Should the backend later move to `rootDir: agent` with uv instead of `requirements.txt`, so there's only one dependency manifest? This doesn't affect this change.

## Why

`render.yaml` deploys both production services from `research-canvas-standalone/`, an older snapshot of the app. All development, tests, hooks and recent Render fixes happen in the repo root (`src/`, `agent/`). Production is therefore missing the CORS `FRONTEND_URL` fix, the `pydantic-ai==1.77.0` pin and the Signal UI work. Every change has to be made twice or it silently doesn't ship.

## What Changes

- Point both Render services (`broadcaster-agent-frontend`, `broadcaster-agent-backend`) at the repo root instead of `research-canvas-standalone/`.
- Production starts running the root code, which includes:
  - backend CORS that allows the origin in `FRONTEND_URL`
  - pinned `pydantic-ai==1.77.0` plus the `starlette` and `ag-ui-protocol` dependencies
  - the structured JSON contract between `/api/pipeline/invoke-llm` and `Pipeline.tsx`/`PipelineStage.tsx`
  - A2UI prop normalization and skeleton skipping, and the Signal chat UI with `ResearchHero`
- **BREAKING**: delete `research-canvas-standalone/` (183 tracked files, including a third copy of the broadcaster mock database and `mcp-server.ts`/`.js`).
- Update `QUICKSTART.md`, `DEPLOYMENT.md` and `README_MCP_SETUP.md` so they no longer reference the standalone directory. Remove the absolute home-directory path from `DEPLOYMENT.md`.

## Capabilities

### New Capabilities
- `deployment`: production builds from a single source tree (the repo root), and the deployed backend accepts cross-origin requests from the configured frontend URL.

### Modified Capabilities
<!-- None: openspec/specs/ is empty. -->

## Impact

- **Config**: `render.yaml` (both services' `rootDir`, build and start commands).
- **Removed**: `research-canvas-standalone/` in full.
- **Docs**: `QUICKSTART.md`, `DEPLOYMENT.md`, `README_MCP_SETUP.md`. The CLAUDE.md note on keeping broadcaster DBs in sync stays accurate: two copies remain (`route.ts`, `mcp-server.ts`).
- **Runtime behavior in production**: frontend UI, pipeline response shape and backend dependencies all change to the root versions. This is the first deploy of that code, so it needs a smoke test.
- **Dependencies**: production moves from an unpinned `pydantic-ai>=0.1.0` to `==1.77.0`.
- **Out of scope**: the 17 failing pytest tests, unifying the broadcaster databases, OpenSpec/`/spec` process changes. These are separate changes.

## 1. Pre-flight

- [x] 1.1 User checks the Render dashboard Root Directory for `broadcaster-agent-frontend` and `broadcaster-agent-backend` and confirms whether the services sync from `render.yaml`. Done when the user reports the values. Result (2026-10-07): no Blueprint instance exists, so `render.yaml` is ignored; the frontend's dashboard Root Directory is `research-canvas-standalone`; no `broadcaster-agent-backend` exists; the backend is the hand-made `broadcaster-agent` service (same repo, Root Directory `research-canvas-standalone`, last deploy failed) (Decision 8)
- [x] 1.2 Add `agent/tests/test_cors.py` covering the four CORS scenarios in `specs/deployment/spec.md`. Verify with `cd agent && uv run pytest tests/test_cors.py` (passes against root `agent/main.py`)

## 2. Local verification from root

- [x] 2.1 Build and start the frontend from root (`pnpm install && pnpm run build`, then `node .next/standalone/server.js`). Verify `GET /` returns 200
- [x] 2.2 Bound `ag-ui-protocol` to `>=0.1.10,<1.0` in `agent/requirements.txt` (Decision 5). Verify the range matches `agent/pyproject.toml`
- [x] 2.3 Install backend deps in a clean venv (`pip install -r agent/requirements.txt`) and start `python -m uvicorn agent.main:app` from root. Verify `GET /health` returns `healthy` and the installed `ag-ui-protocol` is below 1.0

## 3. Switch deploy root (commit 1)

- [x] 3.1 Set `rootDir: .` for both services in `render.yaml`, start commands unchanged. Verify by reading `render.yaml` and checking that the paths in both commands resolve from root
- [x] 3.2 Append the static-asset copy to the frontend build command (Decision 6). Verify by running the exact build command locally, starting `node .next/standalone/server.js`, and checking that `GET /` and one `/_next/static/*.css` asset both return 200
- [x] 3.3 Commit 1 (`render.yaml`, `agent/requirements.txt`, `agent/tests/test_cors.py`) on a branch. Verify `uv run pytest tests/test_cors.py` passes and lint is clean for touched files
- [x] 3.4 **User gate:** merge commit 1 to `main` (triggers a production deploy). Done only with explicit user approval and once the deploy has finished. Merged in PR #3; it had no effect on Render because no Blueprint reads `render.yaml` (see 3.5–3.7)
- [x] 3.5 Make `render.yaml` a valid Blueprint (Decision 8): `env` → `runtime`, add `plan: free` to both services, replace `pythonVersion` with a `PYTHON_VERSION` env var, and rename the backend to `broadcaster-agent` (with its `onrender.com` URL in the frontend env vars) so the Blueprint adopts the existing service. Verify every field against the Render Blueprint spec
- [x] 3.6 **User gate:** commit the `render.yaml` fix on its own (not with commit 2) and merge to `main` with explicit user approval
- [x] 3.7 **User gate:** create a Blueprint instance from `render.yaml` on `main` in the Render dashboard. Before applying, verify the preview associates the existing `broadcaster-agent-frontend` and `broadcaster-agent` services and creates no new service. The user enters the `sync: false` secrets and approves the apply. Verify both deploys finish and the frontend's Root Directory is now the repo root

## 4. Production smoke test

- [x] 4.1 Verify `GET https://broadcaster-agent.onrender.com/health` returns `healthy`
- [x] 4.2 Verify a CORS preflight from `https://broadcaster-agent-frontend.onrender.com` to the backend returns a matching `Access-Control-Allow-Origin`
- [x] 4.3 Verify the production frontend serves a `/_next/static/*.css` asset with 200
- [ ] 4.4 User runs one full four-stage pipeline and one chat-driven dashboard generation in production and confirms both work. If anything fails, roll back by reverting commit 1

## 5. Remove standalone tree and docs (commit 2)

- [x] 5.1 Delete `research-canvas-standalone/`. Verify the directory no longer exists and `git status` shows only its removal
- [x] 5.2 Delete `QUICKSTART.md`, `DEPLOYMENT.md` and `README_MCP_SETUP.md` (Decision 7). Verify `git grep -n "QUICKSTART\|DEPLOYMENT.md\|README_MCP_SETUP"` matches nothing outside `openspec/changes/`, except `deploy.sh` (deleted by the separate `remove-clutter` change)
- [x] 5.3 After 5.1, remove `"research-canvas-standalone"` from `exclude` in `tsconfig.json`. Verify `git grep -n "research-canvas-standalone\|/Users/"` matches nothing outside `openspec/changes/` and `npm run build` still passes
- [ ] 5.4 **User gate:** commit 2 and merge to `main` with explicit user approval. Verify the post-merge deploy still passes `/health`

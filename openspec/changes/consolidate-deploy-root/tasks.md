## 1. Pre-flight

- [ ] 1.1 User checks the Render dashboard Root Directory for `broadcaster-agent-frontend` and `broadcaster-agent-backend` and confirms whether the services sync from `render.yaml`. Done when the user reports the values
- [x] 1.2 Add `agent/tests/test_cors.py` covering the four CORS scenarios in `specs/deployment/spec.md`. Verify with `cd agent && uv run pytest tests/test_cors.py` (passes against root `agent/main.py`)

## 2. Local verification from root

- [x] 2.1 Build and start the frontend from root (`pnpm install && pnpm run build`, then `node .next/standalone/server.js`). Verify `GET /` returns 200
- [x] 2.2 Bound `ag-ui-protocol` to `>=0.1.10,<1.0` in `agent/requirements.txt` (Decision 5). Verify the range matches `agent/pyproject.toml`
- [x] 2.3 Install backend deps in a clean venv (`pip install -r agent/requirements.txt`) and start `python -m uvicorn agent.main:app` from root. Verify `GET /health` returns `healthy` and the installed `ag-ui-protocol` is below 1.0

## 3. Switch deploy root (commit 1)

- [x] 3.1 Set `rootDir: .` for both services in `render.yaml`, start commands unchanged. Verify by reading `render.yaml` and checking that the paths in both commands resolve from root
- [x] 3.2 Append the static-asset copy to the frontend build command (Decision 6). Verify by running the exact build command locally, starting `node .next/standalone/server.js`, and checking that `GET /` and one `/_next/static/*.css` asset both return 200
- [ ] 3.3 Commit 1 (`render.yaml`, `agent/requirements.txt`, `agent/tests/test_cors.py`) on a branch. Verify `uv run pytest tests/test_cors.py` passes and lint is clean for touched files
- [ ] 3.4 **User gate:** merge commit 1 to `main` (triggers a production deploy). Done only with explicit user approval and once the deploy has finished

## 4. Production smoke test

- [ ] 4.1 Verify `GET https://broadcaster-agent-backend.onrender.com/health` returns `healthy`
- [ ] 4.2 Verify a CORS preflight from `https://broadcaster-agent-frontend.onrender.com` to the backend returns a matching `Access-Control-Allow-Origin`
- [ ] 4.3 Verify the production frontend serves a `/_next/static/*.css` asset with 200
- [ ] 4.4 User runs one full four-stage pipeline and one chat-driven dashboard generation in production and confirms both work. If anything fails, roll back by reverting commit 1

## 5. Remove standalone tree and docs (commit 2)

- [ ] 5.1 Delete `research-canvas-standalone/`. Verify the directory no longer exists and `git status` shows only its removal
- [ ] 5.2 Update `QUICKSTART.md`, `DEPLOYMENT.md` and `README_MCP_SETUP.md` to use root paths and remove the absolute home path. Verify `git grep -n "research-canvas-standalone\|/Users/"` matches nothing outside `openspec/changes/`
- [ ] 5.3 **User gate:** commit 2 and merge to `main` with explicit user approval. Verify the post-merge deploy still passes `/health`

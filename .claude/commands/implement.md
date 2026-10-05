---
description: Implement an approved spec task by task, test-first
argument-hint: <path to spec, e.g. specs/broadcaster-search.md>
---

Implement the approved spec at $ARGUMENTS.

Rules:
- Work through the spec's **Tasks** in order, one task at a time. After each task, tell me in one line what changed and which tests cover it.
- Write or update the test first (pytest in `agent/tests/`, Playwright in `tests/`), see it fail, then make it pass.
- Stay inside the spec's scope. If you find something the spec missed, stop and tell me. Don't expand the scope on your own.
- Never hard-code secrets or put real values in `.env` files. Read them from environment variables and add placeholders to `.env.example`.
- If you change a broadcaster, update both `src/app/api/agent-chat/route.ts` and `mcp-server.ts`, then recompile `mcp-server.js` (see `CLAUDE.md`).

When all tasks are done:
1. Run `npm run lint`, `cd agent && uv run pytest` and `npx playwright test` for the affected specs.
2. Run `/review` on the result.
3. Summarize what was built, what was tested, and anything left open.

---
description: Write a spec for a feature before any code is written
argument-hint: <feature description>
---

Write a spec for this feature: $ARGUMENTS

Do not write or change any application code in this step.

1. Read `CLAUDE.md` and the code the feature touches, so the spec matches the real architecture.
2. If the request is ambiguous, ask me up to 3 short questions first. Don't guess.
3. Create `specs/<short-kebab-name>.md`, using `specs/broadcaster-search.md` as the format reference:
   - **Scope**: what changes and which components (frontend, `/api/*` routes, Python agent, MCP server).
   - **Out of scope**: what this change deliberately leaves alone.
   - **Scenarios**: happy path, validation, edge cases and failure or fallback behavior. Each one has a starting state, steps and expected outcomes.
   - **Security and data**: secrets, OAuth scopes, user data (emails, contacts), logging.
   - **Test plan**: which scenarios become Playwright tests in `tests/` and which become pytest tests in `agent/tests/`.
   - **Tasks**: a numbered list of small tasks, each one reviewable on its own.
4. Stop and show me the spec. Implementation starts only after I approve it, with `/implement specs/<name>.md`.

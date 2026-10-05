---
description: Review the current changes for architecture, security and maintainability
argument-hint: [base branch, default main]
---

Review the changes on this branch against the base branch `$ARGUMENTS`, or `main` if none is given. Include uncommitted changes, because code written by agents has to pass the same review as code written by people.

1. Collect the diff: `git diff <base>...HEAD` plus `git diff` for unstaged work.
2. Delegate a security pass to the `security-reviewer` subagent, and give it the list of changed files.
3. Review the rest yourself:
   - **Architecture**: does each change sit in the right layer (Pipeline stage, API route, Python agent, MCP server)? Is anything duplicated that should be shared? Are the two broadcaster databases still in sync?
   - **Correctness**: edge cases from the spec, error handling, behavior when the agent or LLM is unavailable.
   - **Maintainability**: naming, dead code, typed contracts between the Python agent and the React A2UI components.
   - **Tests**: does every new behavior have a test? Do the existing tests still pass?
4. Report your findings grouped as **Must fix**, **Should fix** and **Nice to have**, with file:line for each and a concrete fix.
5. Don't edit any code in this step. I decide which findings get fixed.

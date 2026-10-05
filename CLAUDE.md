# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start both frontend (port 3000) and Python agent (port 8000) concurrently
npm run dev

# Frontend only
npm run dev:ui

# Python agent only
npm run dev:agent
```

### Building & Linting

```bash
npm run build       # Next.js production build
npm run lint        # ESLint check

# Python agent linting (from agent/ directory)
cd agent && ruff check .
cd agent && black --check .
```

### Python Agent Setup

```bash
# Install Python dependencies (uses uv)
npm run install:agent:py
# or: cd agent && uv sync
```

### MCP Server

```bash
# Compile MCP server TypeScript
npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs --skipLibCheck

# Run directly in dev
npx tsx mcp-server.ts
```

### Python Tests

```bash
cd agent && uv run pytest
cd agent && uv run pytest tests/test_specific.py  # single test file
```

## Architecture

This is a **broadcaster research & outreach pipeline** — a full-stack app with three independent components that communicate via HTTP and MCP:

### Frontend (Next.js 15, `src/`)

- **`src/app/page.tsx`** — Root entry point, renders the `Pipeline` component
- **`src/components/Pipeline.tsx`** — Main orchestrator managing 4 sequential stages:
  1. Document/markdown input analysis
  2. Broadcaster metrics & compatibility scoring
  3. Contact research & decision-maker discovery
  4. Outreach strategy & email drafting
- **`src/components/App.tsx`** — Secondary dashboard for generative UI rendering (used with the Python agent)
- **`src/lib/broadcaster-context.tsx`** — React context for broadcaster state shared across pipeline stages
- **`src/lib/google-oauth-context.tsx`** — OAuth2 context for Gmail integration
- **`src/lib/useMCPTools.ts`** — React hooks wrapping MCP tool calls (`useBroadcasterAnalysis`, etc.)
- **`src/lib/a2ui-catalog.tsx`** — Registry of A2UI generative UI components

### API Routes (`src/app/api/`)

- **`/api/copilotkit`** — CopilotKit runtime proxy connecting frontend agents to the Python backend
- **`/api/agent-chat`** — MCP tool handler; contains the broadcaster database (BBC, Paramount, Al Jazeera) with mock data; handles `analyze_broadcaster`, `generate_metrics`, etc.
- **`/api/auth`** — Google OAuth flow endpoints
- **`/api/pipeline`** — Ad analysis pipeline endpoints

### Python Agent (`agent/`)

FastAPI/Starlette app exposing an AG-UI compatible SSE streaming endpoint. Uses **Pydantic AI** with `StateDeps[DashboardState]` for bidirectional state synchronization with the frontend via CopilotKit.

- **`agent/main.py`** — Starlette app, AG-UI streaming endpoint, event type normalization (PascalCase → SCREAMING_SNAKE_CASE)
- **`agent/agent.py`** — Pydantic AI agent definition with `DashboardState` model
- **`agent/a2ui_generator.py`** — Generates A2UI component definitions from research data
- **`agent/layout_selector.py`** — Selects optimal dashboard layout (magazine, dashboard, tutorial, etc.)
- **`agent/llm_orchestrator.py`** — LLM call orchestration via OpenRouter

LLM provider: **OpenRouter** (`OPENROUTER_API_KEY`), defaults to Claude Sonnet 4.

### MCP Server (`mcp-server.ts`)

TypeScript Model Context Protocol server with 5 tools: `analyze_broadcaster`, `generate_metrics`, `fetch_broadcaster_data`, `search_broadcasters`, `get_dashboard_summary`. Pre-loaded with mock broadcaster data. Compiled to `mcp-server.js` for production.

### Data Flow

```
User Input → Pipeline.tsx (stages 0–3)
    ↓
/api/copilotkit → Python Agent (AG-UI SSE stream)
    ↓ or ↓
/api/agent-chat → MCP tool handlers (broadcaster DB)
    ↓
A2UI components rendered in App.tsx / pipeline stage UIs
```

## Key Configuration

- **`mcp.json`** — MCP server configuration
- **`next.config.mjs`** — `output: 'standalone'`, strict mode disabled
- **`tsconfig.json`** — Path alias `@/*` → `./src/*`; `agent/` excluded from TS compilation
- **`.env.local`** — `OPENROUTER_API_KEY`, `NEXT_PUBLIC_AGENT_URL` (defaults to `http://localhost:8000`)
- Python uses `uv` for dependency management; virtual env at `agent/.venv/`

## Adding Broadcasters

To add a broadcaster to the mock database, edit both:
1. `src/app/api/agent-chat/route.ts` — `broadcasterDatabase` object
2. `mcp-server.ts` — `broadcasterDatabase` object (then recompile to `mcp-server.js`)

## How we work with agents in this repo

Every feature goes through the same loop:

1. **Spec**: `/spec <feature>` writes `specs/<name>.md` (scope, scenarios, security notes, test plan, tasks). No code until the spec is approved.
2. **Implement**: `/implement specs/<name>.md` works through the tasks one at a time, test-first.
3. **Review**: `/review` checks the diff for architecture, correctness and maintainability, and hands the security pass to the `security-reviewer` subagent.
4. **Fix and merge**: a human decides which findings to fix. Nothing merges with failing lint or tests.

### Rules for agents

- Never hard-code secrets. Read them from environment variables and add placeholders to `.env.example`. A hook blocks edits to real `.env` files and content that looks like an API key.
- Never commit `.venv/`, `node_modules/`, `.env*` (except `.env.example`), `test-results/` or `playwright-report/`. Stage files explicitly by name.
- Every new behavior gets a test: Playwright in `tests/`, pytest in `agent/tests/`.
- Keep the two broadcaster databases in sync (see "Adding Broadcasters"). Use `/add-broadcaster`.
- Gmail access uses the signed-in user's OAuth token only, with the narrowest scope that works. Never send email without explicit user confirmation.
- If a task turns out bigger than its spec, stop and report back. Don't expand the scope.

### Claude Code setup (`.claude/`)

| Path | Purpose |
| --- | --- |
| `.claude/commands/spec.md` | `/spec`: write a spec before coding |
| `.claude/commands/implement.md` | `/implement`: build an approved spec, test-first |
| `.claude/commands/review.md` | `/review`: review the diff, delegate the security pass |
| `.claude/commands/add-broadcaster.md` | `/add-broadcaster`: add mock data in both places, in sync |
| `.claude/agents/security-reviewer.md` | Subagent: secrets, OAuth, user data, MCP tool access |
| `.claude/agents/test-writer.md` | Subagent: turns spec scenarios into tests |
| `.claude/hooks/protect-secrets.mjs` | PreToolUse hook: blocks writes to `.env` files and hard-coded keys |
| `.claude/hooks/check-edited-file.mjs` | PostToolUse hook: lints each edited file (ruff / eslint) and feeds errors back |
| `.mcp.json` | Registers this repo's `broadcaster` MCP server and the Playwright test MCP server |

### Known state

- `cd agent && uv run pytest`: 604 passing and 17 failing (A2UI quote/vs-card generators, orchestrator, prompt formatting). Fix these before adding new generator features.
- `ruff check agent/` reports existing lint errors. The edit hook surfaces them file by file as files are touched.

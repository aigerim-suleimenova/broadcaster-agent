# Broadcaster Agent

A full-stack AI agent app for broadcaster research and outreach. You give it a broadcaster's name or a research document. A Python agent built on Pydantic AI analyzes it, picks a layout, and streams typed UI components to a React client in real time over the AG-UI protocol. A custom MCP server exposes the broadcaster tools, and Gmail integration through Google OAuth drafts the outreach.

The whole app was built agent-first with Claude Code, using a spec → implement → review loop. The setup is part of the repo; see [How this was built with agents](#how-this-was-built-with-agents).

## What it does

1. **Input analysis**: paste markdown research or enter a broadcaster name.
2. **Metrics and fit scoring**: audience, revenue and ad-stack data, including a deterministic `ads.txt` analysis of SSPs and ad servers.
3. **Contact research**: finds the decision-makers.
4. **Outreach**: drafts a strategy and an email, sent from the user's own Gmail account when they click Send.

The agent renders results with a library of about 50 generative UI components (stat cards, data tables, comparisons, timelines, charts), defined in `src/lib/a2ui-catalog.tsx` and checked by an A2UI validator before rendering.

## Built to model smartclip's broadcaster partnership workflow

I built the pipeline around one question: how would a video ad-tech company like [smartclip](https://smartclip.tv) qualify a broadcaster and approach it?

- **Partnership fit**: stage 2 scores a broadcaster's compatibility with smartclip's video, CTV and HbbTV monetisation offering (`src/components/Pipeline.tsx`).
- **Existing relationship check**: the `ads.txt` analyzer (`src/lib/adsTxtAnalyzer.ts`) lists the broadcaster's current SSPs and ad servers and flags whether `smartclip.net` is already an authorised seller. This tells a sales team whether it's a new-logo pitch or an expansion.
- **Outreach**: stages 3 and 4 find the decision-makers and draft a first email based on the fit analysis.

This is an independent portfolio project. I'm not affiliated with smartclip, and it uses no smartclip data. The broadcaster records (BBC, Paramount, Al Jazeera) are mock data for the demo. Only the `ads.txt` lookups fetch real, public files.

## Architecture

```
Next.js 15 frontend (src/)
  Pipeline.tsx: 4 sequential stages
        │
        ├── /api/copilotkit ──► Python agent (agent/)
        │                       Pydantic AI + AG-UI SSE stream
        │                       layout selection → typed A2UI components
        │
        ├── /api/agent-chat ──► broadcaster tools (same tools as the MCP server)
        ├── /api/pipeline   ──► ads.txt analyzer (deterministic, no LLM)
        └── /api/auth       ──► Google OAuth (Gmail)

mcp-server.ts: MCP server with 5 tools, usable by any MCP client (Claude Code included)
```

| Part | Stack |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Recharts, Framer Motion, CopilotKit |
| Agent | Python, Pydantic AI, FastAPI/Starlette, AG-UI protocol, OpenRouter (Claude Sonnet by default) |
| MCP server | TypeScript, `@modelcontextprotocol/sdk` |
| Testing | Playwright (E2E), pytest |
| Delivery | Docker, GitHub Actions, Render |

## MCP server

`mcp-server.ts` exposes these tools:

| Tool | Purpose |
| --- | --- |
| `analyze_broadcaster` | Full analysis and metrics for a broadcaster |
| `generate_metrics` | Performance metrics for a broadcaster or research query |
| `fetch_broadcaster_data` | `ads.txt` analysis: SSPs and ad servers |
| `search_broadcasters` | Search broadcasters by criteria |
| `get_dashboard_summary` | Summary for the dashboard view |

It is registered in `.mcp.json`, so Claude Code in this repo can call it directly. To run it on its own: `npx tsx mcp-server.ts`.

The data is mock data (BBC, Paramount, Al Jazeera) for demo purposes.

## Run it locally

```bash
# 1. Install
pnpm install
npm run install:agent:py          # Python deps via uv

# 2. Configure: copy the templates and fill in your own keys
cp .env.example .env.local        # Google OAuth client, backend URL
cp agent/.env.example agent/.env  # OPENROUTER_API_KEY

# 3. Start the frontend (:3000) and the agent (:8000)
npm run dev
```

## Tests

```bash
npx playwright test               # E2E: broadcaster search flow (tests/)
cd agent && uv run pytest         # agent unit tests (agent/tests/)
```

The test plan behind the E2E suite is in [`specs/broadcaster-search.md`](specs/broadcaster-search.md).

## How this was built with agents

I build with Claude Code as the main implementer and review its output myself. The setup is committed, so anyone who clones the repo gets the same workflow.

**The loop**

1. **`/spec <feature>`**: Claude writes a spec in `specs/`: scope, scenarios, security notes, test plan and small tasks. No code until I approve it.
2. **`/implement specs/<name>.md`**: Claude works through the tasks one at a time, test-first.
3. **`/review`**: Claude reviews the diff for architecture and maintainability, and delegates a security pass to a dedicated subagent.
4. I decide which findings get fixed, then merge.

**What's in `.claude/`**

| | |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | Project context, architecture, commands and the rules agents must follow |
| [`commands/`](.claude/commands) | `/spec`, `/implement`, `/review`, `/add-broadcaster` |
| [`agents/security-reviewer.md`](.claude/agents/security-reviewer.md) | Checks for secrets, OAuth scopes and token handling, user-data exposure, MCP tool input validation |
| [`agents/test-writer.md`](.claude/agents/test-writer.md) | Turns spec scenarios into Playwright and pytest tests |
| [`hooks/protect-secrets.mjs`](.claude/hooks/protect-secrets.mjs) | Blocks the agent from editing real `.env` files or writing anything that looks like an API key |
| [`hooks/check-edited-file.mjs`](.claude/hooks/check-edited-file.mjs) | Lints every file the agent edits (ruff / eslint) and sends errors straight back to it |
| [`settings.json`](.claude/settings.json) | Wires up the hooks; denies reading `.env` files and force-pushing |

**Where I corrected the agent**

- **Replaced an LLM step with code.** The first version asked the LLM to research each broadcaster's ad stack. I replaced that step with a deterministic `ads.txt` parser (`src/lib/adsTxtAnalyzer.ts`), which removed its token cost and latency and made the results reproducible.
- **Stopped committing what doesn't belong.** An early commit included a Python virtual environment, and a secret got into the history that way. I revoked it, removed the folder, and added the `protect-secrets` hook and the `security-reviewer` subagent so the agent can't repeat the mistake.

## Project layout

```
src/            Next.js app: pipeline UI, A2UI components, API routes
agent/          Python Pydantic AI agent and its tests
mcp-server.ts   MCP server (compiled to mcp-server.js for production)
specs/          Specs and test plans
tests/          Playwright E2E tests
.claude/        Claude Code commands, subagents, hooks and settings
```

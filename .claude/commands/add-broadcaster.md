---
description: Add a broadcaster to the mock data, kept in sync across the API route and the MCP server
argument-hint: <broadcaster name> <domain>
---

Add the broadcaster $ARGUMENTS to the mock data.

The data exists in two places that have to stay identical:
1. `src/app/api/agent-chat/route.ts`, in the `broadcasterDatabase` object
2. `mcp-server.ts`, in the `broadcasterDatabase` object

Steps:
1. Read an existing entry (for example BBC) and copy its exact shape. Don't add or rename fields.
2. Add the new entry to both files with realistic, clearly labeled sample values.
3. Recompile the MCP server: `npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs --skipLibCheck`.
4. Check that both objects now contain the same set of keys, and report any mismatch.
5. Add a case-insensitive search scenario for the new broadcaster to `tests/broadcaster-search-case-insensitive.spec.ts`.

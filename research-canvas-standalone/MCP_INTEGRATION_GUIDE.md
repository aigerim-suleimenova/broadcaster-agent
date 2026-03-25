# MCP Integration Guide for ResearchCanvas Dashboard

## Overview

You now have a fully integrated MCP (Model Context Protocol) system that powers your interactive ResearchCanvas dashboard with real-time broadcaster data, analysis tools, and metrics generation.

## Architecture

```
┌─────────────────────────────┐
│   ResearchCanvas Dashboard  │
│     (React Component)       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   MCP Hooks (useMCPTools)   │
│  - useBroadcasterAnalysis   │
│  - useDashboardSummary      │
│  - useSearchBroadcasters    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Next.js API Route         │
│  /api/agent-chat            │
│  (MCP Tool Handlers)        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    MCP Server (Local)       │
│    mcp-server.ts            │
│  (Tool Definitions)         │
└─────────────────────────────┘
```

## Available MCP Tools

### 1. **analyze_broadcaster**
Analyzes a broadcaster and generates comprehensive metrics.

```typescript
// Usage
const { data, loading, analyze } = useBroadcasterAnalysis("BBC");
const result = await analyze();

// Returns:
{
  broadcasterName: "BBC",
  domain: "bbc.com",
  networkSnapshot: { ... },
  audienceProfile: { ... },
  strategicContext: { ... },
  coreMetrics: [ ... ],
  regionalBreakdown: [ ... ],
  riskAssessment: { ... }
}
```

### 2. **generate_metrics**
Generates performance metrics for any broadcaster or research query.

```typescript
const { data, loading, error, callTool } = useMCPTool("generate_metrics");
const metrics = await callTool({ query: "Paramount", includeRiskAssessment: true });
```

### 3. **fetch_broadcaster_data**
Fetches real-time broadcaster data from ads.txt analysis.

```typescript
const { data, loading, fetch } = useBroadcasterData("bbc.com");
const data = await fetch();
// Returns: { domain, adsTxtAnalysis { timestamp, ssps, adServers, status } }
```

### 4. **search_broadcasters**
Searches for broadcasters matching criteria.

```typescript
const { data, loading, search } = useSearchBroadcasters();
const results = await search("paramount", "north america", 10);
// Returns: { query, region, resultCount, results[] }
```

### 5. **get_dashboard_summary**
Gets a complete dashboard summary with all metrics.

```typescript
const { data, loading, fetch } = useDashboardSummary("BBC");
const summary = await fetch();
// Returns: { broadcaster, domain, keyMetrics, topRegions, riskLevel, ... }
```

## Getting Started

### 1. Install Dependencies

```bash
cd research-canvas-standalone
npm install
# or
pnpm install
```

### 2. Compile MCP Server

The MCP server needs to be compiled to JavaScript:

```bash
# Build the TypeScript MCP server
npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs

# Or use tsx for development
npm install -D tsx
npx tsx mcp-server.ts
```

### 3. Update MCP Configuration

The `mcp.json` file is already configured to use your local MCP server:

```json
{
  "servers": {
    "research-canvas-mcp": {
      "type": "stdio",
      "command": "/usr/bin/node",
      "args": ["mcp-server.js"],
      "env": {}
    }
  }
}
```

### 4. Run the Development Server

```bash
npm run dev
# This starts both the UI (port 3000) and Python agent (port 8000)
```

### 5. Open the Dashboard

Navigate to `http://localhost:3000` and start typing a broadcaster name (BBC, Paramount, Al Jazeera, etc.)

## How to Use in Components

### Example 1: Using MCP Hooks in a Component

```typescript
import { useBroadcasterAnalysis } from "@/lib/useMCPTools";

export function MyComponent() {
  const broadcasterName = "BBC";
  const { data, loading, error, analyze } = useBroadcasterAnalysis(broadcasterName);

  useEffect(() => {
    analyze();
  }, []);

  if (loading) return <div>Loading metrics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{data?.broadcasterName}</h1>
      <p>Revenue: {data?.networkSnapshot.revenue}</p>
    </div>
  );
}
```

### Example 2: Direct Tool Call

```typescript
import { useMCPTool } from "@/lib/useMCPTools";

export function CustomSearch() {
  const { data, loading, error, callTool } = useMCPTool("search_broadcasters");

  const handleSearch = async (keyword: string) => {
    await callTool({ keyword, limit: 5 });
  };

  return (
    <div>
      <button onClick={() => handleSearch("paramount")}>Search</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Extending the Dashboard

### Adding New MCP Tools

1. **Define the tool in `mcp-server.ts`:**

```typescript
const tools: Tool[] = [
  {
    name: "my_new_tool",
    description: "Description of what it does",
    inputSchema: {
      type: "object",
      properties: {
        param1: { type: "string", description: "..." }
      },
      required: ["param1"]
    }
  }
];
```

2. **Implement the handler in `mcp-server.ts`:**

```typescript
case "my_new_tool": {
  const result = await handleMyNewTool(args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
```

3. **Add implementation in `/api/agent-chat/route.ts`:**

```typescript
async function handleMyNewTool(args: Record<string, any>) {
  // Your implementation here
  return { /* result */ };
}
```

4. **Create a hook in `useMCPTools.ts`:**

```typescript
export function useMyNewTool() {
  const { data, loading, error, callTool } = useMCPTool("my_new_tool");

  const execute = useCallback(async (param1: string) => {
    return callTool({ param1 });
  }, [callTool]);

  return { data, loading, error, execute };
}
```

### Adding Real Data Sources

Replace the `broadcasterDatabase` in both `mcp-server.ts` and `/api/agent-chat/route.ts` with real API calls:

```typescript
async function handleAnalyzeBroadcaster(args: Record<string, any>) {
  const broadcasterName = args.broadcasterName as string;

  // Call your real API
  const response = await fetch(`https://your-api.com/broadcasters/${broadcasterName}`);
  const data = await response.json();

  return data;
}
```

## Dashboard Features

### Automatic Metrics Generation
- Type a broadcaster name and metrics auto-generate
- Real-time analysis with loading indicator
- Fallback to local data if API fails

### Resource Management
- Add/edit/remove research resources
- Auto-extract URLs from reports
- Organize resources by type

### Risk Assessment
- Low/medium/high risk levels
- Key risk factors displayed
- Migration timeline recommendations

### Regional Analysis
- Geographic reach breakdown
- Regional audience distribution
- Multi-region support

## Performance Tips

1. **Caching**: The hooks cache results. Clear cache by changing the broadcaster name.

2. **Batch Operations**: Group multiple tool calls:
```typescript
const broadcasters = ["BBC", "Paramount", "Al Jazeera"];
const results = await Promise.all(
  broadcasters.map(name => useBroadcasterAnalysis(name).analyze())
);
```

3. **Error Handling**: Always wrap MCP calls in try-catch:
```typescript
try {
  const result = await analyze();
} catch (error) {
  console.error("MCP tool failed:", error);
  // Use fallback data
}
```

## Troubleshooting

### MCP Server Not Starting
```bash
# Check Node.js version
node --version  # Should be v18+

# Recompile MCP server
npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs
```

### Tools Not Available
- Check `mcp.json` configuration
- Verify MCP server is running: `node mcp-server.js`
- Check browser console for errors

### Slow Performance
- Check network tab in DevTools
- Verify API responses are cached appropriately
- Consider adding pagination for search results

### Data Not Updating
- Clear browser cache
- Check that broadcaster name is 2+ characters
- Verify `/api/agent-chat` endpoint is responding

## Files Modified/Created

- ✅ `mcp-server.ts` - MCP server with tool definitions
- ✅ `src/lib/useMCPTools.ts` - React hooks for MCP tools
- ✅ `src/app/api/agent-chat/route.ts` - API endpoint for tool execution
- ✅ `src/components/ResearchCanvas.tsx` - Updated with MCP integration
- ✅ `mcp.json` - MCP server configuration

## Next Steps

1. **Integrate Real Data**: Connect to your actual broadcaster database and ads.txt analyzers
2. **Add Authentication**: Secure your MCP tools with API keys/OAuth
3. **Enhance Analytics**: Add more metrics and dashboard visualizations
4. **Deploy**: Set up CI/CD to deploy MCP server and Next.js app
5. **Monitor**: Add telemetry to track tool usage and performance

## Support & Resources

- MCP Documentation: https://modelcontextprotocol.io
- CopilotKit: https://copilotkit.ai
- LangGraph: https://langchain-ai.github.io/langgraph/

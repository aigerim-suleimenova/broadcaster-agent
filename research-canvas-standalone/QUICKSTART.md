# MCP ResearchCanvas Dashboard - Quick Start

## ⚡ 5-Minute Setup

### Step 1: Compile the MCP Server

```bash
cd research-canvas-standalone

# Option A: Using TypeScript Compiler
npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs

# Option B: Using tsx (recommended for development)
npm install -D tsx
npx tsx mcp-server.ts
```

### Step 2: Start the Development Server

```bash
npm run dev
# This starts:
# - UI at http://localhost:3000
# - Python agent at http://localhost:8000
# - MCP server ready for connections
```

### Step 3: Try It Out!

1. Open http://localhost:3000
2. Type a broadcaster name: **BBC**, **Paramount**, or **Al Jazeera**
3. Watch the dashboard auto-populate with metrics! 📊

## 🎯 What's Working Now

✅ **Auto-loading metrics** - Type a broadcaster name and metrics appear instantly
✅ **Interactive dashboard** - View audience, revenue, SSPs, and risk assessment
✅ **Real-time analysis** - Loading indicators while fetching data
✅ **Resource management** - Add, edit, and track research resources
✅ **Fallback system** - Uses cached data if API is unavailable

## 📊 Dashboard Features

| Feature | What It Shows |
|---------|---------------|
| **Broadcaster Analysis** | Core metrics, reach, engagement, revenue, growth |
| **Risk Assessment** | Migration difficulty and key risk factors |
| **Regional Breakdown** | Geographic distribution of audience |
| **Strategic Context** | SSP partners, ad servers, tech stack |
| **Resources** | Organized URLs and research materials |

## 🔧 Key Files

```
research-canvas-standalone/
├── mcp-server.ts                      ← MCP server definition
├── src/
│   ├── lib/
│   │   └── useMCPTools.ts             ← React hooks for MCP
│   ├── app/api/
│   │   └── agent-chat/route.ts        ← API bridge to MCP
│   └── components/
│       └── ResearchCanvas.tsx         ← Updated with MCP
├── mcp.json                           ← MCP configuration
└── MCP_INTEGRATION_GUIDE.md           ← Full documentation
```

## 🚀 Common Tasks

### Add a New Broadcaster to Database

Edit **`src/app/api/agent-chat/route.ts`** and **`mcp-server.ts`**:

```typescript
// Add to broadcasterDatabase
"netflix": {
  broadcasterName: "Netflix",
  domain: "netflix.com",
  // ... add metrics here
}
```

### Connect to Real API

Replace `handleAnalyzeBroadcaster()` in `/api/agent-chat/route.ts`:

```typescript
async function handleAnalyzeBroadcaster(args: Record<string, any>) {
  const response = await fetch(`YOUR_API_ENDPOINT/${args.broadcasterName}`);
  return response.json();
}
```

### Use MCP Tools in Any Component

```typescript
import { useBroadcasterAnalysis } from "@/lib/useMCPTools";

export function MyComponent() {
  const { data, loading, analyze } = useBroadcasterAnalysis("BBC");

  useEffect(() => {
    analyze();
  }, []);

  return <div>{loading ? "Loading..." : data?.broadcasterName}</div>;
}
```

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs --skipLibCheck
```

### Port 3000/8000 already in use
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Metrics not loading
1. Check browser console for errors (F12)
2. Verify `/api/agent-chat` is responding
3. Check that broadcaster name is 2+ characters

## 📈 Next: Make It Real

1. **Connect Real Data**: Integrate with your broadcaster database
2. **Add Authentication**: Protect your MCP tools with API keys
3. **Deploy**: Push to production using your deployment method
4. **Monitor**: Track tool usage and performance

## 💡 Pro Tips

- The dashboard **auto-caches** results - no redundant API calls
- Type `BBC`, `Paramount`, or `Al Jazeera` to see pre-loaded data
- Add custom broadcasters in the database to extend functionality
- Use the React DevTools to inspect component state

## 📞 Need Help?

Check **MCP_INTEGRATION_GUIDE.md** for:
- Full API documentation
- Advanced customization
- Performance tips
- Deployment guide

---

**Happy building! 🚀** Your ResearchCanvas is now powered by MCP.

# MCP Integration Verification Checklist

## Pre-Launch Verification

Use this checklist to verify everything is set up correctly before running.

### ✅ Files Created
- [ ] `mcp-server.ts` - MCP server with tool definitions
- [ ] `src/lib/useMCPTools.ts` - React hooks for MCP
- [ ] `src/app/api/agent-chat/route.ts` - API endpoint
- [ ] `mcp.json` - MCP configuration (updated)
- [ ] Documentation files created:
  - [ ] `MCP_INTEGRATION_GUIDE.md`
  - [ ] `QUICKSTART.md`
  - [ ] `MCP_INTEGRATION_SETUP.md`
  - [ ] `MCP_INTEGRATION_VERIFICATION.md` (this file)

### ✅ Code Updates
- [ ] ResearchCanvas.tsx imports updated with MCP hooks
- [ ] ResearchCanvas.tsx uses useBroadcasterAnalysis hook
- [ ] ResearchCanvas.tsx shows loading state
- [ ] ResearchCanvas.tsx has fallback metrics function

### ✅ Configuration
- [ ] mcp.json includes "research-canvas-mcp" server
- [ ] MCP server command points to node executable
- [ ] MCP server args include "mcp-server.js"

## Pre-Compilation Checklist

### Node & Package Manager
```bash
# Check Node version (should be 18+)
node --version

# Check npm/pnpm version
npm --version
# or
pnpm --version
```

### Dependencies Installed
```bash
# Navigate to project
cd research-canvas-standalone

# Check if packages installed
ls node_modules
# Should see many packages including @modelcontextprotocol/sdk
```

**Fix if needed:**
```bash
npm install
# or
pnpm install
```

## Compilation Checklist

### Option A: TypeScript Compiler
```bash
cd research-canvas-standalone

# Run this command
npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs

# Verify output
ls mcp-server.js
# Should exist and be >0 bytes
```

### Option B: tsx (Development)
```bash
cd research-canvas-standalone

# Install if needed
npm install -D tsx

# Run MCP server (will show errors if any)
npx tsx mcp-server.ts
# Should show: "Research Canvas MCP Server running on stdio"
```

## Runtime Checklist

### Start Development Server
```bash
npm run dev

# You should see:
# - "UI running at http://localhost:3000"
# - "Agent running at http://localhost:8000"
# Both should be ready
```

### Port Verification
```bash
# Check if ports are available
lsof -i :3000  # Should be Next.js
lsof -i :8000  # Should be Python agent
lsof -i :5173  # MCP if using default

# If ports in use, kill them:
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

## Dashboard Testing Checklist

### Basic Functionality
- [ ] Open http://localhost:3000
- [ ] Dashboard loads without errors
- [ ] Input field for "Broadcaster Name" is visible
- [ ] Type "BBC" in the input
- [ ] Metrics start loading (spinner appears)
- [ ] Metrics display after loading completes
- [ ] Charts render properly

### Data Verification
```javascript
// Open browser console (F12) and verify data:

// Should show BBC metrics
{
  "broadcasterName": "BBC",
  "domain": "bbc.com",
  "networkSnapshot": {
    "audienceSize": "500M+",
    "revenue": "5.2B GBP",
    ...
  }
}
```

### Try Other Broadcasters
- [ ] Type "Paramount" → Metrics load
- [ ] Type "Al Jazeera" → Metrics load
- [ ] Type custom name (e.g., "Netflix") → Fallback metrics appear
- [ ] Clear input → Metrics disappear

### Resource Management
- [ ] Click "Add Resource" button
- [ ] Add a URL
- [ ] Resource card appears in list
- [ ] Click resource to edit
- [ ] Click "X" to delete resource

## Error Investigation

### If Metrics Don't Load:

1. **Check Browser Console** (F12 → Console tab):
```javascript
// Look for errors like:
// - "Cannot call useBroadcasterAnalysis"
// - Network errors
// - Unknown tool errors
```

2. **Check Network Tab** (F12 → Network):
```
// Should see POST to /api/agent-chat
// Status should be 200
// Response should have "success": true
```

3. **Check Terminal Output**:
```
# Next.js terminal should show requests
# No errors in server output
```

### If MCP Server Fails:

```bash
# Try running directly to see errors
cd research-canvas-standalone
node mcp-server.js
# Should print: "Research Canvas MCP Server running on stdio"

# If fails, try recompiling:
npx tsc mcp-server.ts --outDir . --target ES2020 --module commonjs --skipLibCheck
```

## API Testing Checklist

### Test /api/agent-chat Endpoint

```bash
# Test analyze_broadcaster tool
curl -X POST http://localhost:3000/api/agent-chat \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "analyze_broadcaster",
    "args": { "broadcasterName": "BBC" },
    "action": "callMCPTool"
  }'

# Expected response:
# {"success": true, "data": {...BBC data...}}
```

```bash
# Test search_broadcasters tool
curl -X POST http://localhost:3000/api/agent-chat \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "search_broadcasters",
    "args": { "keyword": "paramount", "limit": 5 },
    "action": "callMCPTool"
  }'

# Expected response:
# {"success": true, "data": {"query": "paramount", ...}}
```

## Final Verification Steps

1. **Clear Cache**
```bash
# Clear browser cache or use incognito mode
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

2. **Verify File Permissions**
```bash
# Check if files are readable
ls -la mcp-server.ts
ls -la mcp-server.js  # After compilation
```

3. **Test Full Flow**
- [ ] Start dev server
- [ ] Open dashboard
- [ ] Type broadcaster name
- [ ] See metrics load
- [ ] Add resources
- [ ] View analysis
- [ ] No console errors

## Success Criteria

Your MCP integration is **ready** when:

✅ All files are created and in correct locations
✅ MCP server compiles without errors
✅ Dev server starts on ports 3000 and 8000
✅ Dashboard loads at http://localhost:3000
✅ Typing "BBC" shows metrics instantly
✅ No errors in browser console
✅ No errors in terminal output
✅ All broadcaster names work (BBC, Paramount, Al Jazeera)
✅ Custom broadcaster names show fallback metrics
✅ Resources can be added/edited/deleted
✅ /api/agent-chat responds with data

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run tsc compilation command |
| Port already in use | Kill existing process with lsof |
| Metrics not loading | Check /api/agent-chat endpoint in Network tab |
| MCP server won't start | Recompile with `--skipLibCheck` flag |
| Blank dashboard | Check browser console for errors |
| Slow loading | Check if API is responding (Network tab) |

## Post-Launch Optimization

After verification passes:

1. **Performance**: Measure load times in Network tab
2. **Caching**: Monitor if results are cached properly
3. **Error Handling**: Test with invalid inputs
4. **Scalability**: Test with many broadcasters
5. **Production**: Consider compression, CDN, caching headers

## Documentation Links

- Detailed guide: `MCP_INTEGRATION_GUIDE.md`
- Quick start: `QUICKSTART.md`
- Setup summary: `MCP_INTEGRATION_SETUP.md`
- TypeScript MCP SDK: https://modelcontextprotocol.io

---

**Verification Status: Ready to Begin Checklist** ✅

Once you complete this checklist, your MCP integration is production-ready!

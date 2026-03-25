# AI Chat Dashboard - Technical Integration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                            │
│  AIChatDashboard.tsx                                         │
│  - Chat input textarea                                       │
│  - Suggested prompts                                         │
│  - Quick action buttons                                      │
│  - Message history display                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               CopilotKit Action Layer                        │
│  useCopilotAction() hooks:                                   │
│  - search_broadcaster                                        │
│  - compare_broadcasters                                      │
│  - get_dashboard_summary                                     │
│  - analyze_metrics                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           ResearchCanvas State Management                    │
│  - research_question (current broadcaster)                   │
│  - broadcaster_metrics (current metrics)                     │
│  - comparedBroadcasters (for comparison view)                │
│  - comparisonMetrics (multiple broadcaster data)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            MCP Tools Layer                                   │
│  /api/agent-chat route.ts                                    │
│  - analyze_broadcaster (fetch metrics)                       │
│  - generate_metrics (create new metrics)                     │
│  - search_broadcasters (find broadcasters)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         Broadcaster Database                                 │
│  broadcasterDatabase: Record<string, BroadcasterMetrics>     │
│  - BBC, Paramount, Al Jazeera pre-loaded                    │
│  - Extensible with new entries                              │
└─────────────────────────────────────────────────────────────┘
```

## Component API

### AIChatDashboard Props

```typescript
interface AIChatDashboardProps {
  currentBroadcaster: string;        // Name of broadcaster being analyzed
  onBroadcasterSelect: (name: string) => void;  // Called when user selects a broadcaster
  onCompare: (broadcasters: string[]) => void;  // Called when comparing multiple
  isLoading?: boolean;               // Shows loading spinner
}
```

### Usage in ResearchCanvas

```typescript
<AIChatDashboard
  currentBroadcaster={state.research_question || ""}
  onBroadcasterSelect={handleBroadcasterSelect}
  onCompare={handleCompareBroadcasters}
  isLoading={metricsLoading}
/>
```

## Data Flow

### 1. Search Broadcaster Flow

```
User: "Search for BBC"
   ↓
CopilotKit parses intent
   ↓
search_broadcaster action triggered
   ↓
handleBroadcasterSelect("BBC") called
   ↓
setState({ research_question: "BBC" })
   ↓
useEffect detects change in research_question
   ↓
analyzeBroadcaster hook called
   ↓
POST /api/agent-chat with analyze_broadcaster tool
   ↓
Tool returns BroadcasterMetrics data
   ↓
Dashboard updates with BBC metrics
```

### 2. Comparison Flow

```
User: "Compare BBC and Paramount"
   ↓
CopilotKit parses intent & extracts ["BBC", "Paramount"]
   ↓
compare_broadcasters action triggered
   ↓
handleCompareBroadcasters(["BBC", "Paramount"]) called
   ↓
For each broadcaster:
  - Fetch /api/agent-chat with broadcaster name
  - Store result in comparisonMetrics map
   ↓
setComparedBroadcasters(["BBC", "Paramount"])
   ↓
useEffect renders comparison view
   ↓
Side-by-side metrics displayed
```

## CopilotKit Actions

### search_broadcaster

```typescript
useCopilotAction({
  name: "search_broadcaster",
  description: "Search for and analyze a specific broadcaster",
  parameters: [{
    name: "broadcaster_name",
    type: "string",
    required: true,
  }],
  handler: ({ broadcaster_name }) => {
    onBroadcasterSelect(broadcaster_name);
    return `Now analyzing ${broadcaster_name}...`;
  }
});
```

**Triggered by:** "Search for BBC", "Analyze Paramount", "Find Netflix"

### compare_broadcasters

```typescript
useCopilotAction({
  name: "compare_broadcasters",
  description: "Compare metrics of multiple broadcasters",
  parameters: [{
    name: "broadcasters",
    type: "string[]",
    required: true,
  }],
  handler: ({ broadcasters }) => {
    onCompare(broadcasters);
    return `Comparing ${broadcasters.join(", ")}...`;
  }
});
```

**Triggered by:** "Compare BBC and Paramount", "Show differences between..."

### get_dashboard_summary

```typescript
useCopilotAction({
  name: "get_dashboard_summary",
  description: "Get a summary of current broadcaster metrics",
  parameters: [],
  handler: async () => {
    return `Getting summary for ${currentBroadcaster}...`;
  }
});
```

**Triggered by:** "Show me a summary", "What are the key metrics?"

### analyze_metrics

```typescript
useCopilotAction({
  name: "analyze_metrics",
  description: "Analyze specific aspects of broadcaster metrics",
  parameters: [{
    name: "focus_area",
    type: "string", // 'audience', 'revenue', 'risk', 'technology', 'all'
  }],
  handler: ({ focus_area }) => {
    return `Analyzing ${focus_area} metrics for ${currentBroadcaster}...`;
  }
});
```

**Triggered by:** "What's the risk?", "Show revenue metrics", "Technology stack?"

## Key Integration Points

### ResearchCanvas Integration

1. **Initialization**
   ```typescript
   import { AIChatDashboard } from "./AIChatDashboard";
   ```

2. **State Management**
   ```typescript
   const [comparedBroadcasters, setComparedBroadcasters] = useState<string[]>([]);
   const [comparisonMetrics, setComparisonMetrics] = useState<Record<string, BroadcasterMetrics>>({});
   ```

3. **Handler Functions**
   ```typescript
   const handleBroadcasterSelect = (name: string) => {
     setState({ ...state, research_question: name });
   };

   const handleCompareBroadcasters = async (broadcasters: string[]) => {
     // Fetch metrics for each broadcaster
     // Update comparisonMetrics state
   };
   ```

4. **Component Rendering**
   ```typescript
   <AIChatDashboard
     currentBroadcaster={state.research_question || ""}
     onBroadcasterSelect={handleBroadcasterSelect}
     onCompare={handleCompareBroadcasters}
     isLoading={metricsLoading}
   />
   ```

### MCP API Integration

The `/api/agent-chat` route already supports:

```typescript
POST /api/agent-chat
{
  "tool": "analyze_broadcaster",
  "args": { "broadcaster_name": "BBC" }
}
```

The `handleCompareBroadcasters` function uses this endpoint:

```typescript
const response = await fetch("/api/agent-chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tool: "analyze_broadcaster",
    args: { broadcaster_name: broadcaster },
  }),
});
```

## TypeScript Types

```typescript
// BroadcasterMetrics (from lib/types.ts)
interface BroadcasterMetrics {
  broadcasterName: string;
  domain: string;
  networkSnapshot: {
    audienceSize: string;
    revenue: string;
    platformCount: number;
    coverage: string;
  };
  audienceProfile: {
    primaryDemographic: string;
    secondaryDemographic: string;
    geographicReach: string[];
    engagementRate: string;
  };
  strategicContext: {
    sspPartners: string[];
    adServers: string[];
    technology: string[];
  };
  coreMetrics: Array<{ label: string; value: number }>;
  regionalBreakdown: Array<{ region: string; value: number }>;
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
}

// Component Props
interface AIChatDashboardProps {
  currentBroadcaster: string;
  onBroadcasterSelect: (name: string) => void;
  onCompare: (broadcasters: string[]) => void;
  isLoading?: boolean;
}
```

## File Changes Summary

### New Files
- `src/components/AIChatDashboard.tsx` - AI Chat component (~200 lines)

### Modified Files
- `src/components/ResearchCanvas.tsx` - Added:
  - Import of AIChatDashboard
  - Comparison state management
  - Handler functions
  - Comparison view rendering
  - AIChatDashboard component

### Documentation
- `AI_CHAT_GUIDE.md` - User guide
- `AI_CHAT_INTEGRATION.md` - This technical guide

## Testing the Integration

### Manual Testing

1. **Test Search**
   ```
   Type in chat: "Search for BBC"
   Expected: Dashboard loads BBC metrics
   ```

2. **Test Comparison**
   ```
   Type in chat: "Compare BBC and Paramount"
   Expected: Side-by-side comparison cards appear
   ```

3. **Test Suggested Prompts**
   ```
   Click any suggested prompt chip
   Expected: Prompt is filled in, ready to send
   ```

### Debugging

Enable logging to see CopilotKit action execution:

```typescript
// Add to browser console
localStorage.debug = 'copilot:*'

// Or check ResearchCanvas logs
console.log('📺 Selecting broadcaster:', name);
console.log('📊 Comparing broadcasters:', broadcasters);
```

## Performance Considerations

1. **Comparison View**
   - Fetches metrics sequentially for each broadcaster
   - Consider batch fetching for 3+ broadcasters
   - Currently limited to first 5 messages in history

2. **Message History**
   - Only displays last 5 messages to keep UI fast
   - Expand/collapse manages visibility

3. **API Calls**
   - One API call per broadcaster in comparison
   - Caching via MCP reduces redundant calls

## Future Enhancements

1. **Voice Input**
   - Integrate Web Speech API with chat input
   - "Press to speak" button in AIChatDashboard

2. **Export Reports**
   - Generate PDF comparison reports
   - Export metrics as CSV

3. **Advanced Filtering**
   - "Show only high-risk broadcasters"
   - "Filter by geographic region"

4. **Persistent Chat History**
   - Store conversation in localStorage
   - Resume previous conversations

5. **Real-time Collaboration**
   - Share comparison links with team
   - Multi-user dashboard control

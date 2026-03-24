# How to Make the Agent Produce Broadcaster Metrics

## Overview

The broadcaster metrics generation system works in three parts:

1. **Python Agent Backend** - Parses research data and generates metrics
2. **TypeScript Frontend** - Displays the metrics in a visual dashboard
3. **CopilotKit Integration** - Syncs the metrics between backend and UI

---

## How It Works

### Flow Diagram

```
User Input (Broadcaster Name)
         ↓
Agent Chat Node (processes research)
         ↓
Metrics Parser (extracts data from report)
         ↓
WriteBroadcasterMetrics Tool (signals to emit)
         ↓
CopilotKit Intermediate State Emission
         ↓
Frontend Updates & Displays BroadcasterAnalysis Component
```

---

## Backend Components

### 1. Python Agent State (`agents/python/src/lib/state.py`)

Added `broadcaster_metrics` field to store structured metrics:

```python
class AgentState(MessagesState):
    model: str
    research_question: str
    report: str
    resources: List[Resource]
    logs: List[Log]
    broadcaster_metrics: Optional[dict] = None  # ← NEW FIELD
```

### 2. Metrics Parser (`agents/python/src/lib/metrics_parser.py`)

Extracts information from research reports using regex patterns:

```python
def parse_broadcaster_metrics(report: str, research_question: str) -> Optional[Dict]:
    """
    Parses a research report into structured BroadcasterMetrics.

    Extracts:
    - Broadcaster name & domain
    - Network snapshot (audience, revenue, platforms, coverage)
    - Audience profile (demographics, geography, engagement)
    - Strategic context (SSP partners, ad servers, technology)
    - Core metrics (performance indicators)
    - Regional breakdown
    - Risk assessment
    """
```

**Key Functions:**
- `extract_broadcaster_name()` - Finds broadcaster from question/report
- `extract_domain()` - Extracts domain from URLs
- `extract_network_snapshot()` - Audience size, revenue, platforms
- `extract_audience_profile()` - Demographics and engagement
- `extract_strategic_context()` - Partners, ad servers, tech stack
- `extract_core_metrics()` - Performance KPIs
- `extract_regional_breakdown()` - Geographic distribution
- `extract_risk_assessment()` - Compatibility risk level

### 3. Chat Node Integration (`agents/python/src/lib/chat.py`)

**Added WriteBroadcasterMetrics Tool:**
```python
@tool
def WriteBroadcasterMetrics(metrics_json: str) -> str:
    """Write broadcaster metrics data for visualization."""
    return "ok"
```

**Updated CopilotKit Configuration:**
```python
config = copilotkit_customize_config(
    config,
    emit_intermediate_state=[
        {
            "state_key": "report",
            "tool": "WriteReport",
            "tool_argument": "report",
        },
        {
            "state_key": "broadcaster_metrics",  # ← NEW
            "tool": "WriteBroadcasterMetrics",
            "tool_argument": "metrics_json",
        },
    ],
)
```

**Automatic Metrics Generation:**
When the report is written, metrics are automatically parsed:
```python
if ai_message.content and len(ai_message.content) > 50 and not report:
    new_report = ai_message.content

    # Parse broadcaster metrics from the new report
    broadcaster_metrics = parse_broadcaster_metrics(new_report, research_question)
    metrics_json = json.dumps(broadcaster_metrics) if broadcaster_metrics else None

    update_data = {
        "report": new_report,
        "messages": [ai_message],
    }

    if metrics_json:
        update_data["broadcaster_metrics"] = broadcaster_metrics
```

---

## Frontend Components

### 1. TypeScript Types (`src/lib/types.ts`)

```typescript
export type BroadcasterMetrics = {
  broadcasterName: string;
  domain: string;
  networkSnapshot: {
    audienceSize: string;      // e.g., "430M+"
    revenue: string;           // e.g., "$2.4B"
    platformCount: number;     // e.g., 70
    coverage: string;          // e.g., "49M+"
  };
  audienceProfile: {
    primaryDemographic: string;         // e.g., "Ages 18-54"
    secondaryDemographic: string;       // e.g., "Core demo: affluent viewers"
    geographicReach: string[];          // ["MENA", "Europe", "Americas"]
    engagementRate: string;             // "57%"
  };
  strategicContext: {
    sspPartners: string[];              // ["Google", "Magnite", ...]
    adServers: string[];                // ["Google DFP", ...]
    technology: string[];               // ["React", "Node.js", ...]
  };
  coreMetrics: Array<{
    label: string;                      // "Reach", "Engagement", etc.
    value: number;                      // 0-100
  }>;
  regionalBreakdown: Array<{
    region: string;                     // "MENA", "Europe", etc.
    value: number;                      // Percentage
  }>;
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
};

export type AgentState = {
  model: string;
  research_question: string;
  report: string;
  resources: any[];
  logs: any[];
  broadcaster_metrics?: BroadcasterMetrics | null;  // ← NEW
};
```

### 2. Broadcaster Analysis Component (`src/components/generative-ui/BroadcasterAnalysis.tsx`)

A comprehensive React component that displays:
- **Network Snapshot** - 4 KPI cards with gradient backgrounds
- **Audience Profile** - Demographics, geographic reach, engagement
- **Strategic Context** - SSP partners, ad servers, tech stack (as tags)
- **Core Metrics Chart** - Bar chart visualization
- **Regional Breakdown** - Pie chart visualization
- **Risk Assessment** - Color-coded risk level with factors

```typescript
export function BroadcasterAnalysis({ data, status = "complete" }: BroadcasterAnalysisProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Network Snapshot */}
      <Card>
        {/* 4 gradient KPI cards */}
      </Card>

      {/* Audience & Strategic Context */}
      <div className="grid grid-cols-2">
        {/* Left: Audience Profile */}
        {/* Right: Strategic Context */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2">
        {/* Left: Core Metrics Bar Chart */}
        {/* Right: Regional Breakdown Pie Chart */}
      </div>

      {/* Risk Assessment */}
      <Card>
        {/* Color-coded risk level and factors */}
      </Card>
    </div>
  );
}
```

### 3. Research Canvas Integration (`src/components/ResearchCanvas.tsx`)

Displays metrics when available, falls back to text draft:

```typescript
{state.broadcaster_metrics ? (
  <BroadcasterAnalysis data={state.broadcaster_metrics} />
) : (
  <Textarea value={state.report} ... />  // Text draft fallback
)}
```

---

## Data Flow Example

### Input
```
User Research Question: "Analyze Al Jazeera broadcaster metrics"
```

### Agent Processing
1. **Chat Node** processes question using LLM
2. **LLM Response** includes specific metrics/data
3. **Report Written** via WriteReport tool
4. **Metrics Parsed** via metrics_parser
5. **Metrics Emitted** via WriteBroadcasterMetrics tool

### Example Parsed Output
```json
{
  "broadcasterName": "Al Jazeera",
  "domain": "aljazeera.com",
  "networkSnapshot": {
    "audienceSize": "430M+",
    "revenue": "$2.4B",
    "platformCount": 70,
    "coverage": "49M+"
  },
  "audienceProfile": {
    "primaryDemographic": "Ages 18-54",
    "secondaryDemographic": "Core demo: affluent Arab viewers",
    "geographicReach": ["MENA", "Europe", "North America"],
    "engagementRate": "57%"
  },
  "strategicContext": {
    "sspPartners": ["Google", "Magnite", "OpenBidder"],
    "adServers": ["Google DFP", "Adtech"],
    "technology": ["React", "Node.js", "Kafka"]
  },
  "coreMetrics": [
    { "label": "Reach", "value": 85 },
    { "label": "Engagement", "value": 72 },
    { "label": "Revenue", "value": 68 },
    { "label": "Growth", "value": 80 }
  ],
  "regionalBreakdown": [
    { "region": "MENA", "value": 45 },
    { "region": "Europe", "value": 30 },
    { "region": "Americas", "value": 25 }
  ],
  "riskAssessment": {
    "level": "low",
    "factors": ["Compatible technology", "Strong SSP relationships"]
  }
}
```

### Frontend Display
The BroadcasterAnalysis component renders this data as:
- Network Snapshot cards
- Audience profile details
- Strategic context tags
- Performance charts
- Risk assessment badge

---

## How to Customize Metrics Parsing

### Adding New Extraction Functions

In `metrics_parser.py`, create extraction functions following the pattern:

```python
def extract_[metric_name](report: str) -> [type]:
    """Extract [metric_name] from research report"""

    patterns = [
        r"pattern1_to_match",
        r"pattern2_to_match",
    ]

    value = extract_number_metric(report, patterns, "default_value")
    return value
```

### Improving Pattern Matching

The parser uses regex patterns to extract data. Improve accuracy by:

1. **Adding more patterns** for different report formats
2. **Using word boundaries** (\b) for exact matches
3. **Case-insensitive matching** (re.IGNORECASE)
4. **Capturing groups** ((pattern)) to extract specific parts

Example improvements:
```python
# Better pattern for SSP extraction
r"(?:SSP|supply[\s\-]side platform)[\s:]*([A-Za-z0-9\s,\-&]+?)(?:\n|\.)"

# Case-insensitive domain extraction
r"(?i)(?:domain|url|website):\s*([a-z0-9.-]+)"
```

---

## Troubleshooting

### Metrics Not Showing
1. **Check Python agent logs** - Run `cd agents/python && uv run main.py`
2. **Verify metrics are parsing** - Add debug logs in metrics_parser.py
3. **Check CopilotKit sync** - Inspect browser console for state updates

### Incomplete Data
1. **Improve report quality** - Agent needs sufficient detail in report
2. **Add more extraction patterns** - Current patterns may not match your data format
3. **Provide more context** - More detailed research question helps agent understanding

### Charts Not Rendering
1. **Check sample data** - BroadcasterAnalysis has default data as fallback
2. **Verify chart imports** - Ensure bar-chart and pie-chart components exist
3. **Check Recharts library** - Verify recharts is installed in package.json

---

## Summary

The system automatically:
1. ✅ Accepts user research questions
2. ✅ Processes through LLM agent
3. ✅ Extracts metrics from generated report
4. ✅ Syncs metrics to frontend via CopilotKit
5. ✅ Displays interactive visual dashboard

No manual intervention needed—metrics are generated and displayed automatically as the agent completes its research!

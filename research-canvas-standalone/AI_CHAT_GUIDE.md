# AI Chat Dashboard Control - User Guide

## 🎤 Using AI Chat to Control Your Dashboard

Your ResearchCanvas now has an **AI Chat Control** panel that lets you naturally interact with the dashboard using natural language commands.

## 🚀 Getting Started

### 1. Open the Dashboard
- Start your dev server: `npm run dev`
- Navigate to http://localhost:3000
- The AI Chat panel appears at the top of the ResearchCanvas

### 2. Chat Commands

The AI Chat understands these types of commands:

#### Search Broadcasters
```
"Search for BBC"
"Analyze Paramount"
"Find Al Jazeera"
"Show me Netflix metrics"
```

#### Compare Broadcasters
```
"Compare BBC and Paramount"
"Compare Netflix, Disney, and Paramount"
"Show differences between BBC and Al Jazeera"
```

#### Analyze Metrics
```
"Show me the risk assessment"
"What's the audience reach?"
"Analyze revenue metrics"
"Focus on technology stack"
```

#### Get Summaries
```
"Give me a dashboard summary"
"What are the key metrics?"
"Show strategic context"
```

## 🎯 Quick Action Buttons

Below the chat input are quick buttons for common tasks:

| Button | Action |
|--------|--------|
| 🔍 **Search** | Search for a broadcaster |
| 📊 **Compare** | Compare two or more broadcasters |
| ⚠️ **Risk** | Show risk assessment |

## 💬 Suggested Prompts

Pre-built suggestions appear as chips that you can click:
- "Analyze BBC's audience metrics"
- "Compare Paramount and Netflix"
- "Show me the risk assessment"
- "Search for Al Jazeera"

## 🎨 Features

### Expandable Chat Window
- Click **Expand** to see full conversation history
- Click **Collapse** to minimize
- Last 5 messages are displayed when expanded

### Real-time Loading
- Shows loading spinner while fetching metrics
- Automatically updates dashboard when AI selects a broadcaster
- Comparison view shows metrics side-by-side

### Current Selection Display
Shows which broadcaster is currently being analyzed

## 🤖 How It Works Under the Hood

The AI Chat uses **CopilotKit actions** to:

1. **Parse your natural language** → Understands what you want
2. **Choose the right action** → Calls appropriate dashboard functions
3. **Update the dashboard** → Loads new metrics automatically
4. **Show results** → Displays metrics in the main dashboard area

### Available AI Actions

```typescript
// Search for a specific broadcaster
search_broadcaster(broadcaster_name: string)

// Compare multiple broadcasters side-by-side
compare_broadcasters(broadcasters: string[])

// Get summary of current broadcaster
get_dashboard_summary()

// Analyze specific metrics
analyze_metrics(focus_area: 'audience' | 'revenue' | 'risk' | 'technology' | 'all')
```

## 📊 Comparison View

When you ask to compare broadcasters:

1. AI fetches metrics for each broadcaster
2. Side-by-side comparison cards appear
3. Each card shows the broadcaster's:
   - Network snapshot (audience, revenue, platforms)
   - Audience profile
   - Risk assessment
   - Regional breakdown
   - Strategic context
4. Click **Clear** to dismiss the comparison

## 🎓 Example Workflow

```
1. User: "Compare BBC and Paramount"
   → AI fetches both broadcasters' data
   → Comparison view appears with side-by-side metrics

2. User: "BBC's audience is bigger, show me their risk assessment"
   → AI selects BBC
   → Dashboard highlights risk factors

3. User: "What technology do they use?"
   → Dashboard shows strategic context with tech stack

4. User: "Compare this with Al Jazeera"
   → AI fetches Al Jazeera data
   → New comparison view appears
```

## ⚙️ Customization

### Add More Broadcasters
Edit `/src/app/api/agent-chat/route.ts` and add to `broadcasterDatabase`:

```typescript
"netflix": {
  broadcasterName: "Netflix",
  domain: "netflix.com",
  networkSnapshot: { ... },
  // ... rest of metrics
}
```

### Add Custom Chat Prompts
Edit `AIChatDashboard.tsx` and modify `suggestedPrompts`:

```typescript
const suggestedPrompts = [
  "Your custom prompt here",
  "Another prompt",
];
```

### Modify AI Actions
Add new CopilotKit actions in `AIChatDashboard.tsx`:

```typescript
useCopilotAction({
  name: "custom_action",
  description: "What this does",
  parameters: [],
  handler: async () => {
    // Your custom logic here
  },
});
```

## 🐛 Troubleshooting

### Chat window not showing
- Verify CopilotKit is running: check browser console for errors
- Restart dev server: `npm run dev`

### AI not understanding commands
- Be specific: "Search for BBC" instead of "BBC"
- Use exact broadcaster names or close variations

### Metrics not loading
- Check `/api/agent-chat` endpoint is responding
- Verify broadcaster name is 2+ characters
- Check network tab in DevTools

### Comparison not appearing
- Ensure all broadcasters are in the database
- Check console for fetch errors
- Try searching individual broadcasters first

## 📈 Next Steps

1. **Add Real Data**: Connect to your broadcaster database API
2. **Train the AI**: Add more prompt examples for better understanding
3. **Custom Metrics**: Extend BroadcasterMetrics type with your data
4. **Voice Input**: Integrate speech-to-text with the chat
5. **Export Reports**: Generate comparison reports from chat

---

**Enjoy your AI-powered broadcaster dashboard!** 🚀

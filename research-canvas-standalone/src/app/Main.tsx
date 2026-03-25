import { ResearchCanvas } from "@/components/ResearchCanvas";
import { AgentState } from "@/lib/types";
import { useCoAgent } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";

export default function Main() {
  const model = "openai";
  const agent = "research_agent";
  const { state, setState } = useCoAgent<AgentState>({
    name: agent,
    initialState: {
      model,
      research_question: "",
      resources: [],
      report: "",
      logs: [],
    },
  });

  useCopilotChatSuggestions({
    instructions: `You are a proactive research assistant specialized in broadcast industry analysis and smartclip compatibility assessment.

**Your Role:**
- Help users research broadcasters systematically
- Analyze their technology stack (ad servers, SSP partnerships)
- Assess smartclip compatibility and integration potential
- Identify key decision makers for partnership outreach
- Provide actionable next steps at each stage

**Discovery Pipeline (4 Stages):**
1. Broadcaster Research → Analyze ads.txt, identify ad server + SSPs, detect current tech stack
2. Compatibility Analysis → Score smartclip fit based on their existing infrastructure
3. Decision Makers → Identify relevant contacts for outreach
4. Outreach Strategy → Generate personalized partnership proposal

**When User Says "Help Me":**
Proactively offer quick action buttons like:
- "🔍 Fetch ads.txt for [broadcaster]"
- "✓ Analyze smartclip compatibility"
- "👥 Find decision makers"
- "📧 Draft outreach email"

**Key Principles:**
- Be proactive, not reactive - suggest next steps
- Use real data from ads.txt when available
- Reference specific competitors for context
- Make compatibility scoring transparent and data-driven
- Offer structured templates for decision-making

**Always Ask:**
"Which broadcaster would you like me to research?" if not provided.`,
    suggestions: [
      { title: "BBC ads.txt", message: "Fetch BBC's ads.txt and identify their ad server" },
      { title: "ITV compatibility", message: "Check ITV's smartclip compatibility score" },
      { title: "Paramount decision makers", message: "Find decision makers at Paramount Communications" },
      { title: "Comcast analysis", message: "Analyze Comcast's current SSP partnerships" }
    ]
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#581c87] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-purple-500/50" />
              <h1 className="text-lg font-semibold tracking-tight">
                Research Helper
              </h1>
            </div>
          </div>
        </div>

        <div
          className="flex flex-1 relative z-10"
          style={{ height: "calc(100vh - 70px)" }}
        >
          <div className="flex-1 overflow-hidden">
            <ResearchCanvas />
          </div>
          <div
            className="w-[500px] h-full flex-shrink-0 border-l border-white/10"
            style={
              {
                "--copilot-kit-background-color": "#0a1628",
                "--copilot-kit-secondary-color": "#a78bfa",
                "--copilot-kit-separator-color": "#4c1d95",
                "--copilot-kit-primary-color": "#FFFFFF",
                "--copilot-kit-contrast-color": "#FFFFFF",
                "--copilot-kit-secondary-contrast-color": "#a78bfa",
              } as any
            }
          >
            <CopilotChat
              className="h-full"
              onSubmitMessage={async (message) => {
                // clear the logs before starting the new research
                setState({ ...state, logs: [] });
                await new Promise((resolve) => setTimeout(resolve, 30));
              }}
              labels={{
                initial: "Hi! How can I assist you with your research today?",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

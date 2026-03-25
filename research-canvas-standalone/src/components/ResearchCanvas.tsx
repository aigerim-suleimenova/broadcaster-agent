"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCoAgent,
  useCoAgentStateRender,
  useCopilotAction,
  useCopilotChat,
} from "@copilotkit/react-core";
import { Progress } from "./Progress";
import { EditResourceDialog } from "./EditResourceDialog";
import { AddResourceDialog } from "./AddResourceDialog";
import { Resources } from "./Resources";
import { QuickActions, ResearchCanvasEmptyState, StatusBadge } from "./QuickActions";
import { BroadcasterAnalysis, BroadcasterMetrics } from "./generative-ui/BroadcasterAnalysis";
import { AIChatDashboard } from "./AIChatDashboard";
import { AgentState, Resource } from "@/lib/types";
import { Zap, FileText, Users, CheckCircle2, Loader } from "lucide-react";
import {
  useBroadcasterAnalysis,
  useDashboardSummary,
  useSearchBroadcasters,
} from "@/lib/useMCPTools";

export function ResearchCanvas() {
  const model = "openai";
  const agent = "research_agent";

  // Safely get append from useCopilotChat with optional chaining
  const chatContext = useCopilotChat();
  // NOTE: Properties like append and messages are not available on UseCopilotChatReturn in this version of CopilotKit
  // Use empty values as fallbacks
  const append = undefined;
  const messages: { role: string; content: string }[] = [];

  const { state, setState } = useCoAgent<AgentState>({
    name: agent,
    initialState: {
      model,
      research_question: "",
      resources: [],
      report: "",
      logs: [],
      broadcaster_metrics: null,
    },
  });

  // MCP Tools hooks
  const { data: metricsData, loading: metricsLoading, analyze: analyzeBroadcaster } = useBroadcasterAnalysis(state.research_question);
  const [mcpMetrics, setMcpMetrics] = useState<BroadcasterMetrics | null>(null);
  const [comparedBroadcasters, setComparedBroadcasters] = useState<string[]>([]);
  const [comparisonMetrics, setComparisonMetrics] = useState<Record<string, BroadcasterMetrics>>({});

  // Auto-fetch metrics from MCP when broadcaster name is entered
  useEffect(() => {
    if (state.research_question && state.research_question.trim().length > 2) {
      let isMounted = true;

      const fetchMetrics = async () => {
        try {
          const result = await analyzeBroadcaster();
          if (isMounted && result) {
            setMcpMetrics(result);
            setState({ ...state, broadcaster_metrics: result });
          }
        } catch (error) {
          console.error("Error fetching MCP metrics:", error);
          // Fallback to local generation if MCP fails
          const fallbackMetrics = generateFallbackMetrics(state.research_question);
          if (isMounted) {
            setMcpMetrics(fallbackMetrics);
            setState({ ...state, broadcaster_metrics: fallbackMetrics });
          }
        }
      };

      fetchMetrics();

      return () => {
        isMounted = false;
      };
    } else {
      setMcpMetrics(null);
      setState({ ...state, broadcaster_metrics: null });
    }
  }, [state.research_question, state]);

  // Fallback metrics generator if MCP is unavailable
  const generateFallbackMetrics = (broadcasterName: string): BroadcasterMetrics => {
    return {
      broadcasterName,
      domain: broadcasterName.toLowerCase().replace(/ /g, "") + ".com",
      networkSnapshot: { audienceSize: "250M+", revenue: "1.5B USD", platformCount: 50, coverage: "100M+" },
      audienceProfile: { primaryDemographic: "Ages 18-54", secondaryDemographic: "Global audience", geographicReach: ["Multiple regions"], engagementRate: "65%" },
      strategicContext: { sspPartners: ["Google", "Magnite", "Pubmatic"], adServers: ["Google DFP"], technology: ["Modern stack"] },
      coreMetrics: [{ label: "Reach", value: 80 }, { label: "Engagement", value: 70 }, { label: "Revenue", value: 75 }, { label: "Growth", value: 70 }],
      regionalBreakdown: [{ region: "Primary", value: 50 }, { region: "Secondary", value: 30 }, { region: "Tertiary", value: 20 }],
      riskAssessment: { level: "medium", factors: ["Standard integration", "Typical timeline", "Manageable complexity"] },
    };
  };

  const handleSuggestedAction = (action: string) => {
    const actionMap: Record<string, string> = {
      fetch_ads_txt: `Fetch and analyze the ads.txt file for ${state.research_question || "this broadcaster"} to identify their ad server and SSP partnerships.`,
      search_contacts: `Search for decision makers at ${state.research_question || "this broadcaster"} using LinkedIn and industry contacts.`,
      analyze_compatibility: `Analyze smartclip compatibility with the technology stack currently used by ${state.research_question || "this broadcaster"}.`,
    };

    if (actionMap[action]) {
      const prompt = actionMap[action];
      console.log("📤 Sending to agent:", {
        action,
        prompt,
        research_question: state.research_question,
        agent_name: agent,
      });

      // Direct agent trigger - chat append is not available in this version of CopilotKit
      console.log("❌ Chat append not available - agent action not triggered through chat");
    }
  };

  const generateReport = () => {
    if (state.research_question) {
      const prompt = `Generate a research report for ${state.research_question}. Include broadcaster name, ad server info, SSP partners, smartclip compatibility, and migration risk assessment.`;
      console.log("Generate report:", prompt);
    }
  };

  const extractFromChat = () => {
    // Get the latest assistant message
    const lastAssistantMessage = messages
      .filter((msg) => msg.role === "assistant")
      .pop();

    if (!lastAssistantMessage) return;

    const content = lastAssistantMessage.content;

    // Extract URLs that look like resources
    const urlRegex = /(https?:\/\/[^\s\)\]]+)/g;
    const urls = content.match(urlRegex) || [];

    // Add new resources from chat
    if (urls.length > 0) {
      const newResources = urls.map((url) => ({
        url,
        title: new URL(url).hostname || url,
        description: "Found in chat",
      }));

      setResources([...resources, ...newResources]);
    }

    // If there's substantial content, add it to the research draft
    if (content.length > 100) {
      const currentReport = state.report || "";
      const separator = currentReport ? "\n\n---\n\n" : "";
      setState({ ...state, report: currentReport + separator + content });
    }
  };

  useCoAgentStateRender({
    name: agent,
    render: ({ state: latestState, nodeName, status }) => {
      if (!latestState?.logs || latestState.logs.length === 0) {
        return null;
      }
      return <Progress logs={latestState.logs} />;
    },
  });

  useCopilotAction({
    name: "DeleteResources",
    description:
      "Prompt the user for resource delete confirmation, and then perform resource deletion",
    available: "remote",
    parameters: [
      {
        name: "urls",
        type: "string[]",
      },
    ],
    renderAndWait: ({ args, status, handler }) => {
      return (
        <div
          className=""
          data-test-id="delete-resource-generative-ui-container"
        >
          <div className="font-bold text-base mb-2">
            Delete these resources?
          </div>
          <Resources
            resources={resources.filter((resource) =>
              (args.urls || []).includes(resource.url),
            )}
            customWidth={200}
          />
          {status === "executing" && (
            <div className="mt-4 flex justify-start space-x-2">
              <button
                onClick={() => handler("NO")}
                className="px-4 py-2 text-[#6766FC] border border-[#6766FC] rounded text-sm font-bold"
              >
                Cancel
              </button>
              <button
                data-test-id="button-delete"
                onClick={() => handler("YES")}
                className="px-4 py-2 bg-[#6766FC] text-white rounded text-sm font-bold"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      );
    },
  });

  // AI Chat handlers for dashboard control
  const handleBroadcasterSelect = (name: string) => {
    console.log("📺 Selecting broadcaster:", name);
    setState({ ...state, research_question: name });
  };

  const handleCompareBroadcasters = async (broadcasters: string[]) => {
    console.log("📊 Comparing broadcasters:", broadcasters);
    setComparedBroadcasters(broadcasters);

    try {
      // Fetch metrics for all broadcasters
      const metricsMap: Record<string, BroadcasterMetrics> = {};
      for (const broadcaster of broadcasters) {
        const response = await fetch("/api/agent-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: "analyze_broadcaster",
            args: { broadcaster_name: broadcaster },
          }),
        });
        const result = await response.json();
        if (result.success) {
          metricsMap[broadcaster] = result.data;
        }
      }
      setComparisonMetrics(metricsMap);
    } catch (error) {
      console.error("Error fetching comparison metrics:", error);
    }
  };

  const resources: Resource[] = state.resources || [];
  const setResources = (resources: Resource[]) => {
    setState({ ...state, resources });
  };

  // const [resources, setResources] = useState<Resource[]>(dummyResources);
  const [newResource, setNewResource] = useState<Resource>({
    url: "",
    title: "",
    description: "",
  });
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  const addResource = () => {
    if (newResource.url) {
      setResources([...resources, { ...newResource }]);
      setNewResource({ url: "", title: "", description: "" });
      setIsAddResourceOpen(false);
    }
  };

  const removeResource = (url: string) => {
    setResources(
      resources.filter((resource: Resource) => resource.url !== url),
    );
  };

  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false);
  const [lastKnownReport, setLastKnownReport] = useState("");

  // Sync agent state with resources whenever report updates
  useEffect(() => {
    if (state.report && state.report !== lastKnownReport) {
      // Extract URLs from the report
      const urlRegex = /(https?:\/\/[^\s\)\]]+)/g;
      const urls = state.report.match(urlRegex) || [];

      if (urls.length > 0) {
        const newResources = urls
          .filter(url => !resources.some(r => r.url === url))
          .map((url) => ({
            url,
            title: new URL(url).hostname || url,
            description: "From research report",
          }));

        if (newResources.length > 0) {
          setResources([...resources, ...newResources]);
        }
      }

      setLastKnownReport(state.report);
    }
  }, [state.report, lastKnownReport, resources, setResources]);

  // Debug: log state changes
  useEffect(() => {
    const stateLog = {
      research_question: state.research_question,
      report_length: state.report?.length || 0,
      report_preview: state.report ? state.report.substring(0, 100) + "..." : "[empty]",
      resources: state.resources?.length || 0,
      logs: state.logs?.length || 0,
    };
    console.log("🔍 CoAgent State Updated:", stateLog);
  }, [state]);

  const handleCardClick = (resource: Resource) => {
    setEditResource({ ...resource }); // Ensure a new object is created
    setOriginalUrl(resource.url); // Store the original URL
    setIsEditResourceOpen(true);
  };

  const updateResource = () => {
    if (editResource && originalUrl) {
      setResources(
        resources.map((resource) =>
          resource.url === originalUrl ? { ...editResource } : resource,
        ),
      );
      setEditResource(null);
      setOriginalUrl(null);
      setIsEditResourceOpen(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-10 bg-white/5 backdrop-blur-sm">
      <div className="space-y-8 pb-10">
        {/* AI Chat Control */}
        <AIChatDashboard
          currentBroadcaster={state.research_question || ""}
          onBroadcasterSelect={handleBroadcasterSelect}
          onCompare={handleCompareBroadcasters}
          isLoading={metricsLoading}
        />

        <div>
          <h2 className="text-lg font-medium mb-3 text-white/90">
            Broadcaster Name
          </h2>
          <Input
            placeholder="E.g., BBC, Paramount, Al Jazeera, TF1..."
            value={state.research_question || ""}
            onChange={(e) =>
              setState({ ...state, research_question: e.target.value })
            }
            aria-label="Broadcaster name"
            className="bg-white/10 border border-white/20 text-white px-6 py-8 shadow-none rounded-xl text-md font-extralight focus-visible:ring-0 placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-500/50"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white/90">Resources</h2>
            <EditResourceDialog
              isOpen={isEditResourceOpen}
              onOpenChange={setIsEditResourceOpen}
              editResource={editResource}
              setEditResource={setEditResource}
              updateResource={updateResource}
            />
            <AddResourceDialog
              isOpen={isAddResourceOpen}
              onOpenChange={setIsAddResourceOpen}
              newResource={newResource}
              setNewResource={setNewResource}
              addResource={addResource}
            />
          </div>

          {resources.length !== 0 && (
            <Resources
              resources={resources}
              handleCardClick={handleCardClick}
              removeResource={removeResource}
            />
          )}
        </div>

        {/* Comparison View */}
        {comparedBroadcasters.length > 1 && Object.keys(comparisonMetrics).length > 0 && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-white/90">
                📊 Broadcaster Comparison: {comparedBroadcasters.join(" vs ")}
              </h2>
              <button
                onClick={() => setComparedBroadcasters([])}
                className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white/70 hover:text-white/90 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {comparedBroadcasters.map((broadcaster) => (
                comparisonMetrics[broadcaster] && (
                  <div
                    key={broadcaster}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  >
                    <h3 className="text-white/90 font-medium mb-4">{broadcaster}</h3>
                    <BroadcasterAnalysis data={comparisonMetrics[broadcaster]} />
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {state.broadcaster_metrics && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-white/90">
                📊 Broadcaster Analysis {metricsLoading && <Loader className="w-4 h-4 animate-spin ml-2" />}
              </h2>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              {metricsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-2">
                    <Loader className="w-8 h-8 animate-spin text-purple-400" />
                    <p className="text-white/60 text-sm">Analyzing broadcaster metrics...</p>
                  </div>
                </div>
              ) : (
                <BroadcasterAnalysis data={state.broadcaster_metrics} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

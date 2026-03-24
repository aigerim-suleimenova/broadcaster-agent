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
import { BroadcasterAnalysis } from "./generative-ui/BroadcasterAnalysis";
import { AgentState, Resource } from "@/lib/types";
import { useModelSelectorContext } from "@/lib/model-selector-provider";
import { Zap, FileText, Users, CheckCircle2 } from "lucide-react";

export function ResearchCanvas() {
  const { model, agent } = useModelSelectorContext();

  // Safely get append from useCopilotChat with optional chaining
  const chatContext = useCopilotChat();
  const append = chatContext?.append;
  const messages = chatContext?.messages || [];

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

  const handleSuggestedAction = (action: string) => {
    const actionMap: Record<string, string> = {
      fetch_ads_txt: `Fetch and analyze the ads.txt file for ${state.research_question || "this broadcaster"} to identify their ad server and SSP partnerships.`,
      search_contacts: `Search for decision makers at ${state.research_question || "this broadcaster"} using LinkedIn and industry contacts.`,
      analyze_compatibility: `Analyze smartclip compatibility with the technology stack currently used by ${state.research_question || "this broadcaster"}.`,
      test_metrics: `Test metrics display`,
    };

    if (actionMap[action]) {
      const prompt = actionMap[action];
      console.log("📤 Sending to agent:", {
        action,
        prompt,
        research_question: state.research_question,
        agent_name: agent,
        append_available: !!append
      });

      // Special case for testing metrics
      if (action === "test_metrics") {
        const testMetrics = {
          broadcasterName: "Al Jazeera",
          domain: "aljazeera.com",
          networkSnapshot: {
            audienceSize: "430M+",
            revenue: "$2.4B",
            platformCount: 70,
            coverage: "49M+",
          },
          audienceProfile: {
            primaryDemographic: "Ages 18-54",
            secondaryDemographic: "Core demo: affluent Arab viewers",
            geographicReach: ["MENA", "Europe", "North America"],
            engagementRate: "57%",
          },
          strategicContext: {
            sspPartners: ["Google", "Magnite", "OpenBidder"],
            adServers: ["Google DFP", "Adtech"],
            technology: ["React", "Node.js", "Kafka"],
          },
          coreMetrics: [
            { label: "Reach", value: 85 },
            { label: "Engagement", value: 72 },
            { label: "Revenue", value: 68 },
            { label: "Growth", value: 80 },
          ],
          regionalBreakdown: [
            { region: "MENA", value: 45 },
            { region: "Europe", value: 30 },
            { region: "Americas", value: 25 },
          ],
          riskAssessment: {
            level: "low" as const,
            factors: [
              "Compatible technology stack",
              "Strong SSP relationships",
              "Minimal migration required",
            ],
          },
        };
        setState({ ...state, broadcaster_metrics: testMetrics });
        return;
      }

      // Try to use chat append if available, otherwise trigger directly
      if (append) {
        append({ role: "user", content: prompt });
      } else {
        // Direct agent trigger when chat is not available
        console.log("❌ No append available - agent action not triggered");
      }
    }
  };

  const generateReport = () => {
    if (state.research_question) {
      const prompt = `Generate a research report for ${state.research_question}. Include broadcaster name, ad server info, SSP partners, smartclip compatibility, and migration risk assessment.`;
      if (append) {
        append({ role: "user", content: prompt });
      } else {
        console.log("Generate report:", prompt);
      }
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
  }, [state.report, lastKnownReport, resources]);

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
        <div>
          <h2 className="text-lg font-medium mb-3 text-white/90">
            Research Question
          </h2>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                placeholder="Enter your research question"
                value={state.research_question || ""}
                onChange={(e) =>
                  setState({ ...state, research_question: e.target.value })
                }
                aria-label="Research question"
                className="bg-white/10 border border-white/20 text-white px-6 py-8 shadow-none rounded-xl text-md font-extralight focus-visible:ring-0 placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-500/50"
              />
            </div>
            <button
              onClick={() => handleSuggestedAction("test_metrics")}
              className="px-4 py-2 bg-green-500/20 border border-green-500/40 hover:border-green-500/60 rounded text-xs text-green-300 hover:text-green-200 transition-all whitespace-nowrap"
              title="Load demo broadcaster metrics"
            >
              📊 Test Metrics
            </button>
          </div>
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

        <div className="flex flex-col h-full">
          {state.broadcaster_metrics ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-white/90">
                  Broadcaster Analysis
                </h2>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                <BroadcasterAnalysis data={state.broadcaster_metrics} />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-white/90">
                  Research Draft
                </h2>
                {messages.filter((msg) => msg.role === "assistant").length > 0 && (
                  <button
                    onClick={extractFromChat}
                    className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 hover:border-blue-500/60 rounded text-xs text-blue-300 hover:text-blue-200 transition-all"
                  >
                    ↓ Extract from Chat
                  </button>
                )}
              </div>
              <Textarea
                data-test-id="research-draft"
                placeholder={`📺 Broadcaster: [Enter name]
🖥️ Primary Ad Server: [Pending discovery via ads.txt]
🤝 Key SSP Partners: [Pending discovery]
✅ Smartclip Compatibility: [Pending analysis]
⚠️ Migration Risk: [Pending assessment]
💡 Next Steps: Add resources above to populate this analysis`}
                value={state.report || ""}
                onChange={(e) => setState({ ...state, report: e.target.value })}
                rows={10}
                aria-label="Research draft"
                className="bg-white/10 border border-white/20 text-white px-6 py-8 shadow-none rounded-xl text-md font-extralight focus-visible:ring-0 placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-purple-500/50"
                style={{ minHeight: "200px" }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

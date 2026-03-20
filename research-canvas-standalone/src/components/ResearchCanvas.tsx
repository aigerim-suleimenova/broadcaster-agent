"use client";

import { useState } from "react";
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
import { AgentState, Resource } from "@/lib/types";
import { useModelSelectorContext } from "@/lib/model-selector-provider";
import { Zap, FileText, Users, CheckCircle2 } from "lucide-react";

export function ResearchCanvas() {
  const { model, agent } = useModelSelectorContext();

  // Safely get append from useCopilotChat with optional chaining
  const chatContext = useCopilotChat();
  const append = chatContext?.append;

  const { state, setState } = useCoAgent<AgentState>({
    name: agent,
    initialState: {
      model,
    },
  });

  const handleSuggestedAction = (action: string) => {
    const actionMap: Record<string, string> = {
      fetch_ads_txt: `Fetch and analyze the ads.txt file for ${state.research_question || "this broadcaster"} to identify their ad server and SSP partnerships.`,
      search_contacts: `Search for decision makers at ${state.research_question || "this broadcaster"} using LinkedIn and industry contacts.`,
      analyze_compatibility: `Analyze smartclip compatibility with the technology stack currently used by ${state.research_question || "this broadcaster"}.`,
    };

    if (actionMap[action] && append) {
      append({ role: "user", content: actionMap[action] });
    }
  };

  useCoAgentStateRender({
    name: agent,
    render: ({ state, nodeName, status }) => {
      if (!state.logs || state.logs.length === 0) {
        return null;
      }
      return <Progress logs={state.logs} />;
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

          {/* Show proactive empty state or quick actions */}
          {resources.length === 0 && state.research_question && (
            <div className="mb-4">
              <ResearchCanvasEmptyState
                broadcasterName={state.research_question}
                hasResources={resources.length > 0}
                onSuggestedAction={handleSuggestedAction}
              />
            </div>
          )}

          {resources.length === 0 && !state.research_question && (
            <div className="space-y-3">
              <p className="text-sm text-white/50">
                💡 Suggested sources to start with:
              </p>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => {
                    setNewResource({
                      url: "ads.txt",
                      title: "ads.txt",
                      description: "Fetch and parse ads.txt to detect ad server and SSP partnerships",
                    });
                    setIsAddResourceOpen(true);
                  }}
                  className="flex-none px-4 py-2 bg-purple-500/20 border border-purple-500/40 hover:border-purple-500/60 rounded-lg text-sm text-white/70 hover:text-white transition-all"
                >
                  📄 ads.txt
                </button>
                <button
                  onClick={() => {
                    setNewResource({
                      url: "",
                      title: "Company Profile",
                      description: "Find broadcaster profile and market information",
                    });
                    setIsAddResourceOpen(true);
                  }}
                  className="flex-none px-4 py-2 bg-purple-500/20 border border-purple-500/40 hover:border-purple-500/60 rounded-lg text-sm text-white/70 hover:text-white transition-all"
                >
                  🏢 Profile
                </button>
                <button
                  onClick={() => {
                    setNewResource({
                      url: "",
                      title: "LinkedIn Company",
                      description: "Identify decision makers and team members",
                    });
                    setIsAddResourceOpen(true);
                  }}
                  className="flex-none px-4 py-2 bg-purple-500/20 border border-purple-500/40 hover:border-purple-500/60 rounded-lg text-sm text-white/70 hover:text-white transition-all"
                >
                  👥 LinkedIn
                </button>
              </div>
            </div>
          )}

          {resources.length !== 0 && (
            <Resources
              resources={resources}
              handleCardClick={handleCardClick}
              removeResource={removeResource}
            />
          )}
        </div>

        <div className="flex flex-col h-full">
          <h2 className="text-lg font-medium mb-3 text-white/90">
            Research Draft
          </h2>
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
        </div>
      </div>
    </div>
  );
}

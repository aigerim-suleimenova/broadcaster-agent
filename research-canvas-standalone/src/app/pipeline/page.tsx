"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { ModelSelectorProvider, useModelSelectorContext } from "@/lib/model-selector-provider";
import Pipeline from "@/components/Pipeline";

export default function PipelinePageWrapper() {
  return (
    <ModelSelectorProvider>
      <PipelinePage />
    </ModelSelectorProvider>
  );
}

function PipelinePage() {
  const { agent, lgcDeploymentUrl } = useModelSelectorContext();

  const runtimeUrl = lgcDeploymentUrl
    ? `/api/copilotkit?lgcDeploymentUrl=${lgcDeploymentUrl}`
    : `/api/copilotkit${
        agent.includes("crewai") ? "?coAgentsModel=crewai" : ""
      }`;

  return (
    <CopilotKit runtimeUrl={runtimeUrl} showDevConsole={false} agent={agent}>
      <Pipeline />
    </CopilotKit>
  );
}

/**
 * Custom hook for interacting with the Second Brain dashboard agent.
 * (app/hooks mirror — kept in sync with src/hooks/useDashboardAgent.tsx)
 */

import { useAgent } from "@copilotkit/react-core/v2";
import { useMemo, useCallback } from "react";
import type { A2UIComponent, SemanticZone } from "@/lib/a2ui-catalog";

export interface DashboardState {
  markdown_content: string;
  document_title: string;
  document_type: string;
  content_analysis: Record<string, any>;
  layout_type: string;
  components: A2UIComponent[];
  status: "idle" | "analyzing" | "generating" | "complete" | "error";
  progress: number;
  current_step: string;
  activity_log: Array<{
    id: string;
    message: string;
    timestamp: string;
    status: "in_progress" | "completed" | "error";
  }>;
  error_message: string | null;
}

const initialState: DashboardState = {
  markdown_content: "",
  document_title: "",
  document_type: "",
  content_analysis: {},
  layout_type: "",
  components: [],
  status: "idle",
  progress: 0,
  current_step: "",
  activity_log: [],
  error_message: null,
};

function groupByZone(
  components: A2UIComponent[],
): Record<SemanticZone, A2UIComponent[]> {
  const groups: Record<SemanticZone, A2UIComponent[]> = {
    hero: [], metrics: [], insights: [],
    content: [], media: [], resources: [], tags: [],
  };
  for (const comp of components) {
    const zone = (comp.zone as SemanticZone) || "content";
    (groups[zone] ?? groups.content).push(comp);
  }
  return groups;
}

export function useDashboardAgent() {
  const { agent } = useAgent({ agentId: "dashboard_agent" });

  // Merge with defaults — agent.state starts as {} (truthy) so plain || doesn't help
  const state: DashboardState = {
    ...initialState,
    ...(agent.state as Partial<DashboardState> ?? {}),
  };

  const componentsByZone = useMemo(
    () => groupByZone(state.components || []),
    [state.components],
  );

  const generateDashboard = useCallback(
    (markdown: string) => {
      // State reset only — see src/hooks/useDashboardAgent.tsx for the full comment.
      agent.setState({
        ...initialState,
        markdown_content: markdown,
        status: "analyzing",
        progress: 0,
      });
    },
    [agent],
  );

  const stop = useCallback(() => agent.abortRun(), [agent]);

  const isGenerating = agent.isRunning;
  const isComplete   = state.status === "complete";
  const hasError     = state.status === "error";

  return {
    state,
    setState: agent.setState.bind(agent),
    componentsByZone,
    generateDashboard,
    stop,
    isGenerating,
    isComplete,
    hasError,
    agent,
  };
}

export function useDashboardStateRender() {
  return null;
}

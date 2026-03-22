"use client";

import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";
import { Dashboard } from "../Dashboard";
import { Header } from "../Header";
import { CustomAssistantMessage } from "../AssistantMessage";
import { prompt } from "../../lib/prompt";
import { useCopilotReadable } from "@copilotkit/react-core";

import { Suspense } from "react";

interface BroadcasterData {
  broadcasterName: string;
  domain: string;
  adServer: string;
  fundamentSSPs: string[];
  smartclipPresent: boolean;
}

interface AnalysisProps {
  broadcasterData?: BroadcasterData | null;
}

function HomeContent({ broadcasterData }: AnalysisProps) {
  useCopilotReadable({
    description: "Current time",
    value: new Date().toLocaleTimeString(),
  });

  return (
      <div className="flex flex-1 relative z-10" style={{ height: "calc(100% - 0px)" }}>
      <div
     className="w-full h-full overflow-y-auto p-10 bg-white/5 backdrop-blur-sm"
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
    <CopilotSidebar
          instructions={prompt}
          AssistantMessage={
            CustomAssistantMessage}
      labels={{
      title: "Data Assistant",
      initial:
      "Hello, I'm here to help you understand your data. How can I help?",
      placeholder: "Ask about sales, trends, or metrics...",
      }}
        >
                <div className="w-full h-full overflow-y-auto p-10 bg-white/5 backdrop-blur-sm">
  <div className="flex-1 overflow-hidden">
    <Dashboard broadcasterData={broadcasterData} />
  </div>
    </div>
          </CopilotSidebar>
  </div>
    </div>
  );
}

export default function Home({ broadcasterData }: AnalysisProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >

      <HomeContent broadcasterData={broadcasterData} />
    </Suspense>
  );
}

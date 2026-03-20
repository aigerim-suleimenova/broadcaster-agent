"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
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
     <div className="w-full h-full overflow-y-auto p-10 bg-white/5 backdrop-blur-sm">
      <div className="space-y-8 pb-10">
      <CopilotSidebar
        defaultOpen
        instructions={prompt}
        AssistantMessage={CustomAssistantMessage}
        labels={{
          title: "Data Assistant",
          initial:
            "Hello, I'm here to help you understand your data. How can I help?",
          placeholder: "Ask about sales, trends, or metrics...",
        }}
      >
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
            <Dashboard broadcasterData={broadcasterData} />
          </main>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <HomeContent broadcasterData={broadcasterData} />
    </Suspense>
  );
}

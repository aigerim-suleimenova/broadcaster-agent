"use client";

import React, { useState } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { Loader, Search } from "lucide-react";

interface AIChatDashboardProps {
  currentBroadcaster?: string;
  onBroadcasterSelect?: (name: string) => void;
  onCompare?: (broadcasters: string[]) => void;
  isLoading?: boolean;
}

export function AIChatDashboard({
  currentBroadcaster = "",
  onBroadcasterSelect = () => {},
  onCompare = () => {},
  isLoading = false,
}: AIChatDashboardProps) {
  const [searchInput, setSearchInput] = useState("");
  const [suggestedBroadcasters] = useState<string[]>([
    "BBC",
    "Paramount",
    "Al Jazeera",
    "TF1",
    "Sky",
    "ITV",
    "SVT",
    "ARD",
  ]);

  // Register CopilotKit actions
  useCopilotAction({
    name: "search_broadcaster",
    description: "Search for and select a broadcaster to analyze",
    parameters: [
      {
        name: "broadcaster_name",
        type: "string",
        required: true,
      },
    ],
    handler: ({ broadcaster_name }) => {
      onBroadcasterSelect(broadcaster_name);
      return `Loaded data for ${broadcaster_name}. Dashboard is now showing their information.`;
    },
  });

  useCopilotAction({
    name: "compare_broadcasters",
    description: "Compare metrics of multiple broadcasters",
    parameters: [
      {
        name: "broadcasters",
        type: "string[]",
        required: true,
      },
    ],
    handler: ({ broadcasters }) => {
      onCompare(broadcasters);
      return `Dashboard now shows comparison between ${broadcasters.join(", ")}. You can see the metrics side-by-side.`;
    },
  });

  useCopilotAction({
    name: "get_dashboard_summary",
    description: "Get a summary of current broadcaster metrics",
    parameters: [],
    handler: async () => {
      context.setIsLoading(true);
      // Simulate fetching summary data
      const summaryData = {
        broadcaster: currentBroadcaster,
        totalMetrics: Math.random() * 100,
        trend: Math.random() > 0.5 ? "up" : "down",
      };
      context.setDashboardData(summaryData);
      setTimeout(() => context.setIsLoading(false), 500);
      return `Summary for ${currentBroadcaster}: Updated dashboard with latest metrics and trends.`;
    },
  });

  useCopilotAction({
    name: "analyze_metrics",
    description: "Analyze specific aspects of broadcaster metrics",
    parameters: [
      {
        name: "focus_area",
        type: "string",
      },
    ],
    handler: ({ focus_area }) => {
      context.setIsLoading(true);
      const analysisData = {
        focusArea: focus_area,
        broadcaster: currentBroadcaster,
        analysis: `Detailed analysis of ${focus_area} metrics`,
      };
      context.setMetrics(analysisData);
      setTimeout(() => context.setIsLoading(false), 500);
      return `Analysis of ${focus_area} for ${currentBroadcaster} is now displayed on the dashboard.`;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onBroadcasterSelect(searchInput.trim());
      setSearchInput("");
    }
  };

  const handleSuggestedClick = (broadcaster: string) => {
    onBroadcasterSelect(broadcaster);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search broadcaster..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={!searchInput.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </form>

      {/* Current Broadcaster Display */}
      {currentBroadcaster && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-white/70 mb-1">Current Broadcaster</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-white">{currentBroadcaster}</p>
            {isLoading && <Loader className="w-4 h-4 animate-spin text-purple-400" />}
          </div>
        </div>
      )}

      {/* Suggested Broadcasters */}
      <div>
        <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Popular Broadcasters</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {suggestedBroadcasters.map((broadcaster) => (
            <button
              key={broadcaster}
              onClick={() => handleSuggestedClick(broadcaster)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentBroadcaster === broadcaster
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10"
              }`}
            >
              {broadcaster}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

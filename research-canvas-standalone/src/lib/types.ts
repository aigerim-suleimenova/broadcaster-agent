export type Resource = {
  url: string;
  title: string;
  description: string;
};

export type BroadcasterMetrics = {
  broadcasterName: string;
  domain: string;
  networkSnapshot: {
    audienceSize: string;
    revenue: string;
    platformCount: number;
    coverage: string;
  };
  audienceProfile: {
    primaryDemographic: string;
    secondaryDemographic: string;
    geographicReach: string[];
    engagementRate: string;
  };
  strategicContext: {
    sspPartners: string[];
    adServers: string[];
    technology: string[];
  };
  coreMetrics: {
    label: string;
    value: number;
  }[];
  regionalBreakdown: {
    region: string;
    value: number;
  }[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
};

export type AgentState = {
  model: string;
  research_question: string;
  report: string;
  resources: any[];
  logs: any[];
  broadcaster_metrics?: BroadcasterMetrics | null;
};

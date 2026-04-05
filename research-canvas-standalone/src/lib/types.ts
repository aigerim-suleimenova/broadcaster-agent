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

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  proposed: boolean;
}

export interface LinkItem {
  title: string;
  url: string;
}

export type CardType = "project" | "entity" | "note" | "chart";

export interface ProjectData {
  field1: string; // text
  field2: string; // select
  field3: string; // date
  field4: ChecklistItem[]; // checklist
  field4_id: number; // id counter
}

export interface EntityData {
  field1: string; // text
  field2: string; // select
  field3: string[]; // tags
  field3_options: string[]; // options
}

export interface NoteData {
  field1?: string; // textarea
}

export interface ChartMetric {
  id: string;
  label: string;
  value: number | ""; // 0..100
}

export interface ChartData {
  field1: ChartMetric[]; // metrics
  field1_id: number; // id counter
}

export type ItemData = ProjectData | EntityData | NoteData | ChartData;

export interface Item {
  id: string;
  type: CardType;
  name: string; // editable title
  subtitle: string; // subtitle shown under the title
  data: ItemData;
}

// Runtime placeholder so accidental value imports of AgentState do not crash in ESM.

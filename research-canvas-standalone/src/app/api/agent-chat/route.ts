import { NextRequest, NextResponse } from "next/server";
import { useMCPTool } from "@/lib/useMCPTools";

// Type for the request body
interface MCPToolRequest {
  toolName: string;
  args: Record<string, any>;
  action: string;
}

// Broadcaster data repository (same as in mcp-server.ts)
const broadcasterDatabase: Record<string, any> = {
  bbc: {
    broadcasterName: "BBC",
    domain: "bbc.com",
    networkSnapshot: {
      audienceSize: "500M+",
      revenue: "5.2B GBP",
      platformCount: 120,
      coverage: "200M+",
    },
    audienceProfile: {
      primaryDemographic: "Ages 16-65",
      secondaryDemographic: "UK & International",
      geographicReach: ["UK", "Europe", "Americas", "APAC"],
      engagementRate: "68%",
    },
    strategicContext: {
      sspPartners: ["Google", "Magnite", "Pubmatic"],
      adServers: ["Google DFP", "OpenX"],
      technology: ["React", "Node.js", "Kubernetes"],
    },
    coreMetrics: [
      { label: "Reach", value: 92 },
      { label: "Engagement", value: 78 },
      { label: "Revenue", value: 85 },
      { label: "Growth", value: 65 },
    ],
    regionalBreakdown: [
      { region: "UK", value: 55 },
      { region: "Europe", value: 25 },
      { region: "Americas", value: 15 },
      { region: "APAC", value: 5 },
    ],
    riskAssessment: {
      level: "low",
      factors: [
        "Established infrastructure",
        "Strong SSP partnerships",
        "Minimal migration risk",
      ],
    },
  },
  paramount: {
    broadcasterName: "Paramount",
    domain: "paramount.com",
    networkSnapshot: {
      audienceSize: "450M+",
      revenue: "3.8B USD",
      platformCount: 85,
      coverage: "180M+",
    },
    audienceProfile: {
      primaryDemographic: "Ages 18-55",
      secondaryDemographic: "Global entertainment audience",
      geographicReach: ["North America", "Europe", "APAC", "LATAM"],
      engagementRate: "72%",
    },
    strategicContext: {
      sspPartners: ["Google", "Rubicon", "Index Exchange"],
      adServers: ["Google DFP", "Skai"],
      technology: ["Vue.js", "Python", "Docker"],
    },
    coreMetrics: [
      { label: "Reach", value: 88 },
      { label: "Engagement", value: 75 },
      { label: "Revenue", value: 82 },
      { label: "Growth", value: 75 },
    ],
    regionalBreakdown: [
      { region: "N.America", value: 45 },
      { region: "Europe", value: 30 },
      { region: "APAC", value: 18 },
      { region: "LATAM", value: 7 },
    ],
    riskAssessment: {
      level: "low",
      factors: [
        "Modern tech stack",
        "Proven SSP integration",
        "Fast migration timeline",
      ],
    },
  },
  aljazeera: {
    broadcasterName: "Al Jazeera",
    domain: "aljazeera.com",
    networkSnapshot: {
      audienceSize: "430M+",
      revenue: "2.4B USD",
      platformCount: 70,
      coverage: "170M+",
    },
    audienceProfile: {
      primaryDemographic: "Ages 18-54",
      secondaryDemographic: "MENA & International",
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
      level: "low",
      factors: [
        "Compatible tech",
        "Strong SSP relationships",
        "Minimal requirements",
      ],
    },
  },
};

function generateDefaultMetrics(broadcasterName: string): any {
  return {
    broadcasterName,
    domain: broadcasterName.toLowerCase().replace(/ /g, "") + ".com",
    networkSnapshot: {
      audienceSize: "250M+",
      revenue: "1.5B USD",
      platformCount: 50,
      coverage: "100M+",
    },
    audienceProfile: {
      primaryDemographic: "Ages 18-54",
      secondaryDemographic: "Global audience",
      geographicReach: ["Multiple regions"],
      engagementRate: "65%",
    },
    strategicContext: {
      sspPartners: ["Google", "Magnite", "Pubmatic"],
      adServers: ["Google DFP"],
      technology: ["Modern stack"],
    },
    coreMetrics: [
      { label: "Reach", value: 80 },
      { label: "Engagement", value: 70 },
      { label: "Revenue", value: 75 },
      { label: "Growth", value: 70 },
    ],
    regionalBreakdown: [
      { region: "Primary", value: 50 },
      { region: "Secondary", value: 30 },
      { region: "Tertiary", value: 20 },
    ],
    riskAssessment: {
      level: "medium",
      factors: [
        "Standard integration",
        "Typical timeline",
        "Manageable complexity",
      ],
    },
  };
}

// Tool handlers
async function handleAnalyzeBroadcaster(args: Record<string, any>) {
  const normalized = (args.broadcasterName as string).toLowerCase().trim();
  return (
    broadcasterDatabase[normalized] ||
    generateDefaultMetrics(args.broadcasterName as string)
  );
}

async function handleGenerateMetrics(args: Record<string, any>) {
  const query = args.query as string;
  const includeRiskAssessment = args.includeRiskAssessment ?? true;
  const normalized = query.toLowerCase().trim();
  const metrics =
    broadcasterDatabase[normalized] || generateDefaultMetrics(query);

  if (!includeRiskAssessment) {
    const { riskAssessment, ...metricsWithoutRisk } = metrics;
    return metricsWithoutRisk;
  }

  return metrics;
}

async function handleFetchBroadcasterData(args: Record<string, any>) {
  const domain = args.domain as string;
  const includeSSPs = args.includeSSPs ?? true;
  const includeAdServers = args.includeAdServers ?? true;

  return {
    domain,
    adsTxtAnalysis: {
      timestamp: new Date().toISOString(),
      ssps: includeSSPs ? ["Google", "Magnite", "Pubmatic"] : undefined,
      adServers: includeAdServers ? ["Google DFP", "OpenX"] : undefined,
      status: "active",
    },
  };
}

async function handleSearchBroadcasters(args: Record<string, any>) {
  const keyword = (args.keyword as string).toLowerCase();
  const region = args.region as string | undefined;
  const limit = (args.limit as number) || 10;

  const results = Object.entries(broadcasterDatabase)
    .filter(([key, value]) => {
      const matchesKeyword =
        key.includes(keyword) ||
        value.broadcasterName.toLowerCase().includes(keyword);
      if (!region) return matchesKeyword;
      return (
        matchesKeyword &&
        value.audienceProfile.geographicReach.some((r: string) =>
          r.toLowerCase().includes(region.toLowerCase()),
        )
      );
    })
    .slice(0, limit)
    .map(([_, value]) => value);

  return {
    query: keyword,
    region: region || "all",
    resultCount: results.length,
    results,
  };
}

async function handleGetDashboardSummary(args: Record<string, any>) {
  const broadcasterName = args.broadcasterName as string;
  const normalized = broadcasterName.toLowerCase().trim();
  const data =
    broadcasterDatabase[normalized] || generateDefaultMetrics(broadcasterName);

  return {
    broadcaster: data.broadcasterName,
    domain: data.domain,
    keyMetrics: {
      audience: data.networkSnapshot.audienceSize,
      revenue: data.networkSnapshot.revenue,
      platforms: data.networkSnapshot.platformCount,
      engagement: data.audienceProfile.engagementRate,
    },
    topRegions: data.regionalBreakdown.slice(0, 3),
    riskLevel: data.riskAssessment.level,
    partneredSSPs: data.strategicContext.sspPartners,
    adServersUsed: data.strategicContext.adServers,
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MCPToolRequest;
    const { toolName, args, action } = body;

    // Handle MCP tool calls
    if (action === "callMCPTool") {
      let result;

      switch (toolName) {
        case "analyze_broadcaster":
          result = await handleAnalyzeBroadcaster(args);
          break;
        case "generate_metrics":
          result = await handleGenerateMetrics(args);
          break;
        case "fetch_broadcaster_data":
          result = await handleFetchBroadcasterData(args);
          break;
        case "search_broadcasters":
          result = await handleSearchBroadcasters(args);
          break;
        case "get_dashboard_summary":
          result = await handleGetDashboardSummary(args);
          break;
        default:
          return NextResponse.json(
            { error: `Unknown tool: ${toolName}` },
            { status: 400 },
          );
      }

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Agent chat error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    );
  }
}

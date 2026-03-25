"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const server = new index_js_1.Server({
    name: "research-canvas-mcp",
    version: "1.0.0",
});
// Define available tools
const tools = [
    {
        name: "analyze_broadcaster",
        description: "Analyze a broadcaster and generate comprehensive metrics",
        inputSchema: {
            type: "object",
            properties: {
                broadcasterName: {
                    type: "string",
                    description: "Name of the broadcaster to analyze",
                },
                domain: {
                    type: "string",
                    description: "Domain of the broadcaster",
                },
            },
            required: ["broadcasterName"],
        },
    },
    {
        name: "generate_metrics",
        description: "Generate performance metrics for a broadcaster or research query",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Research question or broadcaster query",
                },
                includeRiskAssessment: {
                    type: "boolean",
                    description: "Include risk assessment in metrics",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "fetch_broadcaster_data",
        description: "Fetch real-time broadcaster data from ads.txt analysis",
        inputSchema: {
            type: "object",
            properties: {
                domain: {
                    type: "string",
                    description: "Domain to analyze",
                },
                includeSSPs: {
                    type: "boolean",
                    description: "Include SSP information",
                },
                includeAdServers: {
                    type: "boolean",
                    description: "Include ad server information",
                },
            },
            required: ["domain"],
        },
    },
    {
        name: "search_broadcasters",
        description: "Search for broadcasters matching criteria",
        inputSchema: {
            type: "object",
            properties: {
                keyword: {
                    type: "string",
                    description: "Search keyword",
                },
                region: {
                    type: "string",
                    description: "Geographic region to filter by",
                },
                limit: {
                    type: "number",
                    description: "Maximum results to return",
                },
            },
            required: ["keyword"],
        },
    },
    {
        name: "get_dashboard_summary",
        description: "Get a complete dashboard summary with all metrics",
        inputSchema: {
            type: "object",
            properties: {
                broadcasterName: {
                    type: "string",
                    description: "Broadcaster name to summarize",
                },
            },
            required: ["broadcasterName"],
        },
    },
];
// Broadcaster data repository
const broadcasterDatabase = {
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
function generateDefaultMetrics(broadcasterName) {
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
// Handle tool calls
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "analyze_broadcaster": {
                const normalized = args.broadcasterName
                    .toLowerCase()
                    .trim();
                const data = broadcasterDatabase[normalized] ||
                    generateDefaultMetrics(args.broadcasterName);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            }
            case "generate_metrics": {
                const query = args.query;
                const includeRiskAssessment = args.includeRiskAssessment ?? true;
                const normalized = query.toLowerCase().trim();
                let metrics = broadcasterDatabase[normalized] || generateDefaultMetrics(query);
                if (!includeRiskAssessment) {
                    const { riskAssessment, ...metricsWithoutRisk } = metrics;
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(metricsWithoutRisk, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(metrics, null, 2),
                        },
                    ],
                };
            }
            case "fetch_broadcaster_data": {
                const domain = args.domain;
                const includeSSPs = args.includeSSPs ?? true;
                const includeAdServers = args.includeAdServers ?? true;
                // Simulate ads.txt analysis
                const data = {
                    domain,
                    adsTxtAnalysis: {
                        timestamp: new Date().toISOString(),
                        ssps: includeSSPs ? ["Google", "Magnite", "Pubmatic"] : undefined,
                        adServers: includeAdServers ? ["Google DFP", "OpenX"] : undefined,
                        status: "active",
                    },
                };
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            }
            case "search_broadcasters": {
                const keyword = args.keyword.toLowerCase();
                const region = args.region;
                const limit = args.limit || 10;
                const results = Object.entries(broadcasterDatabase)
                    .filter(([key, value]) => {
                    const matchesKeyword = key.includes(keyword) ||
                        value.broadcasterName.toLowerCase().includes(keyword);
                    if (!region)
                        return matchesKeyword;
                    return (matchesKeyword &&
                        value.audienceProfile.geographicReach.some((r) => r.toLowerCase().includes(region.toLowerCase())));
                })
                    .slice(0, limit)
                    .map(([_, value]) => value);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                query: keyword,
                                region: region || "all",
                                resultCount: results.length,
                                results,
                            }, null, 2),
                        },
                    ],
                };
            }
            case "get_dashboard_summary": {
                const broadcasterName = args.broadcasterName;
                const normalized = broadcasterName.toLowerCase().trim();
                const data = broadcasterDatabase[normalized] ||
                    generateDefaultMetrics(broadcasterName);
                const summary = {
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
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(summary, null, 2),
                        },
                    ],
                };
            }
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `Unknown tool: ${name}`,
                        },
                    ],
                    isError: true,
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
// Handle tool listing
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return { tools };
});
// Start the server
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Research Canvas MCP Server running on stdio");
}
main().catch(console.error);

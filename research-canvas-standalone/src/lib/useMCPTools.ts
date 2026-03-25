import { useCallback, useState } from "react";

interface MCPToolResult {
  data: any;
  loading: boolean;
  error: string | null;
}

export function useMCPTool(toolName: string) {
  const [result, setResult] = useState<MCPToolResult>({
    data: null,
    loading: false,
    error: null,
  });

  const callTool = useCallback(
    async (args: Record<string, any>) => {
      setResult({ data: null, loading: true, error: null });

      try {
        // Call the MCP tool through your agent API
        const response = await fetch("/api/agent-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            toolName,
            args,
            action: "callMCPTool",
          }),
        });

        if (!response.ok) {
          throw new Error(`MCP tool failed: ${response.statusText}`);
        }

        const responseData = await response.json();
        // Extract the actual data from the API response
        const actualData = responseData.data || responseData;
        setResult({
          data: actualData,
          loading: false,
          error: null,
        });
        return actualData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setResult({
          data: null,
          loading: false,
          error: errorMessage,
        });
        throw err;
      }
    },
    [toolName],
  );

  return { ...result, callTool };
}

// Hook to analyze a broadcaster
export function useBroadcasterAnalysis(broadcasterName: string) {
  const { data, loading, error, callTool } = useMCPTool("analyze_broadcaster");

  const analyze = useCallback(async () => {
    return callTool({ broadcasterName });
  }, [callTool, broadcasterName]);

  return { data, loading, error, analyze };
}

// Hook to get dashboard summary
export function useDashboardSummary(broadcasterName: string) {
  const { data, loading, error, callTool } = useMCPTool(
    "get_dashboard_summary",
  );

  const fetch = useCallback(async () => {
    return callTool({ broadcasterName });
  }, [callTool, broadcasterName]);

  return { data, loading, error, fetch };
}

// Hook to search broadcasters
export function useSearchBroadcasters() {
  const { data, loading, error, callTool } = useMCPTool("search_broadcasters");

  const search = useCallback(
    async (keyword: string, region?: string, limit?: number) => {
      return callTool({ keyword, region, limit });
    },
    [callTool],
  );

  return { data, loading, error, search };
}

// Hook to fetch broadcaster data from ads.txt
export function useBroadcasterData(domain: string) {
  const { data, loading, error, callTool } = useMCPTool(
    "fetch_broadcaster_data",
  );

  const fetch = useCallback(async () => {
    return callTool({
      domain,
      includeSSPs: true,
      includeAdServers: true,
    });
  }, [callTool, domain]);

  return { data, loading, error, fetch };
}

// Hook to generate metrics
export function useGenerateMetrics(query: string) {
  const { data, loading, error, callTool } = useMCPTool("generate_metrics");

  const generate = useCallback(
    async (includeRiskAssessment = true) => {
      return callTool({ query, includeRiskAssessment });
    },
    [callTool, query],
  );

  return { data, loading, error, generate };
}

// spec: specs/broadcaster-search.md — API-level scenarios (no browser needed)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api/agent-chat';

async function callTool(toolName: string, args: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'callMCPTool', toolName, args }),
  });
  return { status: res.status, body: await res.json() };
}

test.describe('Broadcaster Search — API Contract', () => {
  test.beforeAll(async () => {
    // Warm up the server so startup time doesn't eat into individual test timeouts
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch('http://localhost:3000/api/agent-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'callMCPTool', toolName: 'get_dashboard_summary', args: { broadcasterName: 'BBC' } }),
        });
        if (res.ok) break;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  });

  test('search_broadcasters with MENA region filter returns only Al Jazeera', async () => {
    const { status, body } = await callTool('search_broadcasters', { keyword: '', region: 'MENA' });

    expect(status).toBe(200);
    expect(body.data.resultCount).toBe(1);
    expect(body.data.results[0].broadcasterName).toBe('Al Jazeera');
  });

  test('search_broadcasters limit=1 returns exactly one result', async () => {
    const { status, body } = await callTool('search_broadcasters', { keyword: '', limit: 1 });

    expect(status).toBe(200);
    expect(body.data.results).toHaveLength(1);
    expect(body.data.resultCount).toBe(1);
  });

  test('search_broadcasters keyword "bbc" returns BBC', async () => {
    const { status, body } = await callTool('search_broadcasters', { keyword: 'bbc' });

    expect(status).toBe(200);
    expect(body.data.results[0].broadcasterName).toBe('BBC');
  });

  test('invalid tool name returns HTTP 400 with error message', async () => {
    const { status, body } = await callTool('nonexistent_tool', {});

    expect(status).toBe(400);
    expect(body.error).toBe('Unknown tool: nonexistent_tool');
  });

  test('analyze_broadcaster for unknown name returns generic fallback', async () => {
    const { status, body } = await callTool('analyze_broadcaster', { broadcasterName: 'Netflix' });

    expect(status).toBe(200);
    expect(body.data.networkSnapshot.audienceSize).toBe('250M+');
    expect(body.data.riskAssessment.level).toBe('medium');
  });

  test('generate_metrics with includeRiskAssessment=false omits risk data', async () => {
    const { status, body } = await callTool('generate_metrics', {
      query: 'BBC',
      includeRiskAssessment: false,
    });

    expect(status).toBe(200);
    expect(body.data.riskAssessment).toBeUndefined();
  });

  test('fetch_broadcaster_data returns ads.txt analysis with SSPs and ad servers', async () => {
    const { status, body } = await callTool('fetch_broadcaster_data', {
      domain: 'bbc.com',
      includeSSPs: true,
      includeAdServers: true,
    });

    expect(status).toBe(200);
    expect(body.data.adsTxtAnalysis.ssps).toContain('Google');
    expect(body.data.adsTxtAnalysis.adServers).toContain('Google DFP');
    expect(body.data.adsTxtAnalysis.status).toBe('active');
  });

  test('get_dashboard_summary returns key metrics for BBC', async () => {
    const { status, body } = await callTool('get_dashboard_summary', { broadcasterName: 'BBC' });

    expect(status).toBe(200);
    expect(body.data.broadcaster).toBe('BBC');
    expect(body.data.keyMetrics.audience).toBe('500M+');
    expect(body.data.riskLevel).toBe('low');
    expect(body.data.partneredSSPs).toContain('Google');
  });
});

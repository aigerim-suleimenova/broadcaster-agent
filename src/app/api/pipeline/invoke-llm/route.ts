import { NextRequest, NextResponse } from "next/server";

// Prefer OpenAI key; fall back to OpenRouter
const OPENAI_KEY   = process.env.OPENAI_API_KEY || "";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "";
const USE_OPENAI   = !!OPENAI_KEY;
const API_URL      = USE_OPENAI
  ? "https://api.openai.com/v1/chat/completions"
  : "https://openrouter.ai/api/v1/chat/completions";
const API_KEY      = USE_OPENAI ? OPENAI_KEY : OPENROUTER_KEY;
// Strip "openai/" prefix when calling OpenAI directly
const RAW_MODEL    = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const MODEL        = USE_OPENAI ? RAW_MODEL.replace(/^openai\//, "") : RAW_MODEL;

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
  };
  if (!USE_OPENAI) {
    headers["HTTP-Referer"] = "http://localhost:3000";
    headers["X-Title"]      = "Broadcaster Analyzer";
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Broadcaster report generation ────────────────────────────────────────────

async function generateBroadcasterReport(broadcasterName: string): Promise<string> {
  const systemPrompt = `You are an expert broadcast industry analyst. Generate detailed, realistic broadcaster analysis reports in markdown format. Include specific numbers, metrics, and industry-relevant data. Write in a professional analytical tone.`;

  const userPrompt = `Generate a comprehensive broadcaster analysis report for **${broadcasterName}** in markdown format.

The report must include ALL of the following sections with realistic data and metrics:

# ${broadcasterName} — Broadcaster Analysis Report

## Executive Summary
(3–4 bullet points with key highlights: audience reach, streaming performance, revenue, key differentiator)

## 1. Broadcaster Overview
(Company background, broadcast channels, streaming platforms, geographic presence, subscription/viewer numbers)

## 2. Streaming Performance
A markdown table with these metrics: Total Stream Hours, Peak Concurrent Viewers, Average Bitrate Delivered, Rebuffering Ratio, Startup Time (p50), CDN Uptime.
Include context about their best and worst performing content.

## 3. Content Portfolio
- Top content categories with audience share percentages
- Table of top 5 performing titles/shows with peak viewers and engagement

## 4. Technology Stack
- CDN providers and delivery strategy
- Encoding formats and codec strategy
- DRM approach
- Ad tech stack (ad server, SSPs)
- Key technology partners

## 5. Audience & Demographics
- Table: audience breakdown by device, age group, and geography
- Engagement metrics: avg session duration, return rate, etc.

## 6. Revenue & Monetization
- Revenue model (SVOD/AVOD/FAST/linear) with percentages
- Key revenue metrics: ARPU, ad CPM, fill rate, total revenue estimate

## 7. Key Recommendations
(3–5 actionable recommendations for improving streaming performance, monetization, or technology)

Use realistic numbers appropriate for the size and type of broadcaster. Be specific and detailed.`;

  return await callLLM(systemPrompt, userPrompt);
}

// ─── Standard pipeline LLM call ───────────────────────────────────────────────

async function runPipelinePrompt(prompt: string): Promise<Record<string, unknown>> {
  const systemPrompt = `You are a broadcast industry pipeline agent. Respond ONLY with a valid JSON object. No markdown, no extra text.`;

  const raw = await callLLM(systemPrompt, prompt);

  // Try to parse the full JSON response — preserve all fields (scoreBreakdown, adServer, etc.)
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, unknown>;
  } catch {
    // Fallback: wrap raw lines as messages
  }

  return { messages: raw.split("\n").filter(Boolean).slice(0, 5) };
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, mode, broadcasterName } = body;

    // Broadcaster report generation mode
    if (mode === "broadcaster_report" && broadcasterName) {
      const markdown = await generateBroadcasterReport(broadcasterName as string);
      return NextResponse.json({ markdown });
    }

    // Standard pipeline message mode
    if (prompt) {
      const result = await runPipelinePrompt(prompt as string);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Missing prompt or broadcasterName" }, { status: 400 });
  } catch (error) {
    console.error("[invoke-llm] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "LLM call failed" },
      { status: 500 }
    );
  }
}

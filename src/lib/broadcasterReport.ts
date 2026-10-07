// Stage 0 broadcaster research report, shared by the pipeline route and bench/stage1.ts

import { callLLM } from "./llm";

export async function generateBroadcasterReport(broadcasterName: string): Promise<string> {
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

  const { content } = await callLLM(systemPrompt, userPrompt);
  return content;
}

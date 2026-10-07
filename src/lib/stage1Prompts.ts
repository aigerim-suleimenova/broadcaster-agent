// Stage 1 (Compatibility) prompts.
// buildAdsTxtStage1Prompt is used when ads.txt was fetched: the ad stack comes from
// adsTxtAnalyzer and the LLM only scores it. buildLlmStage1Prompt is the original
// prompt that asks the LLM to research the ad stack itself; the pipeline falls back
// to it when ads.txt is unavailable, and bench/stage1.ts uses it as the baseline.

import type { AdsTxtAnalysis } from "./adsTxtAnalyzer";

export function buildLlmStage1Prompt(broadcasterName: string, research: string): string {
  return `You are a Smartclip partnership analyst. Smartclip is a video ad tech company that provides SSP, ad serving, and CTV monetisation solutions for broadcasters.

Analyze "${broadcasterName}" for Smartclip partnership compatibility based on the research below.${research}

Score each criterion from 0–100 with a one-sentence reason. Then return a JSON object with this exact shape:

{
  "messages": [
    "Analyzing ad tech stack for ${broadcasterName}...",
    "<Ad Server & SSP summary: what server they use, current SSP partners, incremental demand vs conflicts>",
    "<Video Inventory: pre-roll/mid-roll/CTV/HbbTV volume and types, fit with Smartclip demand>",
    "<Revenue Opportunity: estimated CPM uplift, migration complexity, timeline>"
  ],
  "adServer": "<name>",
  "currentSSPs": ["<ssp1>", "<ssp2>"],
  "migrationRisk": "<low|medium|high>",
  "revenueOpportunity": "<estimate>",
  "scoreBreakdown": {
    "adServerCompatibility": { "score": <0-100>, "reason": "<one sentence>" },
    "sspOverlap":            { "score": <0-100>, "reason": "<one sentence>" },
    "videoInventory":        { "score": <0-100>, "reason": "<one sentence>" },
    "revenueOpportunity":    { "score": <0-100>, "reason": "<one sentence>" },
    "migrationEase":         { "score": <0-100>, "reason": "<one sentence — higher = easier to migrate>" }
  }
}

Weights applied in code: adServerCompatibility 25%, sspOverlap 20%, videoInventory 25%, revenueOpportunity 15%, migrationEase 15%.
Return ONLY valid JSON with no extra text.`;
}

export function buildAdsTxtStage1Prompt(
  broadcasterName: string,
  research: string,
  adsTxt: AdsTxtAnalysis,
): string {
  const ssps = adsTxt.foundSSPs.length > 0 ? adsTxt.foundSSPs.join(", ") : "none of the known SSPs";
  return `You are a Smartclip partnership analyst. Smartclip is a video ad tech company that provides SSP, ad serving, and CTV monetisation solutions for broadcasters.

Analyze "${broadcasterName}" for Smartclip partnership compatibility.

VERIFIED AD STACK (parsed from ${adsTxt.domain}/ads.txt; treat as fact, do not contradict):
- Ad server: ${adsTxt.primaryAdServer}
- Authorised SSPs: ${ssps}
- smartclip already an authorised seller: ${adsTxt.isSmartclipPresent ? "yes (expansion pitch)" : "no (new-logo pitch)"}
${research}

Score each criterion from 0–100 with a one-sentence reason. Return a JSON object with this exact shape:

{
  "videoInventory": "<Video Inventory: pre-roll/mid-roll/CTV/HbbTV volume and types, fit with Smartclip demand>",
  "revenueSummary": "<Revenue Opportunity: estimated CPM uplift, migration complexity, timeline>",
  "migrationRisk": "<low|medium|high>",
  "revenueOpportunity": "<estimate>",
  "scoreBreakdown": {
    "adServerCompatibility": { "score": <0-100>, "reason": "<one sentence>" },
    "sspOverlap":            { "score": <0-100>, "reason": "<one sentence>" },
    "videoInventory":        { "score": <0-100>, "reason": "<one sentence>" },
    "revenueOpportunity":    { "score": <0-100>, "reason": "<one sentence>" },
    "migrationEase":         { "score": <0-100>, "reason": "<one sentence — higher = easier to migrate>" }
  }
}

Weights applied in code: adServerCompatibility 25%, sspOverlap 20%, videoInventory 25%, revenueOpportunity 15%, migrationEase 15%.
Return ONLY valid JSON with no extra text.`;
}

// Deterministic replacement for the LLM's "Ad Server & SSP summary" message
export function describeAdStack(adsTxt: AdsTxtAnalysis): string {
  const ssps = adsTxt.foundSSPs.length > 0 ? adsTxt.foundSSPs.join(", ") : "none detected";
  const smartclip = adsTxt.isSmartclipPresent
    ? "smartclip is already an authorised seller: expansion opportunity."
    : "smartclip is not in ads.txt: new-logo opportunity.";
  return `Ad server: ${adsTxt.primaryAdServer}. SSPs in ads.txt (${adsTxt.rawCount} lines): ${ssps}. ${smartclip}`;
}

import { NextRequest, NextResponse } from "next/server";
import {
  analyzeAdsTxt,
  generateAdsTxtMessages,
  AdsTxtAnalysis,
} from "@/lib/adsTxtAnalyzer";

interface AnalyzeAdsTxtRequest {
  domain: string;
}

interface AnalyzeAdsTxtResponse {
  analysis: AdsTxtAnalysis;
  messages: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as AnalyzeAdsTxtRequest;
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 },
      );
    }

    console.log(`[ads.txt Analyzer] Analyzing domain: ${domain}`);

    // Fetch and analyze ads.txt
    const analysis = await analyzeAdsTxt(domain);
    const messages = generateAdsTxtMessages(analysis);

    console.log(
      `[ads.txt Analyzer] Found ${analysis.foundSSPs.length} SSPs, smartclip present: ${analysis.isSmartclipPresent}`,
    );

    return NextResponse.json({
      analysis,
      messages,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[ads.txt Analyzer] Error:", errorMsg);

    return NextResponse.json(
      { error: `Analysis failed: ${errorMsg}` },
      { status: 500 },
    );
  }
}

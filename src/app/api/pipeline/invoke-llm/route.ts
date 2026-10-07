import { NextRequest, NextResponse } from "next/server";
import { callLLM, parsePipelineJson, PIPELINE_SYSTEM_PROMPT } from "@/lib/llm";
import { generateBroadcasterReport } from "@/lib/broadcasterReport";

// ─── Standard pipeline LLM call ───────────────────────────────────────────────

async function runPipelinePrompt(prompt: string): Promise<Record<string, unknown>> {
  const { content } = await callLLM(PIPELINE_SYSTEM_PROMPT, prompt);
  return parsePipelineJson(content);
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

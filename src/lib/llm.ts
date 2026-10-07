// Shared LLM client for the pipeline route and the stage-1 benchmark (bench/stage1.ts)

// Prefer OpenAI key; fall back to OpenRouter
const OPENAI_KEY     = process.env.OPENAI_API_KEY || "";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "";
const USE_OPENAI     = !!OPENAI_KEY;
const API_URL        = USE_OPENAI
  ? "https://api.openai.com/v1/chat/completions"
  : "https://openrouter.ai/api/v1/chat/completions";
const API_KEY        = USE_OPENAI ? OPENAI_KEY : OPENROUTER_KEY;
// Strip "openai/" prefix when calling OpenAI directly
const RAW_MODEL      = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
export const MODEL   = USE_OPENAI ? RAW_MODEL.replace(/^openai\//, "") : RAW_MODEL;

export const PIPELINE_SYSTEM_PROMPT = `You are a broadcast industry pipeline agent. Respond ONLY with a valid JSON object. No markdown, no extra text.`;

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResult {
  content: string;
  usage: LLMUsage;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

export async function callLLM(systemPrompt: string, userPrompt: string): Promise<LLMResult> {
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

  const data = (await res.json()) as ChatCompletionResponse;
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    usage: {
      promptTokens:     data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens:      data.usage?.total_tokens ?? 0,
    },
  };
}

// Parse a JSON-only LLM reply; falls back to wrapping raw lines as messages
export function parsePipelineJson(raw: string): Record<string, unknown> {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed: unknown = JSON.parse(cleaned);
    if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, unknown>;
  } catch {
    // Fallback below
  }
  return { messages: raw.split("\n").filter(Boolean).slice(0, 5) };
}

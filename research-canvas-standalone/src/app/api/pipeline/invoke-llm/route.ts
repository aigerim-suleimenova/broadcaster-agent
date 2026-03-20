import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface InvokeLLMRequest {
  prompt: string;
  model?: string;
}

interface InvokeLLMResponse {
  messages?: string[];
  error?: string;
}

// Helper to parse JSON response from LLM
const parseJsonResponse = (content: string): string[] => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.messages && Array.isArray(parsed.messages)) {
      return parsed.messages;
    }
  } catch {
    // If JSON parsing fails, return content as single message
  }
  return [content];
};

// Check which API keys are available
const getAvailableModel = (requestedModel?: string): string => {
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;

  // If requested model is available, use it
  if (requestedModel === "openai" && hasOpenAI) return "openai";
  if (requestedModel === "anthropic" && hasAnthropic) return "anthropic";
  if (requestedModel === "google_genai" && hasGoogle) return "google_genai";
  if (requestedModel === "groq" && hasGroq) return "groq";

  // Fallback to first available model
  if (hasGroq) return "groq";
  if (hasOpenAI) return "openai";
  if (hasAnthropic) return "anthropic";
  if (hasGoogle) return "google_genai";

  throw new Error(
    "No API keys configured. Set GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY",
  );
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as InvokeLLMRequest;
    const { prompt, model = "openai" } = body;

    // Determine which model to actually use based on available keys
    const actualModel = getAvailableModel(model);
    console.log(
      `[Pipeline API] Requested: ${model}, Using: ${actualModel}, prompt length: ${prompt?.length || 0}`,
    );

    if (!prompt) {
      console.error("[Pipeline API] No prompt provided");
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Route to appropriate model
    let response: string;

    try {
      if (actualModel === "openai") {
        response = await invokeOpenAI(prompt);
      } else if (actualModel === "anthropic") {
        response = await invokeAnthropic(prompt);
      } else if (actualModel === "google_genai") {
        response = await invokeGoogle(prompt);
      } else {
        response = await invokeGroq(prompt);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        `[Pipeline API] Model invocation error (${actualModel}): ${errorMsg}`,
      );
      console.error(
        `[Pipeline API] Prompt was (first 200 chars): ${prompt.substring(0, 200)}`,
      );
      throw error;
    }

    if (!response) {
      console.warn("[Pipeline API] Empty response from model");
      return NextResponse.json({ messages: ["No response from model"] });
    }

    const messages = parseJsonResponse(response);
    console.log(
      `[Pipeline API] Successfully parsed ${messages.length} messages`,
    );

    return NextResponse.json({ messages });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : "";
    console.error(
      `[Pipeline API] Error invoking LLM: ${errorMsg}`,
      errorDetails,
    );

    return NextResponse.json(
      { error: `LLM invocation failed: ${errorMsg}` },
      { status: 500 },
    );
  }
}

async function invokeGroq(prompt: string): Promise<string> {
  console.log("[Groq] Starting invocation");
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  // Try multiple models in order of preference
  // These are confirmed available models on Groq as of March 2026
  const models = [
    "mixtral-8x7b-32768", // Fast, general purpose
    "llama-3.1-8b-instant", // Lightweight, fast
    "gemma-7b-it", // Alternative lightweight option
  ];

  for (const model of models) {
    try {
      console.log(`[Groq] Attempting with model: ${model}`);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error?.message || response.statusText;
        console.error(
          `[Groq] Model ${model} failed (${response.status}): ${errorMsg}`,
        );

        // If it's a decommissioned or not found error, try the next one
        if (
          (response.status === 400 && errorMsg.includes("decommissioned")) ||
          (response.status === 404 && errorMsg.includes("does not exist"))
        ) {
          console.log(`[Groq] Model ${model} not available, trying next...`);
          continue;
        }

        throw new Error(`Groq API error (${response.status}): ${errorMsg}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      console.log(`[Groq] Successfully received response from model: ${model}`);
      return content;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Groq] Model ${model} error: ${errorMsg}`);

      // Continue to next model on decommissioned/not found errors
      if (
        errorMsg.includes("decommissioned") ||
        errorMsg.includes("does not exist")
      ) {
        continue;
      }

      // For other errors on the last model, throw
      if (model === models[models.length - 1]) {
        throw err;
      }
    }
  }

  throw new Error(
    "All Groq models attempted but none available. Check https://console.groq.com/docs/models",
  );
}

async function invokeOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `OpenAI API error: ${error.error?.message || response.statusText}`,
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function invokeAnthropic(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Anthropic API error: ${error.error?.message || response.statusText}`,
    );
  }

  const data = await response.json();
  return data.content[0]?.text || "";
}

async function invokeGoogle(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Google API error: ${error.error?.message || response.statusText}`,
    );
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "";
}

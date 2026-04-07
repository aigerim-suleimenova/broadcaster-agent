import { Groq } from "groq-sdk";

interface LLMInvokeParams {
  prompt: string;
  response_json_schema?: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

interface LLMInvokeResponse {
  messages?: string[];
  [key: string]: unknown;
}

class Base44Client {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  integrations = {
    Core: {
      InvokeLLM: async (
        params: LLMInvokeParams,
      ): Promise<LLMInvokeResponse> => {
        try {
          const response = await this.groq.chat.completions.create({
            model: "llama-3.1-70b-versatile",
            messages: [
              {
                role: "user",
                content: params.prompt,
              },
            ],
            temperature: 0.7,
          });

          const content = response.choices[0]?.message?.content;

          if (!content) {
            return { messages: [] };
          }

          // Try to parse as JSON if schema is provided
          if (params.response_json_schema) {
            try {
              const parsed = JSON.parse(content);
              return parsed;
            } catch {
              // If JSON parsing fails, return as text response
              return { messages: [content] };
            }
          }

          return { messages: [content] };
        } catch (error) {
          console.error("Error invoking LLM:", error);
          throw error;
        }
      },
    },
  };
}

export const base44 = new Base44Client();

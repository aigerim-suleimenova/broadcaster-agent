/**
 * Download Node
 *
 * This module contains the implementation of the download_node function.
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { AgentState } from "./state";
import { htmlToText } from "html-to-text";
import { copilotkitEmitState } from "@copilotkit/sdk-js/langgraph";

// LRU cache to prevent unbounded memory growth
const MAX_CACHE_SIZE = 50;
const RESOURCE_CACHE = new Map<
  string,
  { content: string; timestamp: number }
>();

export function getResource(url: string): string {
  const cached = RESOURCE_CACHE.get(url);
  if (cached) {
    // Update timestamp for LRU
    cached.timestamp = Date.now();
    return cached.content;
  }
  return "";
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";

async function downloadResource(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to download resource: ${response.statusText}`);
    }

    const htmlContent = await response.text();
    const markdownContent = htmlToText(htmlContent);

    // Evict oldest entry if cache is full (LRU policy)
    if (RESOURCE_CACHE.size >= MAX_CACHE_SIZE) {
      const oldestKey = Array.from(RESOURCE_CACHE.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp,
      )[0][0];
      RESOURCE_CACHE.delete(oldestKey);
    }

    RESOURCE_CACHE.set(url, {
      content: markdownContent,
      timestamp: Date.now(),
    });
    return markdownContent;
  } catch (error) {
    clearTimeout(timeoutId);
    // Store error message, not full content
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    RESOURCE_CACHE.set(url, { content: "ERROR", timestamp: Date.now() });
    return `Error downloading resource: ${errorMsg}`;
  }
}

export async function download_node(state: AgentState, config: RunnableConfig) {
  const resources = state["resources"] || [];
  const logs = state["logs"] || [];

  const resourcesToDownload = [];

  const logsOffset = logs.length;

  // Find resources that are not downloaded
  for (const resource of resources) {
    if (!getResource(resource.url)) {
      resourcesToDownload.push(resource);
      logs.push({
        message: `Downloading ${resource.url}`,
        done: false,
      });
    }
  }

  // Emit the state to let the UI update
  const { messages, ...restOfState } = state;
  await copilotkitEmitState(config, {
    ...restOfState,
    resources,
    logs,
  });

  // Download the resources
  for (let i = 0; i < resourcesToDownload.length; i++) {
    const resource = resourcesToDownload[i];
    await downloadResource(resource.url);
    logs[logsOffset + i]["done"] = true;
    await copilotkitEmitState(config, state);
  }
  return {
    resources,
    logs,
  };
}

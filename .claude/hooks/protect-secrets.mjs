#!/usr/bin/env node
// PreToolUse hook: stops the agent from writing secrets into the repo.
// Blocks (exit 2) when the agent tries to
//   1. edit a real env file or key file (.env, .env.local, .env.production, *.pem, *.key), or
//   2. write content that looks like a live credential (OpenRouter, Anthropic,
//      OpenAI, Google OAuth client secret, GitHub token, Render deploy hook).
// The stderr message is fed back to Claude so it can fix its approach.

import { readFileSync } from "node:fs";
import { basename } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const tool = input.tool_input ?? {};
const filePath = tool.file_path ?? "";
const name = basename(filePath);

const block = (reason) => {
  process.stderr.write(`Blocked by protect-secrets hook: ${reason}\n`);
  process.exit(2);
};

// 1. Protected files. Templates like .env.example stay editable.
const isEnvFile = /^\.env(\..+)?$/.test(name) && !name.endsWith(".example");
if (isEnvFile || /\.(pem|key)$/.test(name)) {
  block(
    `${name} holds real secrets and must not be edited by the agent. ` +
      "Put placeholders in .env.example instead and ask the user to set real values."
  );
}

// 2. Credential patterns in the new content.
const content = [
  tool.content,
  tool.new_string,
  ...(tool.edits ?? []).map((e) => e.new_string),
]
  .filter(Boolean)
  .join("\n");

const patterns = [
  [/sk-or-v1-[a-f0-9]{32,}/, "OpenRouter API key"],
  [/sk-ant-[A-Za-z0-9_-]{20,}/, "Anthropic API key"],
  [/sk-(proj-)?[A-Za-z0-9]{32,}/, "OpenAI API key"],
  [/GOCSPX-[A-Za-z0-9_-]{20,}/, "Google OAuth client secret"],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, "GitHub token"],
  [/api\.render\.com\/deploy\/srv-[a-z0-9]+\?key=/, "Render deploy hook URL"],
];

for (const [re, label] of patterns) {
  if (re.test(content)) {
    block(
      `the new content contains what looks like a real ${label}. ` +
        "Read it from an environment variable (process.env / os.environ) instead of hard-coding it."
    );
  }
}

process.exit(0);

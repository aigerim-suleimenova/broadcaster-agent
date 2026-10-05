#!/usr/bin/env node
// PostToolUse hook: lints the file the agent just edited, so problems are
// caught at the moment they are introduced instead of at review time.
//   *.py           -> ruff check <file>
//   *.ts / *.tsx   -> eslint <file> (only if node_modules is installed)
// On lint errors it exits 2: the output goes back to Claude, which fixes the
// file before moving on. Missing tools are skipped silently, never blocking.

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const filePath = input.tool_input?.file_path ?? "";
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const run = (cmd, args, cwd = root) =>
  spawnSync(cmd, args, { cwd, encoding: "utf8" });

const hasCommand = (cmd) => run("sh", ["-c", `command -v ${cmd}`]).status === 0;

let result = null;

if (filePath.endsWith(".py")) {
  if (hasCommand("ruff")) result = run("ruff", ["check", filePath]);
  else if (hasCommand("uvx")) result = run("uvx", ["ruff", "check", filePath]);
} else if (/\.(ts|tsx)$/.test(filePath)) {
  const eslint = join(root, "node_modules", ".bin", "eslint");
  if (existsSync(eslint)) result = run(eslint, [filePath]);
}

if (result && result.status !== 0) {
  process.stderr.write(
    `Lint errors in ${relative(root, filePath)} — fix them before continuing:\n` +
      (result.stdout || "") +
      (result.stderr || "")
  );
  process.exit(2);
}

process.exit(0);

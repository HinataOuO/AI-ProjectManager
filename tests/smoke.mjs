#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const source = resolve(new URL("..", import.meta.url).pathname);
const project = mkdtempSync(join(tmpdir(), "ai-project-manager-"));
const script = join(source, "scripts/ai-project.mjs");

function run(...args) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

try {
  run("init", "--project", project, "--source", source);
  for (const path of [
    ".pi/ai-project/runtime/core/KERNEL.md",
    ".pi/ai-project/local/project/PROJECT_INDEX.md",
    ".pi/skills/backend/SKILL.md",
    "AGENTS.md",
  ]) assert.ok(existsSync(join(project, path)), `missing ${path}`);

  const local = join(project, ".pi/ai-project/local/project/PROJECT_INDEX.md");
  writeFileSync(local, `${readFileSync(local, "utf8")}\n<!-- local state -->\n`);
  const before = readFileSync(local, "utf8");
  const installed = join(project, ".pi/ai-project/runtime/scripts/ai-project.mjs");
  const update = spawnSync(process.execPath, [installed, "update", "--project", project], { encoding: "utf8" });
  assert.equal(update.status, 0, update.stderr || update.stdout);
  assert.equal(readFileSync(local, "utf8"), before);
  const status = spawnSync(process.execPath, [installed, "status", "--project", project], { encoding: "utf8" });
  assert.equal(status.status, 0, status.stderr || status.stdout);
  console.log("OK installer smoke test");
} finally {
  rmSync(project, { recursive: true, force: true });
}

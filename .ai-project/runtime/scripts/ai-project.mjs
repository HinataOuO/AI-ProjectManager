#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const LOCK_FILE = ".ai-project.lock.json";
const RUNTIME_ROOT = ".ai-project/runtime";
const LOCAL_ROOT = ".ai-project/local";
const DEFAULT_SOURCE_URL = "https://github.com/HinataOuO/AI-ProjectManager.git";
const PACKAGE_EXCLUDES = new Set([
  ".git",
  ".ai-project",
  ".agents",
  ".claude",
  ".codex",
  "node_modules",
]);

const args = process.argv.slice(2);
const command = args.shift();

function usage() {
  console.log(`Usage:
  ai-project install <git-url-or-local-path> [--version <ref>] [--project <path>] [--force]
  ai-project install-here [--source <git-url-or-local-path>] [--version <ref>] [--force]
  ai-project update [--version <ref>] [--project <path>] [--force]
  ai-project status [--project <path>]
  ai-project sync-discovery [--project <path>] [--force]

Compatibility aliases:
  ai-project update-here [--version <ref>] [--force]
  ai-project status-here`);
}

function parseOptions(values) {
  const out = { _: [] };
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (!value.startsWith("--")) {
      out._.push(value);
      continue;
    }
    const key = value.slice(2);
    if (key === "force") {
      out.force = true;
      continue;
    }
    const next = values[i + 1];
    if (!next || next.startsWith("--")) throw new Error(`Missing value for --${key}`);
    out[key] = next;
    i += 1;
  }
  return out;
}

function run(cmd, runArgs, options = {}) {
  const result = spawnSync(cmd, runArgs, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.status !== 0) {
    const detail = options.capture ? `\n${result.stderr || result.stdout}` : "";
    throw new Error(`Command failed: ${cmd} ${runArgs.join(" ")}${detail}`);
  }
  return options.capture ? result.stdout.trim() : "";
}

function projectRoot(options) {
  return resolve(options.project || process.cwd());
}

function lockPath(root) {
  return join(root, LOCK_FILE);
}

function runtimePath(root) {
  return join(root, RUNTIME_ROOT);
}

function localPath(root) {
  return join(root, LOCAL_ROOT);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function packageFilter(src) {
  return !PACKAGE_EXCLUDES.has(basename(src));
}

function assertRuntimeTarget(root, target) {
  const expected = resolve(runtimePath(root));
  const actual = resolve(target);
  if (actual !== expected) {
    throw new Error(`Refusing to replace non-runtime path: ${target}`);
  }
}

function replaceRuntimeFromSource(root, source) {
  const target = runtimePath(root);
  assertRuntimeTarget(root, target);
  const parent = dirname(target);
  const temp = join(parent, `.runtime-${process.pid}-${Date.now()}`);
  mkdirSync(parent, { recursive: true });
  cpSync(source, temp, {
    recursive: true,
    dereference: false,
    filter: packageFilter,
  });
  rmSync(target, { recursive: true, force: true });
  renameSync(temp, target);
}

function copyIfMissing(source, target) {
  if (existsSync(target)) return false;
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true, dereference: false, filter: packageFilter });
  return true;
}

function listFiles(root, base = root) {
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(path, base));
    if (entry.isFile()) out.push(relative(base, path).replaceAll("\\", "/"));
  }
  return out.sort();
}

function fileHash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function hashTree(root) {
  if (!existsSync(root)) return {};
  const hashes = {};
  for (const rel of listFiles(root)) hashes[rel] = fileHash(join(root, rel));
  return hashes;
}

function diffHashes(expected, actual) {
  const changed = [];
  const all = new Set([...Object.keys(expected || {}), ...Object.keys(actual || {})]);
  for (const rel of [...all].sort()) {
    if (expected?.[rel] !== actual?.[rel]) changed.push(rel);
  }
  return changed;
}

function gitCommit(source) {
  try {
    return run("git", ["-C", source, "rev-parse", "HEAD"], { capture: true });
  } catch {
    return null;
  }
}

function packageVersion(source) {
  try {
    return readJson(join(source, "starter.json")).version || null;
  } catch {
    return null;
  }
}

function materializeSource(source, version) {
  const abs = isAbsolute(source) ? source : resolve(process.cwd(), source);
  if (isDirectory(abs)) {
    return { path: abs, cleanup: () => {}, type: "path", url: source };
  }

  const temp = mkdtempSync(join(tmpdir(), "ai-project-source-"));
  const cloneArgs = ["clone", "--depth", "1"];
  if (version) cloneArgs.push("--branch", version);
  cloneArgs.push(source, temp);
  run("git", cloneArgs);
  return {
    path: temp,
    cleanup: () => rmSync(temp, { recursive: true, force: true }),
    type: "git",
    url: source,
  };
}

function readManifest(source) {
  const manifest = readJson(join(source, "starter.json"));
  if (manifest.canonicalRoot !== ".ai-project") {
    throw new Error("starter.json canonicalRoot must be .ai-project");
  }
  return manifest;
}

function seedLocal(source, root) {
  const localProject = join(localPath(root), "project");
  const seeded = [];
  if (copyIfMissing(join(source, "project"), localProject)) seeded.push(relative(root, localProject));
  const overlayTarget = join(localProject, "overlays", "example");
  if (copyIfMissing(join(source, "overlays", "example"), overlayTarget)) seeded.push(relative(root, overlayTarget));
  return seeded;
}

function copyFileIfAllowed(source, target, force) {
  mkdirSync(dirname(target), { recursive: true });
  if (existsSync(target) && !force && readFileSync(source, "utf8") !== readFileSync(target, "utf8")) {
    console.warn(`skip existing file: ${target}`);
    return false;
  }
  cpSync(source, target);
  return true;
}

function syncDiscovery(root, force = false) {
  const runtime = runtimePath(root);
  const manifest = readManifest(runtime);
  const changed = [];

  const codexSource = join(runtime, "adapters", "codex", "AGENTS.md");
  const claudeSource = join(runtime, "adapters", "claude", "CLAUDE.md");
  if (copyFileIfAllowed(codexSource, join(root, "AGENTS.md"), force)) changed.push("AGENTS.md");
  if (copyFileIfAllowed(claudeSource, join(root, "CLAUDE.md"), force)) changed.push("CLAUDE.md");

  const agentSkills = join(root, ".agents", "skills");
  mkdirSync(agentSkills, { recursive: true });
  for (const skill of manifest.skills || []) {
    const source = join(runtime, "skills", skill);
    const target = join(agentSkills, skill);
    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });
    changed.push(relative(root, target));
  }

  const claudeCommands = join(root, ".claude", "commands");
  mkdirSync(claudeCommands, { recursive: true });
  for (const commandName of manifest.claudeCommands || []) {
    const source = join(runtime, "commands", "claude", `${commandName}.md`);
    const target = join(claudeCommands, `${commandName}.md`);
    cpSync(source, target);
    changed.push(relative(root, target));
  }

  return changed;
}

function makeLock(root, sourceInfo, sourcePath, versionRef) {
  const runtime = runtimePath(root);
  const manifest = readManifest(runtime);
  return {
    schemaVersion: 1,
    source: {
      type: sourceInfo.type,
      url: sourceInfo.url,
      ref: versionRef || null,
    },
    roots: {
      runtime: RUNTIME_ROOT,
      local: LOCAL_ROOT,
    },
    installed: {
      packageVersion: packageVersion(sourcePath),
      commit: gitCommit(sourcePath),
      installedAt: new Date().toISOString(),
    },
    skills: manifest.skills || [],
    fileHashes: hashTree(runtime),
  };
}

function runtimeDrift(root, lock) {
  return diffHashes(lock.fileHashes, hashTree(runtimePath(root)));
}

function formatList(values) {
  return values
    .slice(0, 30)
    .map((item) => `- ${item}`)
    .join("\n");
}

function assertNoRuntimeDrift(root, lock, force = false) {
  const changed = runtimeDrift(root, lock);
  if (force) return changed;
  if (changed.length > 0) {
    throw new Error(`Runtime drift detected. Re-run with --force or restore local runtime edits:\n${formatList(changed)}`);
  }
  return changed;
}

function install(options) {
  const root = projectRoot(options);
  const sourceArg = options._[0] || options.source || process.env.AI_PROJECT_MANAGER_SOURCE || DEFAULT_SOURCE_URL;
  if (!sourceArg) throw new Error("install requires <git-url-or-local-path> or --source");
  const sourceInfo = materializeSource(sourceArg, options.version);
  try {
    readManifest(sourceInfo.path);
    replaceRuntimeFromSource(root, sourceInfo.path);
    const seeded = seedLocal(sourceInfo.path, root);
    const changed = syncDiscovery(root, options.force);
    writeJson(lockPath(root), makeLock(root, sourceInfo, sourceInfo.path, options.version));
    console.log(`installed ${sourceArg}`);
    if (seeded.length) console.log(`seeded local: ${seeded.join(", ")}`);
    console.log(`synced: ${changed.length} files`);
  } finally {
    sourceInfo.cleanup();
  }
}

function update(options) {
  const root = projectRoot(options);
  const lock = readJson(lockPath(root));
  assertNoRuntimeDrift(root, lock, options.force);
  const version = options.version || lock.source.ref || undefined;
  const sourceInfo = materializeSource(lock.source.url, version);
  try {
    readManifest(sourceInfo.path);
    replaceRuntimeFromSource(root, sourceInfo.path);
    const changed = syncDiscovery(root, options.force);
    writeJson(lockPath(root), makeLock(root, sourceInfo, sourceInfo.path, version));
    console.log(`updated ${lock.source.url}`);
    console.log(`synced: ${changed.length} files`);
  } finally {
    sourceInfo.cleanup();
  }
}

function status(options) {
  const root = projectRoot(options);
  const lock = readJson(lockPath(root));
  const changed = runtimeDrift(root, lock);
  console.log(`source: ${lock.source.url}`);
  console.log(`ref: ${lock.source.ref || "(none)"}`);
  console.log(`packageVersion: ${lock.installed.packageVersion || "(unknown)"}`);
  console.log(`commit: ${lock.installed.commit || "(unknown)"}`);
  console.log(`runtimeDrift: ${changed.length}`);
  if (changed.length > 0) console.log(formatList(changed));
}

try {
  const options = parseOptions(args);
  const commands = new Map([
    ["install", install],
    ["install-here", (values) => install({ ...values, project: process.cwd() })],
    ["update", update],
    ["update-here", (values) => update({ ...values, project: process.cwd() })],
    ["status", status],
    ["status-here", (values) => status({ ...values, project: process.cwd() })],
  ]);

  if (commands.has(command)) commands.get(command)(options);
  else if (command === "sync-discovery") {
    const changed = syncDiscovery(projectRoot(options), options.force);
    console.log(`synced: ${changed.length} files`);
  } else {
    usage();
    process.exit(command ? 1 : 0);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

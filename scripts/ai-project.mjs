#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RUNTIME_ROOT = ".pi/ai-project/runtime";
const LOCAL_ROOT = ".pi/ai-project/local";
const SKILLS_ROOT = ".pi/skills";
const LOCK_FILE = ".pi/ai-project/lock.json";
const RUNTIME_FILES = ["core", "skills", "scripts"];
const args = process.argv.slice(2);
const command = args.shift();

function options(values) {
  const out = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) out._.push(value);
    else if (value === "--force") out.force = true;
    else {
      const next = values[++index];
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${value}`);
      out[value.slice(2)] = next;
    }
  }
  return out;
}

function root(values) {
  return resolve(values.project || process.cwd());
}

function pathFor(project, value) {
  return join(project, value);
}

function files(rootPath, base = rootPath) {
  if (!existsSync(rootPath)) return [];
  return readdirSync(rootPath, { withFileTypes: true }).flatMap((entry) => {
    const path = join(rootPath, entry.name);
    if (entry.isDirectory()) return files(path, base);
    return entry.isFile() ? [relative(base, path).replaceAll("\\", "/")] : [];
  }).sort();
}

function hashTree(rootPath) {
  return Object.fromEntries(files(rootPath).map((file) => [
    file,
    createHash("sha256").update(readFileSync(join(rootPath, file))).digest("hex"),
  ]));
}

function changed(expected, actual) {
  return [...new Set([...Object.keys(expected), ...Object.keys(actual)])]
    .filter((file) => expected[file] !== actual[file])
    .sort();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sourcePath(values) {
  return resolve(values.source || values._[0] || PACKAGE_ROOT);
}

function assertSource(source) {
  for (const file of ["package.json", "templates/AGENTS.md", "templates/project", ...RUNTIME_FILES]) {
    if (!existsSync(join(source, file))) throw new Error(`Invalid AI Project Manager source: ${source}`);
  }
}

function replace(source, target) {
  const temp = `${target}.tmp-${process.pid}`;
  mkdirSync(dirname(target), { recursive: true });
  rmSync(temp, { recursive: true, force: true });
  cpSync(source, temp, { recursive: true });
  rmSync(target, { recursive: true, force: true });
  renameSync(temp, target);
}

function syncRuntime(project, source) {
  const runtime = pathFor(project, RUNTIME_ROOT);
  const stage = `${runtime}.tmp-${process.pid}`;
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  for (const file of RUNTIME_FILES) cpSync(join(source, file), join(stage, file), { recursive: true });
  rmSync(runtime, { recursive: true, force: true });
  renameSync(stage, runtime);
}

function syncSkills(project, source) {
  const target = pathFor(project, SKILLS_ROOT);
  mkdirSync(target, { recursive: true });
  for (const skill of readdirSync(join(source, "skills"), { withFileTypes: true })) {
    if (!skill.isDirectory()) continue;
    replace(join(source, "skills", skill.name), join(target, skill.name));
  }
}

function seedLocal(project, source) {
  const target = pathFor(project, LOCAL_ROOT);
  if (existsSync(target)) return false;
  mkdirSync(target, { recursive: true });
  cpSync(join(source, "templates/project"), join(target, "project"), { recursive: true });
  cpSync(join(source, "templates/overlays"), join(target, "project/overlays"), { recursive: true });
  return true;
}

function syncAgents(project, source, force) {
  const target = join(project, "AGENTS.md");
  const template = join(source, "templates/AGENTS.md");
  if (existsSync(target) && !force && readFileSync(target, "utf8") !== readFileSync(template, "utf8")) {
    console.warn(`kept existing ${target}`);
    return false;
  }
  cpSync(template, target);
  return true;
}

function makeLock(source, project) {
  const manifest = readJson(join(source, "package.json"));
  return {
    source,
    version: manifest.version,
    installedAt: new Date().toISOString(),
    runtimeHashes: hashTree(pathFor(project, RUNTIME_ROOT)),
  };
}

function drift(project, lock) {
  return changed(lock.runtimeHashes, hashTree(pathFor(project, RUNTIME_ROOT)));
}

function init(values) {
  const project = root(values);
  const source = sourcePath(values);
  assertSource(source);
  syncRuntime(project, source);
  syncSkills(project, source);
  const seeded = seedLocal(project, source);
  const agents = syncAgents(project, source, values.force);
  writeJson(pathFor(project, LOCK_FILE), makeLock(source, project));
  console.log(`initialized ${project}`);
  console.log(`local: ${seeded ? "seeded" : "kept"}; AGENTS.md: ${agents ? "written" : "kept"}`);
}

function update(values) {
  const project = root(values);
  const lock = readJson(pathFor(project, LOCK_FILE));
  const dirty = drift(project, lock);
  if (dirty.length && !values.force) throw new Error(`Runtime drift detected:\n${dirty.map((file) => `- ${file}`).join("\n")}`);
  const source = sourcePath({ ...values, _: values._.length ? values._ : [lock.source] });
  assertSource(source);
  syncRuntime(project, source);
  syncSkills(project, source);
  writeJson(pathFor(project, LOCK_FILE), makeLock(source, project));
  console.log(`updated ${project}`);
}

function status(values) {
  const project = root(values);
  const lock = readJson(pathFor(project, LOCK_FILE));
  const dirty = drift(project, lock);
  console.log(`source: ${lock.source}`);
  console.log(`version: ${lock.version}`);
  console.log(`runtimeDrift: ${dirty.length}`);
  for (const file of dirty) console.log(`- ${file}`);
}

try {
  const values = options(args);
  if (command === "init") init(values);
  else if (command === "update") update(values);
  else if (command === "status") status(values);
  else {
    console.log("Usage: ai-project <init|update|status> [--project <path>] [--source <path>] [--force]");
    process.exit(command ? 1 : 0);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

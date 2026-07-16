#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] || new URL("..", import.meta.url).pathname);
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const starter = JSON.parse(readFileSync(join(root, "starter.json"), "utf8"));
const failures = [];
const requiredHeadings = ["purpose", "load", "scope", "deny", "procedure", "done"];
const piOnlyRoots = ["core", "skills", "templates/AGENTS.md", "templates/project"];

function fail(message) { failures.push(message); }
function walk(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const file = join(path, entry.name);
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
  });
}

if (!manifest.keywords?.includes("pi-package")) fail("package.json missing pi-package keyword");
if (JSON.stringify(manifest.pi?.skills) !== JSON.stringify(["./skills"])) fail("package.json pi.skills must be [./skills]");
for (const path of ["core", "skills", "starter.json", "templates/AGENTS.md", "templates/project", "scripts/ai-project.mjs", "docs", "tests"]) {
  if (!existsSync(join(root, path))) fail(`missing ${path}`);
}
if (starter.runtimeRoot !== ".pi/ai-project/runtime") fail("starter.json runtimeRoot invalid");
if (starter.localRoot !== ".pi/ai-project/local") fail("starter.json localRoot invalid");
if (starter.skillsRoot !== ".pi/skills") fail("starter.json skillsRoot invalid");

const discoveredSkills = [];
for (const directory of readdirSync(join(root, "skills"), { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  discoveredSkills.push(directory.name);
  const file = join(root, "skills", directory.name, "SKILL.md");
  if (!existsSync(file)) { fail(`missing ${relative(root, file)}`); continue; }
  const text = readFileSync(file, "utf8");
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  const name = frontmatter?.[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  const description = frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1].trim();
  if (!frontmatter) fail(`skill missing frontmatter: ${relative(root, file)}`);
  if (name !== directory.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name || "")) fail(`skill name invalid: ${relative(root, file)}`);
  if (!description || description.length > 1024) fail(`skill description invalid: ${relative(root, file)}`);
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  if (headings.join("/") !== requiredHeadings.join("/")) fail(`skill headings invalid: ${relative(root, file)}`);
}
if (JSON.stringify(starter.skills?.sort()) !== JSON.stringify(discoveredSkills.sort())) {
  fail("starter.json skills diverge from skills directory");
}

for (const file of piOnlyRoots.flatMap((path) => {
  const full = join(root, path);
  return existsSync(full) && statSync(full).isFile() ? [full] : walk(full);
})) {
  const text = readFileSync(file, "utf8");
  for (const term of [".ai-project", ".claude", ".agents"]) {
    if (text.includes(term)) fail(`legacy path ${term}: ${relative(root, file)}`);
  }
}

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("OK Pi starter valid");

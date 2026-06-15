# AI Project Starter

Portable prompt, skill, command, roadmap, memory, and issue-template starter for Codex + Claude.

Two modes:
- Template source: `AI-ProjectStarter/`. Maintained here, validated here, not loaded during normal runtime.
- Installed package: `.ai-project/runtime/`. Agents load update-safe files from here.
- Local state: `.ai-project/local/`. Project memory, overlays, and roadmap live here and are not overwritten by package updates.

## Goals
- Keep internal prompts in English.
- Respond to users in Italian by default.
- Load context lazily: kernel -> project index -> skill -> tagged memory/roadmap shard.
- Keep files small and deduplicated.
- Preserve tool safety: explicit confirmation before writes that close roadmap work or push git history.

## Layout
- `core/`: shared rules loaded by all agents.
- `adapters/`: Codex and Claude entrypoints generated from shared rules.
- `starter.json`: manifest for skills, commands, required files, tags, and roadmap layers.
- `skills/`: portable task skills. Installed under `.ai-project/runtime/skills/`.
- `commands/claude/`: slash-command wrappers. Installed under `.ai-project/runtime/commands/claude/`.
- `project/`: local project index, memory shards, and roadmap templates. Seeded to `.ai-project/local/project/`.
- `github/ISSUE_TEMPLATE/`: GitHub issue templates.
- `overlays/example/`: placeholder overlay shape only. Real overlays are seeded under `.ai-project/local/project/overlays/`.

## Install

Use Git as the package source:

```bash
node AI-ProjectStarter/scripts/ai-project.mjs install <git-url-or-local-path> --version v2.0.0
```

Installer behavior:
- copies package files into `.ai-project/runtime/`
- seeds `.ai-project/local/project/` only when missing
- writes `.ai-project.lock.json`
- syncs root `AGENTS.md`, root `CLAUDE.md`, `.agents/skills/`, and `.claude/commands/`

Update:

```bash
node .ai-project/runtime/scripts/ai-project.mjs update
node .ai-project/runtime/scripts/ai-project.mjs status
node .ai-project/runtime/scripts/ai-project.mjs sync-discovery
```

Do not add real project overlays to `AI-ProjectStarter/`. Keep project names, paths, aliases, DB quirks, domain facts, and private conventions in `.ai-project/local/project/`.

## Runtime Loading
Runtime agents load:
- `.ai-project/runtime/core/`
- `.ai-project/local/project/PROJECT_INDEX.md`
- matching `.ai-project/runtime/skills/<name>/SKILL.md`
- tagged memory/roadmap shards only when required

Runtime agents must not load `README.md`, `MIGRATION.md`, or `CHECKS.md` unless maintaining or validating the starter itself.

## Validate

```bash
bash AI-ProjectStarter/scripts/validate-starter.sh
```

## Token Check
Validator `word_count` uses same file set as:

```bash
find AI-ProjectStarter/core AI-ProjectStarter/skills AI-ProjectStarter/commands/claude AI-ProjectStarter/project/memory AI-ProjectStarter/github/ISSUE_TEMPLATE \
  -type f \( -name '*.md' -o -name '*.yml' -o -name '*.yaml' \) -print0 |
  xargs -0 wc -w
```

Target: stay under 3000 words.

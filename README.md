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

## Install And Update

Fast install without cloning this repository first:

```bash
curl -fsSL <raw-script-url> | node - install <git-url> --version v2.0.0
```

Use the raw URL for `scripts/ai-project.mjs` as `<raw-script-url>`, and the package repository URL as `<git-url>`. The script downloads the package into `.ai-project/runtime/`, seeds local project state, and writes `.ai-project.lock.json`.

If the repository is already cloned locally, run:

```bash
node /path/to/AI-ProjectStarter/scripts/ai-project.mjs install <git-url-or-local-path> --version v2.0.0
```

Installer behavior:
- copies package files into `.ai-project/runtime/`
- seeds `.ai-project/local/project/` only when missing
- writes `.ai-project.lock.json`
- syncs root `AGENTS.md`, root `CLAUDE.md`, `.agents/skills/`, and `.claude/commands/`

After install:

```bash
git add AGENTS.md CLAUDE.md .agents .claude .ai-project.lock.json .ai-project/local
git commit -m "chore: install AI project manager"
```

Commit `.ai-project/local/` because it contains project memory, overlays, and roadmap state. Do not edit `.ai-project/runtime/` by hand; it is package-managed.

Update the package:

```bash
node .ai-project/runtime/scripts/ai-project.mjs update
git diff
git add AGENTS.md CLAUDE.md .agents .claude .ai-project.lock.json .ai-project/runtime
git commit -m "chore: update AI project manager"
```

Check installed state:

```bash
node .ai-project/runtime/scripts/ai-project.mjs status
```

Regenerate discovery copies after manual cleanup or adapter changes:

```bash
node .ai-project/runtime/scripts/ai-project.mjs sync-discovery
```

If `update` reports runtime drift, someone edited `.ai-project/runtime/` locally. Move useful changes into `.ai-project/local/` or the source repo, then rerun `update`; use `--force` only to discard local runtime edits.

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

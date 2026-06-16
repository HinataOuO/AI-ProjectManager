# AI Project Starter Maintainer Notes

Starter maintenance context only. Runtime agents must not load this file unless maintaining or validating the starter.

## Modes

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
- `project/`: packaged local-state templates. Installed under `.ai-project/runtime/project/` and seeded to `.ai-project/local/project/` only during install when missing.
- `github/ISSUE_TEMPLATE/`: GitHub issue templates.
- `overlays/example/`: placeholder overlay shape only. Real overlays are seeded under `.ai-project/local/project/overlays/`.

## Install Behavior

The installer:

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

If `update` reports runtime drift, someone edited `.ai-project/runtime/` locally. Move useful changes into `.ai-project/local/` or the source repo, then rerun `update`; use `--force` only to discard local runtime edits.

`update` is cwd-first: run `node .ai-project/runtime/scripts/ai-project.mjs update` from the target repository, or pass `--project <path>`. It only replaces `.ai-project/runtime/`, refreshes discovery files, and rewrites `.ai-project.lock.json`; it never overwrites `.ai-project/local/`.

Do not add real project overlays to `AI-ProjectStarter/`. Keep project names, paths, aliases, DB quirks, domain facts, and private conventions in `.ai-project/local/project/`.

## Runtime Loading

Runtime agents load:

- `.ai-project/runtime/core/`
- `.ai-project/local/project/PROJECT_INDEX.md`
- matching `.ai-project/runtime/skills/<name>/SKILL.md`
- tagged memory/roadmap shards only when required

Runtime agents must not load `README.md`, `SKILL_README.md`, `MIGRATION.md`, or `CHECKS.md` unless maintaining or validating the starter itself.

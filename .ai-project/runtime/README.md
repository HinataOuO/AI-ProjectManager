# AI Project Starter

Portable starter for Codex and Claude project agents: shared core rules, task skills, commands, project memory templates, roadmap templates, and GitHub issue templates.

Detailed maintainer and runtime notes live in `SKILL_README.md`.

## Install

Fast install into the current repository:

```bash
curl -fsSL https://raw.githubusercontent.com/HinataOuO/AI-ProjectManager/main/scripts/ai-project.mjs | node - install-here
```

Install from a local clone:

```bash
node /path/to/AI-ProjectStarter/scripts/ai-project.mjs install <git-url-or-local-path> --version v2.0.0
```

Commit installed files:

```bash
git add AGENTS.md CLAUDE.md .agents .claude .ai-project.lock.json .ai-project/local
git commit -m "chore: install AI project manager"
```

## Update

```bash
node .ai-project/runtime/scripts/ai-project.mjs update
git diff
git add AGENTS.md CLAUDE.md .agents .claude .ai-project.lock.json .ai-project/runtime
git commit -m "chore: update AI project manager"
```

`update` only replaces `.ai-project/runtime/`, refreshes discovery files, and rewrites `.ai-project.lock.json`. It never overwrites `.ai-project/local/`.

## Status

```bash
node .ai-project/runtime/scripts/ai-project.mjs status
```

## Sync Discovery

```bash
node .ai-project/runtime/scripts/ai-project.mjs sync-discovery
```

## Validate

From this repository:

```bash
bash scripts/validate-starter.sh
```

From a parent directory:

```bash
bash AI-ProjectStarter/scripts/validate-starter.sh
```

## Token Check

```bash
find core skills commands/claude project/memory github/ISSUE_TEMPLATE \
  -type f \( -name '*.md' -o -name '*.yml' -o -name '*.yaml' \) -print0 |
  xargs -0 wc -w
```

Target: stay under 3000 words.

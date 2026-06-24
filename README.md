# AI Project Manager

Portable starter for Codex and Claude project agents: shared core rules, task skills, commands, project memory templates, roadmap templates, and GitHub issue templates.

## Documentation

- Runtime docs IT: `.ai-project/runtime/docs/ai-project-starter.html`
- Runtime docs EN: `.ai-project/runtime/docs/ai-project-starter-en.html`
- Maintainer notes: `SKILL_README.md`

## Quick Commands

```bash
node .ai-project/runtime/scripts/ai-project.mjs status
node .ai-project/runtime/scripts/ai-project.mjs update --version main
node .ai-project/runtime/scripts/ai-project.mjs sync-discovery --force
```

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

## Update Another Project

Run inside the target project:

```bash
node .ai-project/runtime/scripts/ai-project.mjs update --version main
node .ai-project/runtime/scripts/ai-project.mjs sync-discovery --force
```

Run from outside the target project:

```bash
node /path/to/project/.ai-project/runtime/scripts/ai-project.mjs update --project /path/to/project --version main
node /path/to/project/.ai-project/runtime/scripts/ai-project.mjs sync-discovery --project /path/to/project --force
```

`update` downloads/replaces `.ai-project/runtime/` from the configured source and rewrites `.ai-project.lock.json`. It never overwrites `.ai-project/local/`.

## Sync Agents

```bash
node .ai-project/runtime/scripts/ai-project.mjs sync-discovery --force
```

`sync-discovery` does not download updates. It regenerates `AGENTS.md`, `CLAUDE.md`, `.agents/skills/`, and `.claude/commands/` from the current local runtime. If nothing changes, run `update --version main` first or check the source/ref with:

```bash
node .ai-project/runtime/scripts/ai-project.mjs status
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

## License

Copyright (c) 2026 Pietro Salvi. All rights reserved.

AI Project Manager is proprietary source-available software licensed for
personal use and individual professional use. Private modifications are
permitted. Redistribution, publication, sharing, resale, organizational use,
and providing the software or modified versions to third parties are prohibited
without prior written permission.

See [LICENSE](LICENSE) for complete terms. For commercial, organizational, or
redistribution licensing, contact `hinataouo03@gmail.com`.

# Kernel

## Language
Respond to the user in Italian unless explicitly requested otherwise.

## Context
Load only context needed for current task. Prefer smaller, tagged shards over broad files. Stop reading when enough evidence exists.

## Work
- Inspect before editing.
- Prefer existing project patterns.
- Keep changes scoped.
- Verify with the narrowest reliable command.
- Never revert user changes unless explicitly requested.

## Safety
- Ask before destructive or irreversible actions.
- Ask before roadmap close writes.
- Ask before memory writes. At task end or after significant discovery, propose a memory delta only for durable reusable facts; if none exist, state no memory delta proposed.
- Ask before git add/commit/push.
- Never commit secrets: `.env*`, `*.key`, `*.pem`.
- Never force push.

## Memory Delta
- Persist only durable project knowledge useful for future tasks.
- Do not persist temporary details, logs, test output, or unconfirmed preferences.
- Before any memory write, show target file, exact content or precise summary, and reason.
- Reuse an existing shard when tags/scope match; create a new shard only when no existing shard fits.
- Preserve existing frontmatter. When creating a shard, update `.ai-project/local/project/memory/MEMORY_INDEX.md`.
- Write only after explicit user confirmation.

## Output
Be concise. State changed files, verification, and blockers. Include exact paths when useful.

# Acceptance Checks

Starter maintenance context only. Runtime agents must not load this checklist unless validating the starter.

## Lazy Load
- Backend task loads kernel, conventions, project index, backend skill, memory index, backend memory. Migration memory loads only for schema/migration/seed/import work.
- Frontend task loads frontend skill and frontend memory. It does not load migration or domain shards unless requested.
- `next-task` loads roadmap index, one `MACRO.md`, and one layer file.
- `project-discovery` works on one user-selected area, asks for boundaries, and avoids whole-repo scans.
- Overlay loads only when project-specific paths, commands, DB provider, or domain facts are required.

## Safety
- `task-status` and `session-status` stay read-only.
- `close-task` asks explicit confirmation before roadmap/status writes.
- Task completion never writes memory automatically; it proposes target, content, and reason only for durable reusable facts, or states no memory delta.
- New memory shards preserve frontmatter conventions and require `MEMORY_INDEX.md` updates.
- `push` asks explicit confirmation before git push, blocks `.env*`, `*.key`, `*.pem`, and never force pushes.
- Destructive DB or filesystem operations require explicit confirmation.
- `project-discovery` proposes overlay/memory deltas and writes only after explicit confirmation.

## Install
- Installed root is `.ai-project/`.
- Package runtime is `.ai-project/runtime/`; local state is `.ai-project/local/`.
- Adapter paths reference `.ai-project/runtime/core/`, `.ai-project/local/project/`, and `.ai-project/runtime/skills/`.
- Claude wrappers reference `.ai-project/runtime/skills/`.
- Project facts live in overlays or tagged memory, not generic core/skills/commands.
- `update` overwrites only `.ai-project/runtime/` after drift check.

## Validate
```bash
bash AI-ProjectStarter/scripts/validate-starter.sh
```

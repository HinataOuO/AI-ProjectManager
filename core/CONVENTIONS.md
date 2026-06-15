# Conventions

## Tags
- `always`: user preferences, durable workflow rules.
- `backend`: server code, DB access, API, auth, validation.
- `frontend`: UI, components, styles, i18n strings.
- `migration`: schema changes, migrations, seeds, import scripts.
- `discovery`: confirmed project map, paths, commands, and architecture notes.
- `domain`: project domain rules.
- `roadmap`: task planning and completion state.

## Roadmap Status
- `todo`: not started.
- `wip`: active.
- `blocked`: waiting on external input.
- `done`: complete and verified.

## Layer Names
- `database`
- `backend`
- `frontend`
- `verify`

## Memory Frontmatter

```yaml
---
id: short-id
tags: [always]
load: always
updated: YYYY-MM-DD
depends: []
---
```

## Memory Writes
- Memory lives under `.ai-project/local/project/memory/`.
- Keep existing frontmatter when editing shards.
- Use existing shards when tags and scope match.
- Create a new shard only when no existing shard fits.
- Update `MEMORY_INDEX.md` when creating a new shard.
- Never write memory automatically; propose target, content, and reason, then wait for explicit confirmation.

## Skill Body Shape
Use only these headings after frontmatter:

```markdown
## purpose
## load
## scope
## deny
## procedure
## done
```

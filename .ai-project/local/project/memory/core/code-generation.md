---
id: code-generation
tags: [always]
load: always
updated: 2026-06-18
depends: []
---

- Before editing code, read nearby files, existing patterns, helpers, types, and focused tests.
- Keep code simple, linear, readable, and explicit. Prefer clear names over clever shortcuts.
- Balance simplicity and performance. Avoid unnecessary work, repeated computation, expensive queries, costly renders, and avoidable allocations without adding premature complexity.
- Organize code by topic and responsibility. Split UI, business logic, data access, validation, types, and configuration when a file starts mixing concerns.
- Keep files focused. Avoid catch-all files that accumulate unrelated behavior.
- Avoid needless duplication. Extract helpers, components, or modules only when duplication is real or complexity is already clear.
- Follow existing project structure, naming, libraries, and style before introducing new patterns.
- Validate external input at boundaries: API, forms, database, files, environment, and external integrations.
- Make errors explicit. Do not hide failures behind silent fallbacks when that can mask bugs or bad data.
- Keep refactors inside the task boundary unless the user asks for broader cleanup.
- After edits, run the narrowest reliable verification. If verification cannot run, state why.
- Before finishing, review the diff for readability, baseline performance, duplication, file organization, user changes, and regressions.

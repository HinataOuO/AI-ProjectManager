---
name: feature-plan
description: Turn a broad feature request into atomic single-layer roadmap task files.
---

## purpose
Create explicit mini-task plans for broad work without loading or polluting feature implementation context.

## load
- `core/KERNEL.md`
- `core/CONVENTIONS.md`
- `.ai-project/local/project/PROJECT_INDEX.md`
- `.ai-project/local/project/memory/MEMORY_INDEX.md` only when the request names a domain needing known project facts.

## scope
- User-invoked planning for broad features.
- Output Markdown plan files under `.ai-project/local/project/roadmap/plans/R1/` named `R1.1.md`, `R1.2.md`, and so on.
- Each plan file covers exactly one layer: `database`, `backend`, `frontend`, or `verify`.

## deny
- Do not auto-trigger for ordinary analysis.
- Do not edit product code, migrations, tests, or roadmap status while planning.
- Do not create a task that crosses more than one layer.
- Do not load broad memory, roadmap layers, or source files unless needed to name precise allowed files.

## procedure
1. Read the user request and the smallest project context needed to identify affected layer boundaries.
2. Classify work into separate layer buckets: `database`, `backend`, `frontend`, and `verify`.
3. Split each bucket into monothematic mini-tasks; create integration checks as `verify` tasks instead of mixed-layer tasks.
4. For each task, create the next `R1.x.md` file in `.ai-project/local/project/roadmap/plans/R1/`.
5. Each `R1.x.md` must contain these sections: `Title`, `Goal`, `Layer`, `Skill`, `Allowed files`, `Out of scope`, `Context to load`, `Implementation instructions`, `Verification`, `Done criteria`.
6. Keep `Allowed files` precise: exact paths or tight patterns only.
7. In `Out of scope`, name the feature parts the task must ignore even when related.

## done
- Plan files exist in `.ai-project/local/project/roadmap/plans/R1/`.
- Every task has one layer only.
- Every task names one primary skill.
- Every task includes allowed files, excluded scope, implementation instructions, verification, and done criteria.

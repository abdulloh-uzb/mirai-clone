---
name: implement-spec
description: "Implement a spec and its tickets: the main session (Opus) plans each ticket, Sonnet implementer agents write all the code. Project copy of mattpocock-skills:implement-spec."
disable-model-invocation: true
---

You have been given a spec (e.g. `.scratch/<feature>/spec.md`) with tickets in `.scratch/<feature>/issues/`. The issue tracker is described in `docs/agents/issue-tracker.md`.

The goal is the whole spec implemented on one **integration branch**, with every ticket resolved the way the tracker closes work.

## Who does what

- **You (the main session, Opus) plan and coordinate. You never write or edit application code, tests, migrations or seed files.** You may write plan files, ticket status and comments, and run git and the merge script.
- **All code is written by the `implementer` agent** (`.claude/agents/implementer.md`, pinned to Sonnet). Always spawn it with `subagent_type: "implementer"`. Never use `fork` or `general-purpose` for code: those would run on Opus.
- Coordinate from this session. Do not spawn a coordinator subagent: it gets cut off while waiting on its children.

## The task graph

Tickets are not a list of steps. Each has a `**Blocked by:**` line, so they form a graph with a **frontier**: tickets that are open and whose blockers are all `resolved`. Work the frontier, **at most 2 implementers at a time** (ADR 0002: one shared local stack, about 5 GB of RAM).

## Steps

1. **Read** the spec, every ticket, `CLAUDE.md`, `GLOSSARY.md` and `docs/adr/`. Work out the frontier.

2. **Integration branch.** Use the one named in the spec, or create `<feature>` from `main`. Commit the spec and tickets there if they aren't yet.

3. **Plan each frontier ticket (you, Opus).** Before spawning its implementer, explore the code the ticket touches and write `.scratch/<feature>/plans/NN-<slug>.md`:
   - **Goal**: one sentence, pointing at the ticket.
   - **Files**: each file to add or change, with what changes and why.
   - **Data**: migrations (columns, constraints, RLS policies), seed files, regenerated types.
   - **Interfaces**: names and signatures of the new functions, components and server actions, and which existing helpers to reuse (with paths).
   - **Test slices**: the ordered red-green slices for `/tdd`: what each test asserts and at which seam (unit, db, e2e).
   - **Risks**: rules from `CLAUDE.md` this ticket could break, and decisions left as `TODO(spec):`.

   Keep it to what an implementer can't infer from the ticket and code. Commit the plan to the integration branch before spawning.

4. **Spawn implementers** for up to 2 planned frontier tickets, in the background, each with `isolation: "worktree"`, `subagent_type: "implementer"`. Prompt with pointers only: spec path, ticket path, plan path, integration branch name. Tell each to report only after its own `pnpm check:locked` has exited.

5. **When an implementer reports:**
   - If it reports the plan was wrong, fix the plan (you) and resume the same agent with SendMessage. Don't write the code yourself.
   - Otherwise merge: from its worktree, run `scripts/merge-ticket.sh <integration-branch>`. If the gate fails, send the failure back to the same implementer and wait for a new report.
   - Resolve the ticket on the integration branch: `Status: resolved`, checklist ticked, a `## Comments` entry naming the commit and test counts.

6. **Recompute the frontier.** Plan and spawn the newly unblocked tickets, keeping at most 2 running.

7. **When all tickets are resolved**, call the Skill tool with `mattpocock-skills:code-review` on the integration branch against `main`. Write a fix plan for its findings (you), then hand it to **one** `implementer` agent. Merge that through the gate too.

8. **Report** the integration branch, the commits, test counts, and every `TODO(spec):` left behind. Don't merge into `main`, and don't push, unless the user asks.

9. **Clean up** the implementer worktrees (`git worktree remove`) once their work is merged.

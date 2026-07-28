---
name: land
description: End-of-work landing procedure — run every validation gate, self-review the final diff, write the changeset/changelog, craft the commit(s), and produce an honest handoff. Use before committing/pushing non-trivial work, when asked to "wrap up", "ship it", "land this", or prepare work for review.
---

Landing is where quality claims become checkable. Nothing gets stated in the
handoff that a gate or a diff line can't back up.

## Phase 1 — Final diff self-review

Read the complete diff as a reviewer, not the author (`deep-review` eyes,
scaled to size). Specifically hunt landing-time defects: debug leftovers,
commented-out code, TODOs that should be issues, accidental formatting
churn, files touched but not needed, test edits that changed expected
behavior without justification, and scope creep that belongs in a separate
commit.

## Phase 2 — Gates

Run the project's full gate set — suite, typecheck, formatter/linter, plus
any repo-specific gates (generated-file regeneration, docs sync, parity
tables). Repo conventions define the list (CLAUDE.md / CI config beats
memory). Rules:
- Green means green: no skipped tests, no "unrelated" failures waved
  through. A pre-existing failure is only pre-existing after you prove it
  (reproduce on the base without your diff) — then report it explicitly.
- Behavior that ships in multiple build modes was validated in each.
- If any gate is slow, run it anyway; landing unvalidated to save minutes
  costs days downstream.

## Phase 3 — User-facing record

- Changeset/changelog for user-facing changes, describing the CONTRACT
  change (what consumers can now rely on / must change), not the diff
  mechanics. Docs and status tables that state capabilities get updated in
  the same change that alters them.
- Version-track discipline per project rules (alpha/patch tracks, semver).

## Phase 4 — Commits

- History that reviews well: separate mechanical moves from behavior
  changes; substrate before features. Each commit message: what changed at
  the contract level, why, and any non-obvious constraint the diff can't
  show. Follow the user's and repo's commit conventions exactly (trailers,
  attribution, style) — user-level rules override tool defaults.
- Push only what was asked; never open PRs, tag, or publish beyond the
  request.

## Phase 5 — Handoff

Lead with the outcome. Then, in complete sentences: what changed and where,
every gate run with its result (verbatim numbers), what was deliberately
deferred (with the reason and where it's tracked), risks and pre-existing
issues found (with the ruling-out evidence), and the natural next increment.
Certainty must match validation: "verified by X" or "not verified" — never
implied confidence.

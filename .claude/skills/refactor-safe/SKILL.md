---
name: refactor-safe
description: Behavior-preserving refactoring procedure — characterize current behavior at the observation boundary, restructure in small always-green steps, never mix behavior change with movement, and prove preservation. Use when asked to refactor, extract, unify duplicated code, restructure modules, or clean up "without breaking anything".
---

A refactor's definition of success is: every consumer-observable behavior is
identical, and the code is structurally better. Anything else is a rewrite
wearing a refactor's name — that can be the right call, but it must be
declared, reviewed, and tested as a behavior change.

## Phase 1 — Characterize before touching

- Identify the observation boundary of the code being moved: public API,
  emitted events, rendered output, published diagnostics. List the promises
  (including identity/ordering/timing ones consumers may have inferred).
- Verify the existing suite actually pins those promises at the boundary
  (run `test-hardening` Phase 2 thinking). Where it doesn't, add
  characterization tests FIRST — they encode today's behavior, bugs
  included; fixing a discovered bug is a separate, labeled change.
- Read design docs for intentional oddities before "simplifying" them away.

## Phase 2 — Plan the seam

- Name the target structure and why it's better: one source of truth
  replacing duplicates, a real signal replacing a heuristic, an extracted
  contract two consumers share. If you can't state the structural claim in
  one sentence, the refactor is unscoped.
- Order steps so each is independently green and revertible: introduce the
  new path → migrate consumers one by one → delete the old path. Never
  leave both paths alive at the end (that's the anti-goal: two ways to do
  the same thing).
- Old-path deletion is part of THIS refactor, not a follow-up ticket.

## Phase 3 — Execute in small green steps

- One mechanical transformation per step (extract, inline, move, rename,
  swap implementation behind unchanged contract). Run the focused suite
  every step; full suite at milestones.
- Behavior changes discovered mid-flight (a bug, a better contract) go on a
  list — do NOT fold them in. Finish the preserving refactor, then apply
  them as their own reviewed changes with their own tests.
- Watch the classic preservation traps: error paths and fallbacks (often
  unasserted), lazy vs eager evaluation timing, iteration order, `this`/
  closure capture, and idle-cost regressions (a refactor that adds an
  allocation to a hot path preserved behavior but broke the perf contract —
  Big-O and idle cost are part of what you preserve).

## Phase 4 — Prove and report

Full suite + typecheck + format gates green; diff reviewed with `deep-review`
eyes (especially: did any test get edited to pass? — editing expected
behavior in tests during a "preserving" refactor is a red flag to justify
explicitly). Report: the structural claim, the step sequence, evidence of
preservation, and the deferred behavior-change list.

---
name: deep-review
description: Principal-grade multi-dimension code review of a diff, branch, PR, or subsystem — correctness, lifecycle/concurrency, performance (time & space), API contracts, tests, and design altitude, with every finding adversarially verified before it is reported. Use when asked to "review", "audit the code", "check this PR/branch", or before merging non-trivial work.
---

Review as a principal engineer: findings are claims you have verified, not
patterns you noticed. The deliverable is a ranked, evidence-backed report.

## Phase 1 — Scope

- Establish the exact diff (branch vs merge-base, PR head, or working tree)
  and read the surrounding owning code, not just changed lines.
- Read design docs / stated intentional divergences FIRST (project docs,
  CLAUDE.md, `docs/`). A "bug" that matches a documented divergence is not a
  finding — flagging it as one is a review defect.

## Phase 2 — Dimension passes

Run each dimension as its own pass. For repo-scale scope, fan out one parallel
subagent per dimension (Agent tool; Workflow if the skill user asked for
orchestration) and synthesize.

1. **Correctness** — wrong output, missed edge, broken invariant. Every
   suspicion must be developed into a concrete failure scenario:
   inputs/state → wrong observable outcome. No scenario, no finding.
2. **Lifecycle & concurrency** — init order, re-entrancy, teardown,
   use-after-teardown, races between scheduled work and consumers, leaks
   (undetached listeners, strong maps keyed by object lifetime).
3. **Performance (time & space)** — state Big-O of new loops and structure
   choices on hot paths; hunt per-event allocation, O(n) work per operation
   where O(1) amortized exists, unbounded buffers/caches, nonzero idle cost
   in optional subsystems, module-eval side effects that defeat tree-shaking.
4. **API & contracts** — does the public surface promise what the
   implementation guarantees? Semver impact, naming, boolean traps, missing
   capability detection, guarantees that should be left unspecified.
5. **Tests** — do they assert at the observation boundary? Would a realistic
   broken implementation fail them? Any internals pinned (helper names, call
   order, exact counts) that a refactor would break? Optimization claims
   smuggled into correctness tests?
6. **Readability & altitude** — duplication that should be one source of
   truth, heuristics where a real signal exists, layering violations,
   comments that narrate instead of stating constraints.

## Phase 3 — Adversarial verification

For each candidate finding, actively try to refute it: read the callers,
check guards upstream, run the code path or a focused test when feasible.
Kill findings you cannot confirm; downgrade to "plausible" only when
verification is genuinely impossible. Never report a finding you have not
tried to kill.

## Phase 4 — Report

Rank most-severe first. Each finding: one-sentence claim, concrete failure
scenario, file:line, proposed fix, and how it was verified. Separate
**must-fix** (correctness/leaks/contract breaks) from **worth doing**
(perf/design) from **taste**. State explicitly what dimensions came back
clean — silence is not a verdict.

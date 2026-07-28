---
name: perf-audit
description: Systematic performance audit of a module, subsystem, or diff — hot-path inventory, Big-O in time AND space, allocation discipline, idle cost of optional features, boundedness of buffers/caches, GC/churn behavior, and bundle/tree-shaking impact. Use when asked about performance, "is this fast/scalable", optimization opportunities, or before accepting code that runs per-event/per-frame/per-render.
---

Audit for the dynamic worst case — millions of entities, constant churn —
then verify the idle case costs nothing. Measure before claiming; a perf
finding without a mechanism (why it is slow) is a guess.

## Phase 1 — Hot-path inventory

Map every path that runs per render/event/frame/request/keystroke, and every
path that runs per entity on mount/unmount. These are the audit surface;
one-time setup code is out of scope unless it blocks startup.

## Phase 2 — Complexity table (the core deliverable)

For each hot path and data structure, record:

| Path / structure | Time | Space | Runs per | Idle cost | Issue |

- No O(n) scan per operation where O(1) amortized exists (prune-on-read,
  sweep-on-access, linear registry lookups → replace with weak refs +
  GC-driven reclamation, reverse maps, or event-driven invalidation).
- Space counts too: per-entity bookkeeping (WeakRef, map entry, closure)
  must be justified and reclaimed automatically; transient garbage on
  per-event paths must be eliminated or pooled.
- Nested loops over correlated collections are O(n·m) until proven otherwise
  — read the helper implementations, complexity hides in callees.

## Phase 3 — Allocation & fast-path discipline

- Per-event/per-frame paths: no array/object/closure allocation when a
  boolean gate, reused buffer, or lazy pull avoids it. Check that producers
  skip work entirely when no consumer exists (one boolean/size check max).
- Batching and throttling live at system boundaries (commit, frame, flush),
  not scattered mid-logic. Push small identity-bearing events; pull heavy
  state lazily.

## Phase 4 — Boundedness & lifecycle

- Every buffer, cache, queue, and registry has a bound and an eviction
  policy, or a GC-coupled lifetime (WeakMap/WeakRef + FinalizationRegistry).
  Unbounded growth is a defect even with small entries.
- Churn test mentally: mount/unmount 1M entities — what remains? Anything
  requiring a manual sweep is a finding.

## Phase 5 — Build & bundle

- Optional subsystems fold to dead code when disabled: compile-time defines,
  no module-eval side effects, registration only through gated calls.
- Check that the production build actually tree-shakes the feature (grep the
  output or the gating pattern).

## Phase 6 — Verify & rank

Benchmark or profile the top suspects when the project has a harness; never
put exact counts/bytes into correctness tests — they belong in benchmarks
with controls. Report ranked by (impact × frequency) / effort, each with:
mechanism, evidence, fix, and expected complexity change (e.g., "O(ids) per
getTree → O(1) via FinalizationRegistry").

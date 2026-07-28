---
name: leak-hunt
description: Memory and lifecycle audit — find unbounded growth, retained objects, undetached listeners, strong references keyed by object lifetime, missing teardown, and use-after-teardown hazards. Use when asked about memory, leaks, "does this clean up", long-session stability, or when reviewing anything with subscriptions, caches, registries, or observers.
---

Assume a long-lived session with heavy churn: entities mount and unmount by
the million, panels open and close, hot reload fires repeatedly. Anything
that grows without a matching reclamation path is a defect — even if each
entry is tiny.

## Phase 1 — Inventory retention roots

Grep and read for every module-level `Map`, `Set`, array, cache, registry,
listener collection, and closure captured by long-lived schedulers. For each,
answer: what is the key's lifetime, who removes entries, and what bounds the
size? "Nobody / nothing" is a finding.

## Phase 2 — Lifetime-coupling audit

- Anything keyed by an object's lifetime uses WeakMap/WeakSet, or WeakRef +
  FinalizationRegistry when a reverse (id → object) lookup is needed.
  Observability and instrumentation must NEVER extend an object's lifetime.
- Reclamation must be O(1) and automatic (GC callback, unmount hook, event).
  Periodic sweeps and prune-on-read are findings: they trade a leak for an
  O(n) tax and still leak between sweeps.
- Check FinalizationRegistry usage is guarded for hosts without it, and that
  the degraded mode fails toward "no reverse lookup," not "strong retention."

## Phase 3 — Subscription symmetry

Every subscribe/on/addEventListener/observe has a reachable detach path that
actually runs: on teardown, on error, and on the early-return branches.
Verify the detach is used by real callers, not merely returned. Idempotent
double-detach and detach-during-dispatch must be safe.

## Phase 4 — Teardown & use-after-teardown

Walk destroy/unmount/dispose paths: do they null out or release everything
the init path acquired (DOM refs, timers, rAF loops, observers, ports)?
Then walk the opposite direction: every public method called AFTER teardown
must degrade to a documented answer (null/empty/no-op), never throw or
resurrect state. Caches keyed by torn-down objects must not be repopulated
by late reads.

## Phase 5 — Churn simulation

Mentally (or with a stress test where a harness exists) run: mount N,
unmount N, repeat. What is the steady-state size of every structure from
Phase 1? Also run the hot-reload case: module state that survives reload but
re-registers listeners doubles them — check registration idempotency
(Set-backed listeners, install guards).

## Deliverable

Leak inventory: structure → key lifetime → growth trigger → reclamation path
(or NONE) → fix, ranked by growth rate × session length. State explicitly
which structures were audited and found clean.

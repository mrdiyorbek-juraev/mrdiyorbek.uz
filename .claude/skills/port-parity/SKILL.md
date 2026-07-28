---
name: port-parity
description: Port a library, component, or behavior from a reference implementation (React ecosystem lib → another runtime, upstream package → binding) with proof of parity — contract extraction, port-strategy decision, differential testing, and documented intentional divergences. Use when asked to "port X", create a binding, mirror upstream behavior, or verify an existing port's fidelity.
---

Port the contract, not the code. The reference's internals encode ITS
runtime's constraints; your target has different ones. Fidelity is proven
differentially, never assumed from structural similarity.

## Phase 1 — Extract the reference contract

Read the reference's public docs, types, AND its test suite — tests are the
executable spec and catch promises the docs omit. Inventory: public surface,
observable behaviors (output, ordering, timing, identity), error semantics,
and which internals leak into the contract (e.g., synthetic events, fiber
timing) vs which are free to differ. Pin the exact upstream version audited.

## Phase 2 — Decide the port strategy (and challenge it)

- **Contract port** (reimplement behavior natively): right when the
  reference is welded to its runtime's internals. **Code port** (adapt
  source): right when logic is runtime-agnostic. Mixed is normal — decide
  per layer, record the decision and why.
- Identify what the reference does that your runtime already provides
  first-class (don't port a workaround for a problem you don't have) and
  what needs NEW substrate in the target platform — build that substrate in
  the owning layer, never inside the port.
- Run the `challenge` gauntlet on scope: which upstream features are needed
  now, which are explicitly out of scope (documented), which are seams.

## Phase 3 — Implement against the target's idioms

Follow the target codebase's patterns (gating, lifecycle, allocation
discipline, naming) — a port that imports the reference's idioms wholesale
is a second dialect to maintain. Every place behavior deliberately differs
gets an inline `// DIVERGENCE:` note with rationale at the point of
divergence, plus an entry in the port's status/parity doc.

## Phase 4 — Differential proof

- Strongest: run the SAME fixture through both implementations, drive
  identical inputs/events, byte-compare observable output at each step.
  Build the rig once; every future fixture is cheap.
- Where output comparison can't observe the promise (effect ordering, focus,
  DOM identity, move patterns), add focused behavioral assertions citing the
  reference test they mirror.
- Port the reference's OWN test cases for in-scope behavior, asserting the
  target's observable outcome (never the reference's internals). Every
  ported case resolves to passing, out-of-scope-with-reason, or
  divergence-with-rationale — no skips, no todos left behind.

## Phase 5 — Status honesty

Ship a parity table: upstream version, supported surface, known divergences
(intentional vs gap), SSR/hydration status, evidence date. Overclaiming
parity is worse than a small documented surface — consumers build on what
you state.

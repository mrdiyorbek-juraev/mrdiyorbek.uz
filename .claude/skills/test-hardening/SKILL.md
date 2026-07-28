---
name: test-hardening
description: Audit and strengthen a test suite — find tests pinned to internals, tautological assertions, missing lifecycle edges, uncredible regression tests, and flake sources; then add behavioral tests whose failure is proven by deliberately breaking the implementation. Use when asked to "improve tests", "is this well tested", after a bug escaped the suite, or before trusting a suite to guard a refactor.
---

A suite's value is the set of realistic bugs it would catch. Harden by
removing false confidence (tests that pass against broken code) and false
fragility (tests that fail against correct refactors) — both are defects.

## Phase 1 — Boundary audit (false fragility)

Find assertions that reach past the observation boundary: private helper
names, internal call order, exact internal counts, slot/marker spelling,
generated-code formatting. Each one makes a behavior-preserving refactor
fail the suite. Rewrite to assert the consumer-observable contract, or move
genuine optimization claims (counts, bytes, identity) into benchmarks with
controls.

## Phase 2 — Oracle audit (false confidence)

- Tautologies: captured values never asserted, `expect(setup).toBeDefined()`
  as the only oracle, tests that merely complete. A test needs an oracle
  that detects the user-visible regression.
- Credibility: for each regression test, ask "what realistic broken
  implementation fails this?" If none, it guards nothing.
- Over-mocking: a mock of the thing under test proves the mock. Prefer real
  collaborators at the boundary; mock only true externals.

## Phase 3 — Coverage by contract, not by line

Enumerate the public contracts (from docs, types, jsdoc) and map each to a
test. Prioritize the gaps that bite in production:
- Lifecycle edges: first use, repeated use, teardown, use-after-teardown,
  reclamation, re-initialization (hot reload).
- Identity/stability promises ("stable across X", "survives Y") — assert
  them across the boundary they claim to survive.
- Cross-API consistency: when two surfaces promise the same answer (shared
  ids, mirrored state), a test must correlate them.
- Error isolation: a throwing consumer callback must not break the host —
  test it.
- Mode matrix: behavior shipped in multiple build modes (dev/prod/
  instrumented) is tested in each mode it ships in.

## Phase 4 — Mutation proof

For every test you add or strengthen, break the implementation the way a
real bug would (invert the guard, skip the invalidation, leak the entry) and
confirm the test fails, then restore. A hardened suite ships with this
evidence stated. Where the project has mutation tooling, use it; manual
targeted mutation otherwise.

## Phase 5 — Flake hunt

Sources in rough order: real timing dependencies (awaiting paint/microtasks
correctly vs sleeping), order-dependent shared state between tests (module
singletons, global registries — reset or isolate), GC-dependent assertions
(never assert collection timing), unseeded randomness and real clocks.
A flaky test is worse than no test: it trains people to ignore red.

## Deliverable

Findings per phase with file:line, the rewritten/added tests, and the
mutation evidence ("broke X → test failed; restored → green"). Keep fixture
changes minimal and realistic — strengthen existing scenarios before adding
one-off files.

---
name: api-contract
description: Design or review a public API contract-first — types, signatures, events, lifecycle rules, guarantees vs deliberately-unspecified behavior, capability detection, versioning, and misuse resistance. Use when adding/changing any public surface (exports, ABI helpers, events, config options, wire formats) or when asked to design an interface between layers/packages.
---

The contract comes before the implementation, and it is challenged before it
is accepted. An API is a promise you keep for years; design it so the
implementation can improve without the promise changing.

## Phase 1 — Consumers first

List the concrete consumers (today's and the named next one — not
hypothetical ones) and write the call-site code you want each to be able to
write. If you cannot write a realistic call site, the API is speculative —
stop and run the `challenge` gauntlet on the whole idea.

## Phase 2 — Draft the contract

- Types, signatures, events, and lifecycle rules (what may be called when;
  what happens on double-init, use-after-teardown, re-entrancy).
- Split explicitly: **guaranteed** (consumers may rely on it; tests pin it)
  vs **deliberately unspecified** (implementations may change it; document
  the freedom). Identity, ordering, and timing guarantees are the expensive
  ones — grant them only on purpose.
- Errors and edge answers are part of the contract: prefer degraded answers
  with documented meaning (empty result, null) over throws for "not
  available"; reserve throws for programmer error.
- Zero-cost-when-off: if the surface is optional instrumentation, the
  contract must be satisfiable by dead code (compile-time gate) and absent
  consumers must cost at most one check.
- Consumer isolation: callbacks the API accepts must be specified as unable
  to break the host (isolation is the host's job — say so).

## Phase 3 — Misuse resistance

Walk each signature as a hostile/careless caller: boolean traps, argument
orders that transpose silently, defaults that surprise, partial-init states,
APIs that work in dev but no-op in prod without saying so. Make the wrong
thing unrepresentable (types, capability flags) or loud (dev warning),
never silent.

## Phase 4 — Evolution

- Stability tier stated: experimental / stable / frozen ABI. Additive paths
  planned (options objects over positional growth, capability flags over
  version sniffing).
- Removal story: can this be deprecated and deleted cleanly, or does it leak
  into serialized formats and public ids (one-way door → stronger review)?

## Phase 5 — Challenge, then document

Run the `challenge` attack on your own draft (necessity, placement, cost,
simpler alternative) and record the strongest surviving objection. Ship the
contract as: the surface, the guarantees/unspecified split, lifecycle rules,
realistic call-site examples, and the rejected alternatives with reasons —
that rationale is what stops the next person from re-litigating or
"simplifying" it into a footgun.

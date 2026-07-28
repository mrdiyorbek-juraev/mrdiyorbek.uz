---
name: compat-audit
description: Compatibility audit across every axis that can break consumers — reference/upstream behavior parity, platform & runtime targets (browsers, Node, workers, non-DOM hosts), SSR/hydration equivalence, build-mode matrix (dev/prod/profile/instrumented), public API & semver impact, and migration paths. Use when porting behavior, touching public APIs, changing build gating, or when asked "is this compatible / will this break anyone".
---

Compatibility is a matrix, not a feeling. Enumerate the axes, test each cell
you can, and mark every divergence as either INTENTIONAL (with rationale and
documentation) or a GAP (with impact and fix). Undocumented divergence is the
only unacceptable state.

## Axis 1 — Reference parity

When the project mirrors a reference (React-shaped runtimes, ported
libraries): identify the reference's observable contract from its docs AND
tests, not from memory. Check the project's documented intentional
divergences before flagging anything — "fixing" a deliberate divergence
toward the reference is a compat bug, not a fix. Prefer differential
evidence: same fixture, same events, both implementations, compare output.

## Axis 2 — Platform & runtime targets

- Feature detection vs assumption: WeakRef/FinalizationRegistry, rAF,
  microtasks, performance.now, DOM globals — every use either has a guarded
  fallback or a documented minimum target. Non-DOM hosts (SSR, workers,
  universal renderers) must not evaluate forbidden globals at module load.
- Check module formats and entry points (exports map, types, ESM/CJS) match
  what consumers actually import.

## Axis 3 — SSR / hydration / isomorphism

Server output and client render must agree where the contract says they do:
markup equivalence, id stability across server/client, adoption of existing
DOM without recreation, no server evaluation of client-only code. Any API
added to the client surface needs a defined server behavior (no-op, throw,
or parity — chosen deliberately).

## Axis 4 — Build-mode matrix

Enumerate build variants (dev/prod, HMR on/off, instrumentation flags like
profile/devtools) and verify each cell: features gate correctly, optional
subsystems tree-shake to zero in modes that exclude them (no module-eval
side effects), and behavior asserted in one mode isn't silently absent in
another. Tests must exist in the modes where the behavior ships.

## Axis 5 — API & semver

Classify every public-surface change: additive (safe), behavioral (needs
changelog + migration note), breaking (needs major or explicit alpha-track
decision). Identity/ordering/timing guarantees consumers may have inferred
count as surface — check what published docs and types promise. Verify
changesets/changelogs describe the user-visible contract change.

## Axis 6 — Migration

For anything behavioral or breaking: who is affected, what is the mechanical
migration, can old and new coexist during transition, and is there a
detection story (warning, codemod, lint) rather than silent breakage?

## Deliverable

The matrix (axis × status × evidence), the divergence list split into
intentional-and-documented vs gaps-with-impact, and the minimal set of
changes to close unacceptable cells. For repo-scale audits, fan out one
subagent per axis and synthesize.

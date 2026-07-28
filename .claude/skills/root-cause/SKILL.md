---
name: root-cause
description: Bug triage and resolution procedure — reproduce minimally, isolate by bisection, distinguish root cause from symptom, fix at the owning layer with the smallest correct change, prove it with a pre-fix-failing test, then hunt the bug's siblings. Use when given a bug report, failing test, crash, regression, flake, or "why does X happen".
---

A bug isn't understood until you can predict it: state the mechanism that
makes it happen and what makes it stop, then prove both. Fixing the symptom
where it surfaced — instead of the cause where it lives — trades one bug for
a fleet of them.

## Phase 1 — Reproduce, then minimize

- Turn the report into a deterministic reproduction before reading much
  code; if it only reproduces sometimes, finding the determinism condition
  (timing, order, state) IS the investigation.
- Minimize aggressively: smallest fixture, fewest steps, no framework noise.
  Each removed element that keeps the bug alive is information; the element
  whose removal kills it points at the mechanism.
- Rule out environment first when cheap: does it reproduce on a clean
  checkout without the suspect diff? (Pre-existing failures get reported as
  such, with the evidence — not silently absorbed into your change.)

## Phase 2 — Isolate

Bisect along whatever axis converges fastest: git history (`git bisect`),
input space, code path (targeted logging/instrumentation at layer
boundaries), or build mode (dev vs prod vs instrumented — a mode-specific
bug localizes to the mode's diff). Form ONE hypothesis at a time and design
the observation that would falsify it; don't shotgun print statements.

## Phase 3 — Root cause vs symptom

Ask "why" until you reach a broken invariant, not a broken output: the
answer looks like "X assumes Y is always Z, but path P produces Y=W".
Verify the mechanism by predicting a second symptom it must also cause and
confirming it (a root cause explains ALL observed symptoms; a coincidence
explains one). Check the invariant's owner: the fix belongs in the layer
that promised the invariant, not in every caller that tripped over it.

## Phase 4 — The smallest correct fix

- Fix the invariant at its owner. Resist drive-by refactors — note them for
  a separate change.
- Check the fix against the non-negotiables: no new hot-path cost, no new
  unbounded state, degradation over throwing for "not available" cases.
- Consider the blast radius of the FIX: who else depends on the old broken
  behavior (bug-compatibility)? A silent behavior change for them needs the
  compat treatment (changelog, migration note).

## Phase 5 — Prove, then hunt siblings

- Add the regression test first-class: it fails on the pre-fix code (verify
  by reverting), passes after, and asserts the consumer-visible contract —
  not the internal detail you happened to change.
- Hunt siblings: the same broken assumption usually exists at the pattern's
  other instances — grep for the shape (same API misuse, same lifecycle gap,
  copies of the code) and audit each. A root cause with an unhunted pattern
  is half a fix.
- Report: mechanism, why it wasn't caught (test gap — close it), the fix,
  the sibling audit result.

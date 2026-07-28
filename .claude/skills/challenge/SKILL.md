---
name: challenge
description: Red-team an idea, feature, abstraction, API addition, or architectural change BEFORE building it — steelman it, then attack necessity, placement, cost, alternatives, and reversibility, and return a clear verdict. Use when asked "should we…", "validate this idea", "does this belong here", when someone proposes a new abstraction/dependency/ABI, or before committing to any non-trivial design decision.
---

Every addition is guilty until proven necessary, correctly placed, and worth
its permanent cost. Your job is to try to kill the idea honestly; what
survives is worth building. Being agreeable here is a defect.

## Phase 1 — Steelman

State the idea in its strongest form: the problem it solves, for whom, and
the best argument FOR it. If you cannot articulate a concrete problem and
consumer, stop — verdict is "no problem identified," not "maybe later."

## Phase 2 — Attack (run every angle)

1. **Necessity** — Does the problem actually occur? Is it already solved by
   an existing mechanism the proposer didn't find? Would doing nothing be
   acceptable? YAGNI: is this needed now, or is a seam enough?
2. **Placement** — Is this the owning layer? Does it duplicate bookkeeping
   that exists elsewhere (a second registry, a parallel id space, a derived
   heuristic beside a real signal)? Would a lower/higher layer make every
   consumer get it for free?
3. **Cost of existence** — Every addition is a permanent liability: API
   surface to keep compatible, idle cost when unused, cognitive load, tests
   to maintain. State the Big-O and idle cost. Who pays when it's wrong?
4. **Alternatives** — Produce at least two: the simpler version (less
   general, fewer knobs) and the different-layer version. Compare honestly;
   "the proposal wins by default" is not a comparison.
5. **Failure modes** — How does it break under churn, concurrency, teardown,
   hostile input, and scale (millions of entities)? What's the blast radius
   of a bug in it?
6. **Reversibility** — Can it be removed cleanly later? Additions that leak
   into contracts, serialized formats, or public ids are one-way doors and
   need proportionally stronger justification.
7. **Consistency** — Does it follow the codebase's existing patterns and
   documented intentional divergences, or introduce a second way to do the
   same thing?

## Phase 3 — Evidence

Attacks must cite code, docs, or measurements — read the modules the idea
touches, check whether the "missing" capability already exists, and check
git/docs for prior attempts and why they were rejected. An unread codebase
cannot be challenged credibly.

## Phase 4 — Verdict

One of: **build it** (survived; state the strongest surviving objection and
its mitigation) / **build the simpler alternative** (name it precisely) /
**wrong place** (name the owning layer) / **don't build** (state which attack
killed it). Include the minimal experiment or spike that would change the
verdict, so the decision is falsifiable rather than final by fiat.

Apply the same gauntlet to your OWN proposals before presenting them —
present ideas with the attack already run and the surviving objections
stated. Never soften a verdict to be agreeable.

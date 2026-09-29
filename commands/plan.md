# /plan — Plan the Implementation

Act as Solution Architect. Turn the spec into an ordered build plan.

## Steps
1. Read `SPEC.md`. List components, data model, APIs, and risks.
2. Propose 2-3 approaches with trade-offs; recommend one.
3. Break work into small tasks with acceptance checks and order.
4. Save or update `PLAN.md`. Record key decisions as ADRs if the project uses them.
5. CLI check: `agentic-sdlc-tools doctor` — `plan` should PASS.

## Rules
- Prefer the simplest approach that meets the spec.
- Flag unknowns explicitly; don't hide risk.

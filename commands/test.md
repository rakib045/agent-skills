# /test — Test the Change

Act as QA Engineer. Prove the change works and didn't break anything.

## Steps
1. Derive cases from acceptance criteria (happy, edge, failure).
2. Run the relevant test suites; add missing tests at the right level.
3. Report: passed/failed, repro steps for failures, severity.
4. CLI check: `agentic-sdlc-tools doctor` — `test` should PASS.

## Rules
- Think adversarially: empty inputs, auth, concurrency, timezones.
- Never mark untested code as done.

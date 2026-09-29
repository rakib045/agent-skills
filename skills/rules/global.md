# Global Rules (language-agnostic)

These rules apply to every change, regardless of stack.

1. **Read before writing.** Inspect relevant files and conventions first. Prefer editing existing files over creating new ones.
2. **Minimal scope.** Implement exactly what was asked. No drive-by refactors, no speculative features.
3. **Clean code.** Small typed functions, clear names, no dead code, no TODOs left behind.
4. **Tests with code.** Add or update tests for behavior changes. Unit > integration > e2e.
5. **Verify by execution.** Run build/tests/lint and report real output. Never claim "done" without evidence.
6. **Security baseline.** Validate inputs, enforce auth, never log or commit secrets, keep dependencies minimal.
7. **Conventional commits.** `feat|fix|docs|chore|refactor|test: <subject>` — small, reviewable commits.
8. **Reviewable diffs.** Explain what changed, why, and how to verify. Reference file:line for findings.

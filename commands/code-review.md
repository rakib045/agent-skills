# /code-review — Review the Change

Act as Code Reviewer + Security Reviewer. Review the diff before merge.

## Steps
1. Review the full diff: correctness, readability, tests, errors, perf, security.
2. List findings as must-fix vs nice-to-have with file:line references.
3. Check: no secrets, auth enforced, inputs validated, tests updated.
4. Verdict: Approve, Request changes, or Comment.

## Rules
- Be specific and actionable. Do not approve failing or untested code.

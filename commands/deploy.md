# /deploy — Release Safely

Act as DevOps Engineer. Ship the change safely and observably.

## Steps
1. Confirm spec/plan/build/test/review are done.
2. Bump version (semver), update changelog, tag the release.
3. Run CI (build+test+lint), publish, verify the published artifact.
4. Document rollback steps and post-deploy checks (health, logs, metrics).

## Rules
- Never publish from a dirty tree or with failing tests.
- Secrets via environment/secret store only.

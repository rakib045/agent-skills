# @rakib045/agentic-sdlc-tools

Agentic AI SDLC kit — agents, skills, rules and slash commands with multi-tool support.

- **Agents (SDLC):** product-owner, solution-architect, senior-developer, qa-engineer, devops-engineer, security-reviewer, code-reviewer
- **Commands:** `/spec` `/plan` `/build` `/test` `/code-review` `/deploy` (prompt template + CLI validation via `doctor`)
- **Rules:** global language-agnostic standards
- **Skills:** adr-writing, conventional-commits, review-checklist
- **Tools:** Claude Code, OpenCode, OpenAI Codex, Gemini CLI, GitHub Copilot, Cursor — from a single source (`agents/`, `commands/`, `rules/`, `skills/` at the repo root) adapted per tool

Requires Node.js >= 20 in the target project environment.

## Install

The package is scoped, so `npx` needs the full package name (the bare
`npx agentic-sdlc-tools` will not resolve — see [Why the full name](#why-the-full-package-name-in-npx)):

```sh
# full install (all tools)
npx @rakib045/agentic-sdlc-tools init

# only some tools, non-interactive
npx @rakib045/agentic-sdlc-tools init --tools claude,opencode --yes

# minimal preset (architect + senior dev, spec/plan/build, global rule)
npx @rakib045/agentic-sdlc-tools init --preset minimal --yes

# preview without writing
npx @rakib045/agentic-sdlc-tools init --dry-run
```

Valid `--tools` values: `claude,opencode,codex,gemini,github,cursor` (default: all).

## Granular install

```sh
npx @rakib045/agentic-sdlc-tools list
npx @rakib045/agentic-sdlc-tools list --tools

npx @rakib045/agentic-sdlc-tools add agent:senior-developer --tools claude,github
npx @rakib045/agentic-sdlc-tools add command:spec --tools opencode
npx @rakib045/agentic-sdlc-tools add skill:adr-writing --tools claude,opencode,codex,gemini,github,cursor
npx @rakib045/agentic-sdlc-tools add rule:global --tools cursor
```

Spec format is `<type>:<name>` where type is `agent|command|skill|rule`. Run `list` to see every available name.

## Update / validate

```sh
npx @rakib045/agentic-sdlc-tools update --check   # report what would change
npx @rakib045/agentic-sdlc-tools update --diff    # same, per-file status
npx @rakib045/agentic-sdlc-tools update --force   # apply updates
npx @rakib045/agentic-sdlc-tools doctor           # validate spec/plan/test artifacts + kit installation
```

**Safety:** the installer never overwrites a differing file without `--force`. With `--force` it backs up the original to `*.bak` first. Re-running `init` is idempotent — identical files are skipped.

## Where files go

| Tool | Agents | Commands | Skills | Rules |
|---|---|---|---|---|
| Claude | `.claude/agents/` | `.claude/commands/` | `.claude/skills/` | `CLAUDE.md` |
| OpenCode | `.opencode/agents/` | `.opencode/commands/` | `.opencode/skills/` | `AGENTS.md` |
| Codex | `.codex/agents/` | `.codex/commands/` | `.codex/skills/` | `AGENTS.md` |
| Gemini | `.gemini/agents/` | `.gemini/commands/` | `.gemini/skills/` | `GEMINI.md` |
| GitHub | `.github/agents/` | `.github/prompts/` (`*.prompt.md`) | `.github/skills/` | `.github/copilot-instructions.md` |
| Cursor | `.cursor/agents/` | `.cursor/commands/` | `.cursor/skills/` | `.cursor/rules/global.md` (with `alwaysApply` frontmatter) |

## SDLC flow

```
/spec -> /plan -> /build -> /test -> /code-review -> /deploy
```

Each command file is a prompt template for the AI; `doctor` is the executable check (spec/plan/test artifacts + kit installation).

## Repo layout (contributing)

```
agents/ commands/ rules/ skills/   # single source of truth (edit these)
src/                               # TypeScript CLI (commander) + per-tool adapters
scripts/copy-templates.mjs         # copies root categories -> dist/templates on build
tests/                             # vitest
dist/                              # build output (gitignored, published to npm)
```

```sh
npm install
npm run lint
npm test
npm run build
```

## Publishing (maintainers)

One-time setup: create the npm org `@rakib045`, enable 2FA, `npm login`, then publish once manually so the package exists:

```sh
npm run build
npm publish --access public
```

After that, attach the GitHub trusted publisher (npm package Settings → Trusted Publisher → `rakib045/agentic-sdlc-tools`, workflow `publish.yml`). From then on every GitHub Release auto-publishes via `.github/workflows/publish.yml` (`npm publish --provenance` with OIDC, no tokens). Bump with `npm version patch|minor|major`, push tags, draft a release from the tag.

Notes:

- Local publishes must not request provenance (attestation only works on CI) — `publishConfig` intentionally omits it; CI passes `--provenance` explicitly.
- `404` on first `npm publish` means the `@rakib045` org doesn't exist yet — create it at `npmjs.com/org/create` and retry.

## Why the full package name in npx?

`npx <name>` resolves a *package* name, and the binary (`agentic-sdlc-tools`) only becomes available after that package is fetched. Since the package is the scoped `@rakib045/agentic-sdlc-tools`, the correct invocation is `npx @rakib045/agentic-sdlc-tools <command>`. (After a global `npm i -g @rakib045/agentic-sdlc-tools`, the bare `agentic-sdlc-tools` binary works directly.)

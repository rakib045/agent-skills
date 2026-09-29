# @rakib045/agentic-sdlc-tools

Agentic AI SDLC kit — agents, skills, rules and slash commands with multi-tool support.

- **Agents (SDLC):** product-owner, solution-architect, senior-developer, qa-engineer, devops-engineer, security-reviewer, code-reviewer
- **Commands:** `/spec` `/plan` `/build` `/test` `/code-review` `/deploy` (prompt template + CLI validation via `doctor`)
- **Rules:** global language-agnostic standards
- **Skills:** adr-writing, conventional-commits, review-checklist
- **Tools (v1):** Claude Code, OpenCode, OpenAI Codex, Gemini CLI, GitHub Copilot, Cursor — from a single source (`agents/`, `commands/`, `rules/`, `skills/` at the repo root) adapted per tool

## Install

```sh
# full install (all tools)
npx agentic-sdlc-tools init

# only some tools, non-interactive
npx agentic-sdlc-tools init --tools claude,opencode --yes

# minimal preset
npx agentic-sdlc-tools init --preset minimal --yes

# preview without writing
npx agentic-sdlc-tools init --dry-run
```

## Granular install

```sh
npx agentic-sdlc-tools list
npx agentic-sdlc-tools list --tools

npx agentic-sdlc-tools add agent:senior-developer --tools claude,github
npx agentic-sdlc-tools add command:spec --tools opencode
npx agentic-sdlc-tools add skill:adr-writing --tools claude,opencode,codex,gemini,github,cursor
npx agentic-sdlc-tools add rule:global --tools claude
```

Spec format is `<type>:<name>` where type is `agent|command|skill|rule`.

## Update / validate

```sh
npx agentic-sdlc-tools update --check
npx agentic-sdlc-tools update --diff
npx agentic-sdlc-tools update --force
npx agentic-sdlc-tools doctor
```

**Safety:** installer never overwrites a differing file without `--force`. With `--force` it backs up the original to `*.bak`.

## Where files go

| Tool | Agents | Commands | Skills | Rules |
|---|---|---|---|---|
| Claude | `.claude/agents/` | `.claude/commands/` | `.claude/skills/` | `CLAUDE.md` |
| OpenCode | `.opencode/agents/` | `.opencode/commands/` | `.opencode/skills/` | `AGENTS.md` |
| Codex | `.codex/agents/` | `.codex/commands/` | `.codex/skills/` | `AGENTS.md` |
| Gemini | `.gemini/agents/` | `.gemini/commands/` | `.gemini/skills/` | `GEMINI.md` |
| GitHub | `.github/agents/` | `.github/prompts/` | `.github/skills/` | `.github/copilot-instructions.md` |
| Cursor | `.cursor/agents/` | `.cursor/commands/` | `.cursor/skills/` | `.cursor/rules/global.md` (with `alwaysApply` frontmatter) |

## SDLC flow

```
/spec -> /plan -> /build -> /test -> /code-review -> /deploy
```

Each command file is a prompt template for the AI; `doctor` is the executable check (spec/plan/test artifacts + kit installation).

## Publishing (maintainers)

Tag a release on GitHub — `.github/workflows/publish.yml` runs `npm run build` and `npm publish --provenance` with OIDC. First time: create npm org `@rakib045`, enable 2FA, add npm trusted publisher for this repo.

```sh
npm run build
npm run lint
npm test
```

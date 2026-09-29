import { plainAdapter } from "./base.js";

export const codexAdapter = plainAdapter({
  id: "codex",
  label: "OpenAI Codex",
  agentsDir: ".codex/agents",
  commandsDir: ".codex/commands",
  skillsDir: ".codex/skills",
  rulesFile: "AGENTS.md",
});

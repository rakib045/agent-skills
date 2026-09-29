import { plainAdapter } from "./base.js";

export const opencodeAdapter = plainAdapter({
  id: "opencode",
  label: "OpenCode",
  agentsDir: ".opencode/agents",
  commandsDir: ".opencode/commands",
  skillsDir: ".opencode/skills",
  rulesFile: "AGENTS.md",
});

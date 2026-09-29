import { plainAdapter } from "./base.js";

export const claudeAdapter = plainAdapter({
  id: "claude",
  label: "Claude Code",
  agentsDir: ".claude/agents",
  commandsDir: ".claude/commands",
  skillsDir: ".claude/skills",
  rulesFile: "CLAUDE.md",
});

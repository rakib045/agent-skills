import { plainAdapter } from "./base.js";

export const geminiAdapter = plainAdapter({
  id: "gemini",
  label: "Gemini CLI",
  agentsDir: ".gemini/agents",
  commandsDir: ".gemini/commands",
  skillsDir: ".gemini/skills",
  rulesFile: "GEMINI.md",
});

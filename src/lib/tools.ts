export type ToolId = "claude" | "opencode" | "codex" | "gemini" | "github";

export interface ToolTarget {
  id: ToolId;
  label: string;
  agentsDir: string;
  commandsDir: string;
  skillsDir: string;
  rulesFile: string;
}

export const TOOLS: Record<ToolId, ToolTarget> = {
  claude: {
    id: "claude",
    label: "Claude Code",
    agentsDir: ".claude/agents",
    commandsDir: ".claude/commands",
    skillsDir: ".claude/skills",
    rulesFile: "CLAUDE.md",
  },
  opencode: {
    id: "opencode",
    label: "OpenCode",
    agentsDir: ".opencode/agents",
    commandsDir: ".opencode/commands",
    skillsDir: ".opencode/skills",
    rulesFile: "AGENTS.md",
  },
  codex: {
    id: "codex",
    label: "OpenAI Codex",
    agentsDir: ".codex/agents",
    commandsDir: ".codex/commands",
    skillsDir: ".codex/skills",
    rulesFile: "AGENTS.md",
  },
  gemini: {
    id: "gemini",
    label: "Gemini CLI",
    agentsDir: ".gemini/agents",
    commandsDir: ".gemini/commands",
    skillsDir: ".gemini/skills",
    rulesFile: "GEMINI.md",
  },
  github: {
    id: "github",
    label: "GitHub Copilot",
    agentsDir: ".github/agents",
    commandsDir: ".github/prompts",
    skillsDir: ".github/skills",
    rulesFile: ".github/copilot-instructions.md",
  },
};

export const ALL_TOOL_IDS = Object.keys(TOOLS) as ToolId[];

export function parseTools(input?: string): ToolId[] {
  if (!input) return ALL_TOOL_IDS;
  const ids = input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as ToolId[];
  const bad = ids.filter((id) => !TOOLS[id]);
  if (bad.length > 0) throw new Error(`Unknown tools: ${bad.join(", ")}. Valid: ${ALL_TOOL_IDS.join(", ")}`);
  return [...new Set(ids)];
}

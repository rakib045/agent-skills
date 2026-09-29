import type { Category } from "../lib/manifest.js";
import { buildFrontmatter, titleCase } from "../lib/frontmatter.js";
import type { ToolAdapter } from "./types.js";

/**
 * GitHub Copilot adapter. Slash commands become `*.prompt.md` prompt files
 * (Copilot only registers the `.prompt.md` extension) with `mode: agent`
 * frontmatter; agents/skills/rules use plain markdown.
 */
export const githubAdapter: ToolAdapter = {
  id: "github",
  label: "GitHub Copilot",

  target(category: Category, name: string): string {
    switch (category) {
      case "agents":
        return `.github/agents/${name}.md`;
      case "commands":
        return `.github/prompts/${name}.prompt.md`;
      case "skills":
        return `.github/skills/${name}.md`;
      case "rules":
        return ".github/copilot-instructions.md";
    }
  },

  frontmatter(category: Category, name: string): string | null {
    if (category === "commands") {
      return buildFrontmatter({ description: titleCase(name), mode: "agent" });
    }
    return null;
  },

  doctorPaths: () => [".github/copilot-instructions.md"],

  describe: () =>
    "github: agents=.github/agents commands=.github/prompts (*.prompt.md) skills=.github/skills rules=.github/copilot-instructions.md",
};

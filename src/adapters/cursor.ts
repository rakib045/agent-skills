import type { Category } from "../lib/manifest.js";
import { buildFrontmatter, titleCase } from "../lib/frontmatter.js";
import type { ToolAdapter } from "./types.js";

/**
 * Cursor adapter. Rules live under `.cursor/rules/` and REQUIRE frontmatter
 * to be honored — the global rule ships with `alwaysApply: true`.
 */
export const cursorAdapter: ToolAdapter = {
  id: "cursor",
  label: "Cursor",

  target(category: Category, name: string): string {
    switch (category) {
      case "agents":
        return `.cursor/agents/${name}.md`;
      case "commands":
        return `.cursor/commands/${name}.md`;
      case "skills":
        return `.cursor/skills/${name}.md`;
      case "rules":
        return `.cursor/rules/${name}.md`;
    }
  },

  frontmatter(category: Category, name: string): string | null {
    if (category === "rules") {
      return buildFrontmatter({
        description: name === "global" ? "Global SDLC rules (always apply)" : titleCase(name),
        alwaysApply: name === "global",
      });
    }
    return null;
  },

  doctorPaths: () => [".cursor/rules/global.md"],

  describe: () =>
    "cursor: agents=.cursor/agents commands=.cursor/commands skills=.cursor/skills rules=.cursor/rules (alwaysApply frontmatter)",
};

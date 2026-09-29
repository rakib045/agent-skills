import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type Category = "agents" | "commands" | "skills" | "rules";

export const CATEGORIES: Category[] = ["agents", "commands", "skills", "rules"];

/** Resolve templates dir both in dev (skills/) and published (dist/templates). */
export function templatesDir(): string {
  const here = dirname(fileURLToPath(import.meta.url)); // dist/ or src/lib
  const candidates = [
    join(here, "templates"), // dist/templates (published)
    join(here, "..", "templates"), // fallback
    join(process.cwd(), "skills"), // dev fallback (not used when installed)
  ];
  // When running from src via tsx/vitest, templates live at <root>/skills
  const rootSkills = join(here, "..", "..", "skills");
  candidates.push(rootSkills);
  for (const c of candidates) {
    if (existsSync(c) && existsSync(join(c, "agents"))) return c;
  }
  // default to dist/templates even if missing (error surfaces later)
  return join(here, "templates");
}

export function listItems(category: Category): string[] {
  const dir = join(templatesDir(), category);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

export function readItem(category: Category, name: string): string {
  const file = join(templatesDir(), category, `${name}.md`);
  if (!existsSync(file)) throw new Error(`Unknown ${category.slice(0, -1)}: "${name}". File not found: ${category}/${name}.md`);
  return readFileSync(file, "utf8");
}

export function manifest(): Record<Category, string[]> {
  return {
    agents: listItems("agents"),
    commands: listItems("commands"),
    skills: listItems("skills"),
    rules: listItems("rules"),
  };
}

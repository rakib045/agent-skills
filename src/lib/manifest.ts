import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type Category = "agents" | "commands" | "skills" | "rules";

export const CATEGORIES: Category[] = ["agents", "commands", "skills", "rules"];

/** Walk up to the package root (dir containing package.json). */
function packageRoot(from: string): string | null {
  let dir = from;
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

/** Resolve templates dir: published (dist/templates) or dev (root-level category folders). */
export function templatesDir(): string {
  const here = dirname(fileURLToPath(import.meta.url)); // dist/ or src/lib
  // Published layout first: categories under dist/templates.
  for (const c of [join(here, "templates"), join(here, "..", "templates")]) {
    if (existsSync(join(c, "agents"))) return c;
  }
  // Dev layout: agents/, commands/, rules/, skills/ at the package root.
  const root = packageRoot(here) ?? process.cwd();
  if (existsSync(join(root, "agents"))) return root;
  // Legacy fallback: categories under skills/.
  const legacy = join(root, "skills");
  if (existsSync(join(legacy, "agents"))) return legacy;
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

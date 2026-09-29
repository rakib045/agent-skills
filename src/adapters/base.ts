import type { Category } from "../lib/manifest.js";
import type { ToolAdapter } from "./types.js";

/** Shared base for tools that take plain `<dir>/<name>.md` plus one rules file. */
export function plainAdapter(opts: {
  id: string;
  label: string;
  agentsDir: string;
  commandsDir: string;
  skillsDir: string;
  rulesFile: string;
}): ToolAdapter {
  const dirs: Record<Exclude<Category, "rules">, string> = {
    agents: opts.agentsDir,
    commands: opts.commandsDir,
    skills: opts.skillsDir,
  };
  return {
    id: opts.id,
    label: opts.label,
    target: (category, name) => (category === "rules" ? opts.rulesFile : `${dirs[category]}/${name}.md`),
    frontmatter: () => null,
    doctorPaths: () => [opts.rulesFile],
    describe: () =>
      `${opts.id}: agents=${opts.agentsDir} commands=${opts.commandsDir} skills=${opts.skillsDir} rules=${opts.rulesFile}`,
  };
}

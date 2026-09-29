import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TOOL_IDS, getAdapter, parseTools, type ToolId } from "./adapters/index.js";
import { copySafe, rulesHeader, targetPath } from "./lib/files.js";
import { applyEnvelope } from "./lib/frontmatter.js";
import { listItems, manifest, readItem, type Category } from "./lib/manifest.js";

const program = new Command();
program
  .name("agentic-sdlc-tools")
  .description("Agentic SDLC kit — install agents, commands, skills and rules into any project")
  .version("0.1.0");

async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const ans = await rl.question(`${question} [y/N] `);
    return /^y(es)?$/i.test(ans.trim());
  } finally {
    rl.close();
  }
}

interface GlobalOpts {
  tools?: string;
  force?: boolean;
  dryRun?: boolean;
  yes?: boolean;
}

function resolveTools(opts: GlobalOpts): ToolId[] {
  return parseTools(opts.tools);
}

function installCategory(
  cwd: string,
  category: Category,
  names: string[],
  tools: ToolId[],
  opts: GlobalOpts,
): { created: number; skipped: number; conflicts: string[] } {
  let created = 0;
  let skipped = 0;
  const conflicts: string[] = [];
  for (const tool of tools) {
    const adapter = getAdapter(tool);
    for (const name of names) {
      const raw = readItem(category, name);
      const dest = targetPath(cwd, adapter.target(category, name));
      // Presentation (paths, frontmatter) is the adapter's job; content stays tool-agnostic.
      const content = applyEnvelope(raw, { frontmatter: adapter.frontmatter(category, name), header: rulesHeader(dest) });
      const res = copySafe(content, dest, { force: opts.force, dryRun: opts.dryRun });
      if (res.status === "created" || res.status === "overwritten") created++;
      else if (res.status === "skipped-identical" || res.status === "dry-run") skipped++;
      else conflicts.push(`${tool}:${dest} (exists — re-run with --force to overwrite, backup kept)`);
    }
  }
  return { created, skipped, conflicts };
}

program
  .command("init")
  .description("Install the full kit (or a preset) into the current project")
  .option("--tools <list>", `Comma list: ${ALL_TOOL_IDS.join(",")} (default: all)`)
  .option("--preset <name>", "full|minimal (minimal = 2 agents + spec/plan/build + global rule)", "full")
  .option("--force", "Overwrite existing files (backs up to *.bak)")
  .option("--dry-run", "Show what would be installed without writing")
  .option("--yes", "Non-interactive (assume defaults)")
  .action(async (opts: GlobalOpts & { preset?: string }) => {
    const cwd = process.cwd();
    const tools = resolveTools(opts);
    const m = manifest();
    let agents = m.agents;
    let commands = m.commands;
    let skills = m.skills;
    let rules = m.rules;
    if (opts.preset === "minimal") {
      agents = agents.filter((a) => ["solution-architect", "senior-developer"].includes(a));
      commands = commands.filter((c) => ["spec", "plan", "build"].includes(c));
      skills = [];
      rules = rules.filter((r) => r === "global");
    }
    if (!opts.yes && !opts.dryRun) {
      console.log(`Will install to: ${tools.map((t) => getAdapter(t).label).join(", ")}`);
      console.log(`  agents: ${agents.join(", ") || "(none)"}`);
      console.log(`  commands: ${commands.join(", ") || "(none)"}`);
      console.log(`  skills: ${skills.join(", ") || "(none)"}`);
      console.log(`  rules: ${rules.join(", ") || "(none)"}`);
      const ok = await confirm("Continue?");
      if (!ok) {
        console.log("Aborted.");
        return;
      }
    }
    const summary: string[] = [];
    for (const [cat, names] of [["agents", agents], ["commands", commands], ["skills", skills], ["rules", rules]] as [Category, string[]][]) {
      if (names.length === 0) continue;
      const r = installCategory(cwd, cat, names, tools, opts);
      summary.push(`${cat}: +${r.created} created, ${r.skipped} skipped${opts.dryRun ? " (dry-run)" : ""}`);
      for (const c of r.conflicts) console.warn(`  CONFLICT ${c}`);
    }
    console.log(summary.join("\n") || "Nothing to install.");
  });

program
  .command("add <spec>")
  .description('Granular install, e.g. "agent:senior-developer", "command:spec", "skill:adr-writing", "rule:global"')
  .option("--tools <list>", `Comma list: ${ALL_TOOL_IDS.join(",")} (default: all)`)
  .option("--force", "Overwrite existing files (backs up to *.bak)")
  .option("--dry-run", "Show what would be installed without writing")
  .action(async (spec: string, opts: GlobalOpts) => {
    const cwd = process.cwd();
    const tools = resolveTools(opts);
    const match = spec.match(/^(agent|command|skill|rule):([\w-]+)$/);
    if (!match) throw new Error(`Bad spec "${spec}". Use <type>:<name>, e.g. agent:senior-developer`);
    const singular = match[1];
    const name = match[2];
    const category = `${singular}s` as Category;
    // validate exists
    readItem(category, name);
    const r = installCategory(cwd, category, [name], tools, opts);
    console.log(`${category}/${name} -> tools [${tools.join(", ")}]: +${r.created} created, ${r.skipped} skipped${opts.dryRun ? " (dry-run)" : ""}`);
    for (const c of r.conflicts) console.warn(`  CONFLICT ${c}`);
  });

program
  .command("list")
  .description("List available agents, commands, skills, rules")
  .option("--tools", "Also show tool target paths")
  .action((opts: { tools?: boolean }) => {
    const m = manifest();
    for (const cat of ["agents", "commands", "skills", "rules"] as const) {
      console.log(`\n## ${cat}`);
      for (const item of m[cat]) console.log(`  ${cat.slice(0, -1)}:${item}`);
    }
    if (opts.tools) {
      console.log("\n## tools");
      for (const id of ALL_TOOL_IDS) {
        console.log(`  ${getAdapter(id).describe()}`);
      }
    }
  });

program
  .command("doctor")
  .description("Validate SDLC artifacts in the current project (spec/plan/build/test/review/deploy readiness)")
  .action(() => {
    const cwd = process.cwd();
    const checks: [string, string[]][] = [
      ["spec", ["SPEC.md", "spec.md", "docs/spec.md"]],
      ["plan", ["PLAN.md", "plan.md", "docs/plan.md"]],
      ["test", ["package.json", "pyproject.toml", "go.mod"]],
    ];
    let ok = 0;
    for (const [name, candidates] of checks) {
      const found = candidates.find((c) => {
        try {
          readFileSync(join(cwd, c));
          return true;
        } catch {
          return false;
        }
      });
      console.log(`${found ? "PASS" : "WARN"} ${name}: ${found ?? `missing (${candidates.join(" | ")})`}`);
      if (found) ok++;
    }
    // check at least one tool installed (per-adapter install markers)
    const installed = ALL_TOOL_IDS.filter((id) =>
      getAdapter(id)
        .doctorPaths()
        .some((rel) => {
          try {
            readFileSync(join(cwd, rel));
            return true;
          } catch {
            return false;
          }
        }),
    );
    console.log(`${installed.length > 0 ? "PASS" : "WARN"} kit: ${installed.length > 0 ? `installed for [${installed.join(", ")}]` : "no rules file found — run init"}`);
    console.log(`\n${ok}/${checks.length} artifact checks passed.`);
  });

program
  .command("update")
  .description("Update an installed project to the latest kit version")
  .option("--tools <list>", `Comma list: ${ALL_TOOL_IDS.join(",")} (default: all)`)
  .option("--check", "Only report what would change")
  .option("--diff", "Show per-file status without writing")
  .option("--force", "Apply updates (backs up to *.bak)")
  .action(async (opts: GlobalOpts & { check?: boolean; diff?: boolean }) => {
    const cwd = process.cwd();
    const tools = resolveTools(opts);
    const m = manifest();
    const dry = opts.check || opts.diff || !opts.force;
    if (dry && !opts.check && !opts.diff) {
      console.log("Dry run (no --force): showing what would change. Re-run with --force to apply.");
    }
    for (const cat of ["agents", "commands", "skills", "rules"] as const) {
      const r = installCategory(cwd, cat, m[cat as Category], tools, { ...opts, dryRun: dry });
      console.log(`${cat}: +${r.created} would-write, ${r.skipped} up-to-date`);
      for (const c of r.conflicts) console.warn(`  DIFF ${c}`);
    }
  });

program.parseAsync(process.argv);

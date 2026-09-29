import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { applyEnvelope } from "./frontmatter.js";

export interface CopyResult {
  dest: string;
  status: "created" | "skipped-identical" | "overwritten" | "backed-up" | "dry-run";
  backup?: string;
}

function ensureDir(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
}

/** Safe copy: never overwrites differing content without force; backs up before overwrite. */
export function copySafe(
  content: string,
  destAbs: string,
  opts: { force?: boolean; dryRun?: boolean } = {},
): CopyResult {
  if (opts.dryRun) return { dest: destAbs, status: "dry-run" };
  ensureDir(destAbs);
  if (!existsSync(destAbs)) {
    writeFileSync(destAbs, content, "utf8");
    return { dest: destAbs, status: "created" };
  }
  const existing = readFileSync(destAbs, "utf8");
  if (existing === content) return { dest: destAbs, status: "skipped-identical" };
  if (!opts.force) {
    const backup = `${destAbs}.bak`;
    // do not overwrite; leave existing in place but record would-be backup path
    return { dest: destAbs, status: "backed-up", backup };
  }
  const backup = `${destAbs}.bak`;
  writeFileSync(backup, existing, "utf8");
  writeFileSync(destAbs, content, "utf8");
  return { dest: destAbs, status: "overwritten", backup };
}

export function rulesHeader(tool: string): string {
  return `<!-- Installed by @rakib045/agentic-sdlc-tools for ${tool}. Safe to edit; re-run with --force to update. -->\n\n`;
}

export function mergeRulesFile(
  rulesContent: string,
  destAbs: string,
  opts: { force?: boolean; dryRun?: boolean; frontmatter?: string } = {},
): CopyResult {
  const full = applyEnvelope(rulesContent, { frontmatter: opts.frontmatter, header: rulesHeader(destAbs) });
  return copySafe(full, destAbs, opts);
}

export function targetPath(cwd: string, rel: string): string {
  return join(cwd, rel);
}

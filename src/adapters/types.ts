import type { Category } from "../lib/manifest.js";

/**
 * Strategy for one target tool. Content stays tool-agnostic in
 * agents/ commands/ rules/ skills/; every tool-specific concern
 * (paths, extensions, frontmatter) lives here.
 */
export interface ToolAdapter {
  readonly id: string;
  readonly label: string;
  /** Destination path relative to the target project root. */
  target(category: Category, name: string): string;
  /** YAML frontmatter block (without which tools like Cursor ignore the file), or null. */
  frontmatter(category: Category, name: string): string | null;
  /** Paths whose existence counts as "kit installed" for `doctor`. */
  doctorPaths(): string[];
  /** One-line summary for `list --tools`. */
  describe(): string;
}

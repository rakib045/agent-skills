/** Minimal YAML frontmatter helpers. No dependencies; covers the flat key-value blocks we emit. */

export function buildFrontmatter(fields: Record<string, string | boolean>): string {
  const lines = Object.entries(fields).map(([key, value]) => {
    if (typeof value === "boolean") return `${key}: ${value ? "true" : "false"}`;
    const needsQuotes = /[:#\n]/.test(value);
    return `${key}: ${needsQuotes ? JSON.stringify(value) : value}`;
  });
  return `---\n${lines.join("\n")}\n---`;
}

export function hasFrontmatter(content: string): boolean {
  return content.startsWith("---\n");
}

/** Prepend a frontmatter block unless the content already has one. */
export function ensureFrontmatter(content: string, fields: Record<string, string | boolean>): string {
  if (hasFrontmatter(content)) return content;
  return `${buildFrontmatter(fields)}\n\n${content}`;
}

/** "code-review" -> "Code Review" for generated descriptions. */
export function titleCase(name: string): string {
  return name
    .split(/[-_]/g)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Build the final file envelope. Frontmatter must stay at line 1 for tools
 * like Cursor that parse it; the installer header follows, then content.
 */
export function applyEnvelope(content: string, opts: { frontmatter?: string | null; header?: string } = {}): string {
  const body = content.trim();
  const head = opts.header ?? "";
  const full = opts.frontmatter ? `${opts.frontmatter.trim()}\n\n${head}${body}\n` : `${head}${body}\n`;
  return full;
}

import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copySafe, mergeRulesFile } from "../src/lib/files.js";
import { ALL_TOOL_IDS, getAdapter, parseTools } from "../src/adapters/index.js";
import { applyEnvelope, buildFrontmatter } from "../src/lib/frontmatter.js";
import { listItems } from "../src/lib/manifest.js";

describe("tools", () => {
  it("parses all by default", () => {
    expect(parseTools(undefined)).toEqual(["claude", "opencode", "codex", "gemini", "github", "cursor"]);
  });
  it("parses cursor", () => {
    expect(parseTools("cursor")).toEqual(["cursor"]);
  });
  it("rejects unknown tools", () => {
    expect(() => parseTools("nope")).toThrow();
  });
});

describe("copySafe", () => {
  it("creates, skips identical, conflicts without force, overwrites with backup on force", () => {
    const dir = mkdtempSync(join(tmpdir(), "ast-"));
    const dest = join(dir, "x.md");
    expect(copySafe("a", dest).status).toBe("created");
    expect(copySafe("a", dest).status).toBe("skipped-identical");
    expect(copySafe("b", dest).status).toBe("backed-up");
    expect(readFileSync(dest, "utf8")).toBe("a"); // untouched without force
    const res = copySafe("b", dest, { force: true });
    expect(res.status).toBe("overwritten");
    expect(readFileSync(dest, "utf8")).toBe("b");
    expect(readFileSync(`${dest}.bak`, "utf8")).toBe("a");
  });
});

describe("manifest", () => {
  it("discovers all categories", () => {
    expect(listItems("agents")).toContain("senior-developer");
    expect(listItems("commands")).toContain("spec");
    expect(listItems("rules")).toContain("global");
    expect(listItems("skills")).toContain("adr-writing");
  });
});

describe("cursor rules", () => {
  it("puts frontmatter at line 1", () => {
    const dir = mkdtempSync(join(tmpdir(), "ast-cursor-"));
    const dest = join(dir, "global.md");
    const fm = buildFrontmatter({ description: "Global SDLC rules (always apply)", alwaysApply: true });
    const res = mergeRulesFile("# Global Rules", dest, { frontmatter: fm });
    expect(res.status).toBe("created");
    const content = readFileSync(dest, "utf8");
    expect(content.startsWith("---\n")).toBe(true);
    expect(content).toContain("alwaysApply: true");
  });
});

describe("adapters", () => {
  it("registers six tools with unique ids", () => {
    expect(ALL_TOOL_IDS).toEqual(["claude", "opencode", "codex", "gemini", "github", "cursor"]);
  });
  it("maps github commands to *.prompt.md with agent frontmatter", () => {
    const adapter = getAdapter("github");
    expect(adapter.target("commands", "spec")).toBe(".github/prompts/spec.prompt.md");
    const fm = adapter.frontmatter("commands", "spec");
    expect(fm).toContain("mode: agent");
    expect(adapter.target("rules", "global")).toBe(".github/copilot-instructions.md");
  });
  it("gives cursor global rule alwaysApply frontmatter", () => {
    const adapter = getAdapter("cursor");
    expect(adapter.target("rules", "global")).toBe(".cursor/rules/global.md");
    expect(adapter.frontmatter("rules", "global")).toContain("alwaysApply: true");
    expect(adapter.frontmatter("agents", "senior-developer")).toBeNull();
  });
  it("keeps envelope order: frontmatter, header, content", () => {
    const out = applyEnvelope("body", { frontmatter: "---\na: b\n---", header: "<!-- h -->\n\n" });
    expect(out.indexOf("---")).toBe(0);
    expect(out.indexOf("<!-- h -->")).toBeGreaterThan(0);
    expect(out.indexOf("body")).toBeGreaterThan(out.indexOf("<!-- h -->"));
  });
});

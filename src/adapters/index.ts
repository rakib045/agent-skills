import { claudeAdapter } from "./claude.js";
import { codexAdapter } from "./codex.js";
import { cursorAdapter } from "./cursor.js";
import { geminiAdapter } from "./gemini.js";
import { githubAdapter } from "./github.js";
import { opencodeAdapter } from "./opencode.js";
import type { ToolAdapter } from "./types.js";

/**
 * Adapter registry. Adding a tool = one new module + one line here.
 * Nothing else in the codebase lists tools.
 */
const ADAPTERS: ToolAdapter[] = [
  claudeAdapter,
  opencodeAdapter,
  codexAdapter,
  geminiAdapter,
  githubAdapter,
  cursorAdapter,
];

export type ToolId = string;

const byId = new Map(ADAPTERS.map((a) => [a.id, a]));

export const ALL_TOOL_IDS: string[] = ADAPTERS.map((a) => a.id);

export function getAdapter(id: string): ToolAdapter {
  const adapter = byId.get(id);
  if (!adapter) throw new Error(`Unknown tool: "${id}". Valid: ${ALL_TOOL_IDS.join(", ")}`);
  return adapter;
}

export function parseTools(input?: string): string[] {
  if (!input) return ALL_TOOL_IDS;
  const ids = input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const bad = ids.filter((id) => !byId.has(id));
  if (bad.length > 0) throw new Error(`Unknown tools: ${bad.join(", ")}. Valid: ${ALL_TOOL_IDS.join(", ")}`);
  return [...new Set(ids)];
}

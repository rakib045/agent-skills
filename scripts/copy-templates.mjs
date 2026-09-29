import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "skills");
const dest = join(root, "dist", "templates");

mkdirSync(dest, { recursive: true });
if (existsSync(src)) {
  for (const entry of readdirSync(src)) {
    cpSync(join(src, entry), join(dest, entry), { recursive: true });
  }
  // manifest for CLI discovery
  const manifest = { version: "1", categories: readdirSync(src) };
  copyFileSync(join(root, "package.json"), join(dest, "_package.json"));
  console.log(`templates copied: ${manifest.categories.join(", ")} -> dist/templates`);
} else {
  console.warn("no skills/ directory found, skipping template copy");
}

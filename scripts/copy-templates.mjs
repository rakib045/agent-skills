import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Single source: root-level category folders (agents/, commands/, rules/, skills/).
const categories = ["agents", "commands", "rules", "skills"];
const dest = join(root, "dist", "templates");

mkdirSync(dest, { recursive: true });
const copied = [];
for (const cat of categories) {
  const src = join(root, cat);
  if (existsSync(src)) {
    cpSync(src, join(dest, cat), { recursive: true });
    copied.push(cat);
  }
}
if (copied.length > 0) {
  copyFileSync(join(root, "package.json"), join(dest, "_package.json"));
  console.log(`templates copied: ${copied.join(", ")} -> dist/templates`);
} else {
  console.warn("no category folders found, skipping template copy");
}

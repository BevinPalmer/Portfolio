/**
 * Lists current files under public/photography and public/retouching.
 * Run: node scripts/list-public-photography-retouching.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function listDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log("(missing)", dir);
    return;
  }
  const names = fs
    .readdirSync(dir)
    .filter((n) => n !== ".gitkeep" && n !== ".DS_Store")
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const n of names) {
    console.log("  ", n);
  }
}

const photoRoot = path.join(ROOT, "public", "photography");
console.log("=== public/photography ===");
if (fs.existsSync(photoRoot)) {
  for (const sub of fs.readdirSync(photoRoot)) {
    const p = path.join(photoRoot, sub);
    if (!fs.statSync(p).isDirectory()) continue;
    console.log(`--- photography/${sub}/ ---`);
    listDir(p);
  }
}

console.log("\n=== public/retouching ===");
listDir(path.join(ROOT, "public", "retouching"));

import fs from "node:fs/promises";
import path from "node:path";
import { WorkGridClient, type WorkImage } from "@/components/WorkGridClient";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function titleFromFilename(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, "");
  const cleaned = base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length ? cleaned : "Untitled";
}

export async function WorkGrid() {
  const workDir = path.join(process.cwd(), "public", "work");
  const entries = await fs.readdir(workDir, { withFileTypes: true }).catch(
    () => [],
  );

  const images: WorkImage[] = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => ({
      src: `/work/${encodeURIComponent(name)}`,
      title: titleFromFilename(name),
    }));

  return <WorkGridClient images={images} />;
}


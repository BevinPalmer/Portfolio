import { Container } from "@/components/Container";
import { WorkGrid } from "@/components/WorkGrid";
import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function titleFromFilename(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, "");
  const cleaned = base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length ? cleaned : "Untitled";
}

export default async function Home() {
  const imagesDir = path.join(process.cwd(), "public", "images");
  const entries = await fs.readdir(imagesDir, { withFileTypes: true });
  const images = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => ({
      src: `/images/${encodeURIComponent(name)}`,
      title: titleFromFilename(name),
    }));

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl tracking-[0.04em] sm:text-4xl">
          Selected Work
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          A clean, minimal grid—built for fast browsing. Drop your images into{" "}
          <span className="font-mono">public/images</span> and they’ll appear here
          automatically.
        </p>
      </div>

      <WorkGrid images={images} />
    </Container>
  );
}

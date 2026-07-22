import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import probe from "probe-image-size";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".JPG",
  ".jpeg",
  ".JPEG",
  ".png",
  ".PNG",
  ".webp",
]);

export type ScannedPhoto = {
  slug: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

function extOk(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename));
}

async function probeDims(absPath: string): Promise<{ width: number; height: number } | null> {
  try {
    const stream = createReadStream(absPath);
    const res = await probe(stream);
    stream.destroy();
    if (!res?.width || !res?.height) return null;
    return { width: res.width, height: res.height };
  } catch {
    return null;
  }
}

function collectPhotographyRelPaths(dir: string, publicRoot: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === ".gitkeep" || e.name.startsWith(".")) continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...collectPhotographyRelPaths(abs, publicRoot));
    } else if (e.isFile() && extOk(e.name)) {
      const rel = path.relative(publicRoot, abs).replace(/\\/g, "/");
      out.push(rel);
    }
  }
  return out;
}

/** Public URL for a path relative to `public/` (e.g. photography/creative/foo.JPG). */
function publicUrlFromRel(rel: string): string {
  const segs = rel.split("/");
  const last = segs.length - 1;
  segs[last] = encodeURIComponent(segs[last]!);
  return `/${segs.join("/")}`;
}

function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  try {
    return decodeURIComponent(base).replace(/[_-]+/g, " ").trim() || "Photography";
  } catch {
    return base.replace(/[_-]+/g, " ").trim() || "Photography";
  }
}

function slugFromRel(rel: string): string {
  const base = path.basename(rel, path.extname(rel));
  const cleaned = base.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return cleaned.length ? cleaned : "image";
}

/**
 * Alphabetical list of public URLs for all images under `public/photography`
 * (recursive). Extensions: jpg/jpeg/png/webp (case variants).
 */
export function getPhotographyImages(): string[] {
  const publicRoot = path.join(process.cwd(), "public");
  const photoRoot = path.join(publicRoot, "photography");
  const rels = collectPhotographyRelPaths(photoRoot, publicRoot);
  return rels
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map(publicUrlFromRel);
}

/** First hero image under `public/hero`, or null. Sorted by filename for stable pick. */
export function getHeroImage(): string | null {
  const dir = path.join(process.cwd(), "public", "hero");
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f !== ".gitkeep")
    .filter((f) => {
      try {
        return fs.statSync(path.join(dir, f)).isFile();
      } catch {
        return false;
      }
    })
    .filter((f) => extOk(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  if (files.length === 0) return null;
  return publicUrlFromRel(path.join("hero", files[0]!).replace(/\\/g, "/"));
}

export async function getHeroImageMeta(): Promise<
  (ScannedPhoto & { filename: string }) | null
> {
  const dir = path.join(process.cwd(), "public", "hero");
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f !== ".gitkeep")
    .filter((f) => {
      try {
        return fs.statSync(path.join(dir, f)).isFile();
      } catch {
        return false;
      }
    })
    .filter((f) => extOk(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  if (files.length === 0) return null;
  const name = files[0]!;
  const abs = path.join(dir, name);
  const dims = await probeDims(abs);
  const rel = path.join("hero", name).replace(/\\/g, "/");
  return {
    src: publicUrlFromRel(rel),
    filename: name,
    slug: slugFromRel(rel),
    alt: titleFromFilename(name),
    width: dims?.width ?? 3,
    height: dims?.height ?? 2,
  };
}

export async function getPhotographyImagesMeta(): Promise<ScannedPhoto[]> {
  const publicRoot = path.join(process.cwd(), "public");
  const photoRoot = path.join(publicRoot, "photography");
  const rels = collectPhotographyRelPaths(photoRoot, publicRoot).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );
  const list: ScannedPhoto[] = [];
  for (const rel of rels) {
    const abs = path.join(publicRoot, rel);
    const dims = await probeDims(abs);
    const filename = path.basename(rel);
    list.push({
      src: publicUrlFromRel(rel),
      slug: slugFromRel(rel),
      alt: titleFromFilename(filename),
      width: dims?.width ?? 1200,
      height: dims?.height ?? 800,
    });
  }

  /** Featured opener: `miguel.jpg` first when present (homepage tile + gallery lead). */
  const miguelIdx = list.findIndex((p) => {
    const seg = p.src.split("/").pop() ?? "";
    try {
      return /^miguel\.jpe?g$/i.test(decodeURIComponent(seg));
    } catch {
      return /^miguel\.jpe?g$/i.test(seg);
    }
  });
  if (miguelIdx > 0) {
    const [m] = list.splice(miguelIdx, 1);
    list.unshift(m);
  }

  return list;
}

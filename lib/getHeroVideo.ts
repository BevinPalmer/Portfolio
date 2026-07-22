import fs from "fs";
import path from "path";

/** Prefer landscape hero, then portrait. Returns public URL or null. */
export function getHeroVideoSrc(): string | null {
  const dir = path.join(process.cwd(), "public", "video");
  const primary = path.join(dir, "hero.mp4");
  const portrait = path.join(dir, "hero-portrait.mp4");
  if (fs.existsSync(primary)) return "/video/hero.mp4";
  if (fs.existsSync(portrait)) return "/video/hero-portrait.mp4";
  return null;
}

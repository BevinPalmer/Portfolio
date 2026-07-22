import { photographyMeta } from "@/lib/content";
import { photographyManifest } from "@/lib/generated/photography";

export type PhotographyCategory = "fashion" | "creative" | "ecommerce";

type ManifestImage = {
  slug: string;
  src: string;
  title: string;
  alt: string;
  width?: number;
  height?: number;
};

export type PhotographyImage = {
  slug: string;
  src: string;
  title: string;
  alt: string;
  width?: number;
  height?: number;
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function getPhotography(
  category: PhotographyCategory,
): Promise<PhotographyImage[]> {
  const list = (photographyManifest[category] ?? []) as unknown as readonly ManifestImage[];
  return list.map((img) => {
    const meta = photographyMeta[img.slug] ?? {};
    const title = meta.title ?? img.title ?? titleFromSlug(img.slug);
    return {
      slug: img.slug,
      src: img.src,
      title,
      alt: img.alt ?? title,
      width: img.width,
      height: img.height,
    };
  });
}

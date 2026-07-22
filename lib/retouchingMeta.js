/**
 * Curated titles and descriptions for retouching pairs (key = pair id / image base name, kebab-case).
 * Used by getImagePairs. Unlisted ids fall back to humanizeRetouchingId().
 */

/** @type {Record<string, { title: string; description?: string }>} */
export const retouchingMetaById = {
  dress: {
    title: "Evening dress",
    description: "Texture-safe finishing and fabric cleanup for e‑commerce.",
  },
  "nakedwolf-boots": {
    title: "Naked Wolfe boots",
    description: "Product cleanup, edge control, and tonal consistency.",
  },
  "flat-tshirt": {
    title: "Flat lay — T‑shirt",
    description: "Wrinkle reduction with natural fabric texture preserved.",
  },
  "camo-hoodie": {
    title: "Camo hoodie",
    description: "Color balance and garment shaping for catalog consistency.",
  },
  "nylon-hoodie": {
    title: "Nylon hoodie",
    description: "Highlight control and material detail refinement.",
  },
  lameskirt: {
    title: "Lamé skirt",
    description: "Specular management and silhouette cleanup.",
  },
  "womens-sweater": {
    title: "Women's sweater",
    description: "Knit texture preservation with overall polish.",
  },
  tshirt: {
    title: "T‑shirt",
    description: "Garment cleanup with true-to-life tone and contrast.",
  },
  tshirt2: {
    title: "T‑shirt (variant)",
    description: "Consistency pass for edges, shadows, and fabric detail.",
  },
  rdnm04: {
    title: "RDNM04",
    description: "Color correction and surface cleanup for product imagery.",
  },
  "female-tanktop": {
    title: "Tank top",
    description: "Wrinkle cleanup and tonal smoothing, kept natural.",
  },
  sweatshirt: {
    title: "Sweatshirt",
    description: "Shape refinement and lint cleanup for e‑commerce.",
  },
  bralett: {
    title: "Bralette",
    description: "Fine-detail cleanup with soft, editorial contrast.",
  },
  blanket: {
    title: "Throw blanket",
    description: "Texture-first cleanup with balanced color and tone.",
  },
  kidtee: {
    title: "Kids tee",
    description: "Garment cleanup and consistency across product set.",
  },
  hoodie: {
    title: "Hoodie",
    description: "Shadow control and fabric detail refinement.",
  },
  dovehoodie: {
    title: "Dove hoodie",
    description: "Campaign retouch — tone, texture, and garment cleanup.",
  },
  "1801-flat": {
    title: "Studio flat lay",
    description: "Flat-lay finishing with clean edges and true color.",
  },
};

/**
 * Fallback title when an id is not in retouchingMetaById.
 * Keeps digits, splits kebab-case into words, light capitalization.
 */
export function humanizeRetouchingId(id) {
  const key = String(id ?? "").toLowerCase().trim();
  if (!key) return "Untitled";

  return key
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      if (/^[a-z]{2,4}\d{2,4}$/i.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

/**
 * @param {string} id - pair id from manifest (e.g. "1801-flat")
 * @returns {{ title: string; description?: string }}
 */
export function getRetouchingMetaForPair(id) {
  const key = String(id).toLowerCase();
  const entry = retouchingMetaById[key];
  if (entry && typeof entry.title === "string" && entry.title.length) {
    return {
      title: entry.title,
      description:
        typeof entry.description === "string" && entry.description.length
          ? entry.description
          : undefined,
    };
  }
  return { title: humanizeRetouchingId(key), description: undefined };
}

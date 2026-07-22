import { campaignsManifest } from "@/lib/generated/campaigns";

export type Campaign = {
  slug: string;
  client: string;
  hero: string;
  heroes: string[];
  frames: string[];
};

/** Display-name overrides when slug title-case isn’t right (e.g. acronyms). */
const CLIENT_OVERRIDES: Record<string, string> = {
  laa: "LAA",
};

/** Slugs listed here appear first (in this order); everything else follows A→Z. */
const FEATURED_ORDER = ["yeezy"] as const;

export function getCampaigns(): Campaign[] {
  const mapped = campaignsManifest.map((c) => {
    const heroes =
      "heroes" in c && Array.isArray(c.heroes) && c.heroes.length > 0
        ? [...c.heroes]
        : c.hero
          ? [c.hero]
          : [];
    return {
      slug: c.slug,
      client: CLIENT_OVERRIDES[c.slug] ?? c.client,
      hero: c.hero || heroes[0] || "",
      heroes,
      frames: [...c.frames],
    };
  });

  const featuredRank = new Map<string, number>(
    FEATURED_ORDER.map((slug, i) => [slug, i]),
  );

  return mapped.sort((a, b) => {
    const aFeat = featuredRank.has(a.slug);
    const bFeat = featuredRank.has(b.slug);
    if (aFeat && bFeat) {
      return (featuredRank.get(a.slug) ?? 0) - (featuredRank.get(b.slug) ?? 0);
    }
    if (aFeat) return -1;
    if (bFeat) return 1;
    return a.slug.localeCompare(b.slug, undefined, { numeric: true });
  });
}

export function getCampaign(slug: string): Campaign | undefined {
  return getCampaigns().find((c) => c.slug === slug);
}

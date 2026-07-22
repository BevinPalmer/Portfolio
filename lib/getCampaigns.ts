import { campaignsManifest } from "@/lib/generated/campaigns";

export type Campaign = {
  slug: string;
  client: string;
  hero: string;
  heroes: string[];
  frames: string[];
};

export function getCampaigns(): Campaign[] {
  return campaignsManifest.map((c) => {
    const heroes =
      "heroes" in c && Array.isArray(c.heroes) && c.heroes.length > 0
        ? [...c.heroes]
        : c.hero
          ? [c.hero]
          : [];
    return {
      slug: c.slug,
      client: c.client,
      hero: c.hero || heroes[0] || "",
      heroes,
      frames: [...c.frames],
    };
  });
}

export function getCampaign(slug: string): Campaign | undefined {
  return getCampaigns().find((c) => c.slug === slug);
}

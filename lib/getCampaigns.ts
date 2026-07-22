import { campaignsManifest } from "@/lib/generated/campaigns";

export type Campaign = {
  slug: string;
  client: string;
  hero: string;
  frames: string[];
};

export function getCampaigns(): Campaign[] {
  return campaignsManifest.map((c) => ({
    slug: c.slug,
    client: c.client,
    hero: c.hero,
    frames: [...c.frames],
  }));
}

export function getCampaign(slug: string): Campaign | undefined {
  return getCampaigns().find((c) => c.slug === slug);
}

import type { MetadataRoute } from "next";
import { getCampaigns } from "@/lib/getCampaigns";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bevinpalmer.com";
  const routes = [
    "",
    "/about",
    "/retouching",
    "/contact",
    "/photography",
    "/photography/fashion",
    "/photography/ecommerce",
    "/photography/campaigns",
    ...getCampaigns().map((c) => `/photography/campaigns/${c.slug}`),
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}


import type { Metadata } from "next";
import { PhotographyPageClient } from "@/components/ps/PhotographyPageClient";
import { getPhotographyImagesMeta } from "@/lib/getImages";

export const metadata: Metadata = {
  title: "Photography",
};

export default async function PhotographyPage() {
  const images = await getPhotographyImagesMeta();
  return <PhotographyPageClient images={images} />;
}

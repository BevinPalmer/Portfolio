import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CampaignsChrome } from "@/components/ps/CampaignsChrome";
import { GifReel } from "@/components/ps/GifReel";
import { getCampaign, getCampaigns } from "@/lib/getCampaigns";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getCampaigns().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) return { title: "Campaign" };
  return { title: campaign.client };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  return (
    <>
      <CampaignsChrome
        docTab={`${campaign.client}.psd @ 100%`}
        docTabNarrow={campaign.client}
        statusLeft={`Campaigns  ·  ${campaign.client}  ·  RGB/8`}
        statusLeftMobile={`Campaigns · ${campaign.client}`}
        client={campaign.client}
        slug={campaign.slug}
      />
      <div
        className="w-full"
        style={{
          background: "#191918",
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: "55vh",
            width: "100%",
            background: "#111111",
          }}
        >
          {campaign.hero ? (
            <Image
              src={campaign.hero}
              alt={campaign.client}
              fill
              priority
              quality={88}
              sizes="100vw"
              className="object-cover"
              style={{ objectFit: "cover", objectPosition: "center 20%" }}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-black/25" aria-hidden />
          <span
            className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-center font-[Helvetica_Neue,Helvetica,Arial,sans-serif] text-[11px] font-normal uppercase tracking-[0.26em] text-white/95"
            style={{
              textShadow: "0 1px 12px rgba(0,0,0,0.6), 0 0 24px rgba(0,0,0,0.4)",
            }}
          >
            {campaign.client}
          </span>
        </div>

        {campaign.frames.length > 0 ? (
          <GifReel frames={campaign.frames} layout="scroll" />
        ) : null}
      </div>
    </>
  );
}

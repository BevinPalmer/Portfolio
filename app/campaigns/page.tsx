import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CampaignsChrome } from "@/components/ps/CampaignsChrome";
import { getCampaigns } from "@/lib/getCampaigns";

export const metadata: Metadata = {
  title: "Campaigns",
};

const labelStyle = {
  textShadow: "0 1px 12px rgba(0,0,0,0.6), 0 0 24px rgba(0,0,0,0.4)",
} as const;

export default function CampaignsPage() {
  const campaigns = getCampaigns();

  return (
    <>
      <CampaignsChrome
        docTab="Campaigns.psd @ 100%"
        docTabNarrow="Campaigns"
        statusLeft="Campaigns  ·  RGB/8  ·  Click to open"
        statusLeftMobile="Campaigns · RGB/8"
      />
      <div
        className="w-full"
        style={{
          background: "#191918",
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <div style={{ marginLeft: 20, marginRight: 20 }}>
          {campaigns.length === 0 ? (
            <p
              className="font-[Helvetica_Neue,Helvetica,Arial,sans-serif] text-[11px] uppercase tracking-[0.26em] text-white/50"
              style={{ padding: "48px 0" }}
            >
              No campaigns yet
            </p>
          ) : (
            <div className="grid w-full grid-cols-1 gap-px bg-[#111111] md:grid-cols-2">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.slug}
                  href={`/campaigns/${campaign.slug}`}
                  className="group block min-w-0"
                >
                  <div
                    className="cursor-pointer"
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
                        quality={88}
                        sizes="(max-width: 767px) 100vw, 50vw"
                        className="object-cover"
                        style={{ objectFit: "cover", objectPosition: "center 20%" }}
                      />
                    ) : null}
                    <div
                      className="pointer-events-none absolute inset-0 bg-black/25 transition-colors duration-200 group-hover:bg-black/35"
                      aria-hidden
                    />
                    <span
                      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-center font-[Helvetica_Neue,Helvetica,Arial,sans-serif] text-[11px] font-normal uppercase tracking-[0.26em] text-white/95"
                      style={labelStyle}
                    >
                      {campaign.client}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

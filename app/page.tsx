import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeGifReel } from "@/components/HomeGifReel";

export const metadata: Metadata = {
  title: "Bevin Palmer",
};

/** `find public -iname "miguel*"` → public/photography/miguel.jpg → creative/miguel.jpg */
const photoTileSrc = "/photography/miguel.jpg";
const retouchTileSrc = "/retouching/dress-after.png";

export default function HomePage() {
  return (
    <>
      <div
        className="ps-home-hard w-full"
        style={{
          background: "#191918",
          paddingTop: 20,
          paddingBottom: 0,
        }}
      >
        <div style={{ marginLeft: 20, marginRight: 20 }}>
          <div className="grid w-full grid-cols-1 gap-px bg-[#111111] md:grid-cols-2">
            <Link href="/photography" className="group block min-w-0">
              <div
                className="cursor-pointer"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "55vh",
                  width: "100%",
                }}
              >
                <Image
                  src={photoTileSrc}
                  alt="Photography"
                  fill
                  quality={88}
                  sizes="50vw"
                  className="object-cover"
                  style={{ objectFit: "cover", objectPosition: "center 20%" }}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-black/25 transition-colors duration-200 group-hover:bg-black/35"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-center font-[Helvetica_Neue,Helvetica,Arial,sans-serif] text-[11px] font-normal uppercase tracking-[0.26em] text-white/95"
                  style={{
                    textShadow:
                      "0 1px 12px rgba(0,0,0,0.6), 0 0 24px rgba(0,0,0,0.4)",
                  }}
                >
                  PHOTOGRAPHY
                </span>
              </div>
            </Link>

            <Link href="/retouching" className="group block min-w-0">
              <div
                className="cursor-pointer"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "55vh",
                  width: "100%",
                }}
              >
                <Image
                  src={retouchTileSrc}
                  alt="Retouching"
                  fill
                  quality={88}
                  sizes="50vw"
                  className="object-cover"
                  style={{ objectFit: "cover", objectPosition: "center 20%" }}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-black/35 transition-colors duration-200 group-hover:bg-black/45"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-center font-[Helvetica_Neue,Helvetica,Arial,sans-serif] text-[11px] font-normal uppercase tracking-[0.26em] text-white/95"
                  style={{
                    textShadow:
                      "0 1px 12px rgba(0,0,0,0.6), 0 0 24px rgba(0,0,0,0.4)",
                  }}
                >
                  RETOUCHING
                </span>
              </div>
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          style={{
            height: 1,
            background: "#191918",
            width: "100%",
          }}
        />

        <HomeGifReel />
      </div>
    </>
  );
}

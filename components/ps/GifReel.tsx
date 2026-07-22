"use client";

const fitImgStyle = {
  flex: "1 0 0",
  minWidth: 0,
  height: "100%",
  width: "auto" as const,
  objectFit: "cover" as const,
  objectPosition: "center 15%",
  display: "block" as const,
};

const scrollImgStyle = {
  flex: "0 0 auto",
  height: "100%",
  width: "auto" as const,
  objectFit: "cover" as const,
  objectPosition: "center 15%",
  display: "block" as const,
};

type GifReelProps = {
  frames: string[];
  /**
   * `fit` — equal-width strip (home hub). `scroll` — natural width + horizontal
   * overflow for touch/mouse pan (campaign detail).
   */
  layout?: "fit" | "scroll";
  className?: string;
};

export function GifReel({ frames, layout = "fit", className }: GifReelProps) {
  const scroll = layout === "scroll";
  const imgStyle = scroll ? scrollImgStyle : fitImgStyle;

  return (
    <div
      className={[
        "gif-strip flex h-[160px] w-full shrink-0 bg-black md:h-[280px]",
        scroll ? "touch-pan-x overflow-x-auto overflow-y-hidden" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: "100%",
        maxWidth: "100%",
        marginLeft: 0,
        marginRight: 0,
        overflow: scroll ? undefined : "hidden",
        background: "#000",
        gap: 0,
        display: "flex",
      }}
    >
      {frames.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element -- animated GIFs
        <img key={src} src={src} alt="" draggable={false} style={imgStyle} />
      ))}
    </div>
  );
}

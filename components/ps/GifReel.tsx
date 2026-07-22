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
   * overflow for touch/mouse pan (campaign detail). Strip width follows
   * frames only — no trailing empty slots from a full-bleed black bar.
   */
  layout?: "fit" | "scroll";
  className?: string;
};

export function GifReel({ frames, layout = "fit", className }: GifReelProps) {
  const items = frames.filter((src) => typeof src === "string" && src.trim().length > 0);
  const scroll = layout === "scroll";
  const imgStyle = scroll ? scrollImgStyle : fitImgStyle;

  if (items.length === 0) return null;

  const track = (
    <div
      className={[
        "gif-strip flex h-[160px] shrink-0 bg-black md:h-[280px]",
        scroll ? "w-max max-w-none" : "w-full",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        marginLeft: 0,
        marginRight: 0,
        overflow: scroll ? "visible" : "hidden",
        background: "#000",
        gap: 0,
        display: "flex",
        width: scroll ? "max-content" : "100%",
        maxWidth: scroll ? "none" : "100%",
      }}
    >
      {items.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element -- animated GIFs
        <img key={src} src={src} alt="" draggable={false} style={imgStyle} />
      ))}
    </div>
  );

  if (!scroll) return track;

  // Viewport scrolls; track is only as wide as the frames (no fake empty slot).
  return (
    <div
      className="touch-pan-x w-full max-w-full shrink-0 overflow-x-auto overflow-y-hidden"
      style={{ background: "#191918" }}
    >
      {track}
    </div>
  );
}

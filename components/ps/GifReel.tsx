"use client";

type GifReelProps = {
  frames: string[];
  /**
   * `fit` — equal-width cells fill the row (home + campaign contact sheet).
   * `scroll` — natural-width cells in a shrink-wrapped track; horizontal pan.
   */
  layout?: "fit" | "scroll";
  className?: string;
};

/**
 * Renders exactly `frames.length` cells — no fixed column count, no placeholder
 * tiles. Each cell is a sized box with a cover image so empty black strip
 * leftovers cannot read as an extra frame.
 */
export function GifReel({ frames, layout = "fit", className }: GifReelProps) {
  const items = frames.filter((src) => typeof src === "string" && src.trim().length > 0);
  const scroll = layout === "scroll";

  if (items.length === 0) return null;

  const track = (
    <div
      className={[
        "gif-strip flex h-[160px] shrink-0 md:h-[280px]",
        scroll ? "w-max max-w-none" : "w-full",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        display: "flex",
        gap: 0,
        margin: 0,
        padding: 0,
        background: "#191918",
        overflow: scroll ? "visible" : "hidden",
        width: scroll ? "max-content" : "100%",
        maxWidth: scroll ? "none" : "100%",
      }}
    >
      {items.map((src) => (
        <div
          key={src}
          className="relative h-full overflow-hidden bg-black"
          style={
            scroll
              ? { flex: "0 0 auto", height: "100%", aspectRatio: "4 / 5" }
              : { flex: "1 1 0", minWidth: 0, height: "100%" }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs */}
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 15%",
              display: "block",
            }}
          />
        </div>
      ))}
    </div>
  );

  if (!scroll) return track;

  return (
    <div
      className="touch-pan-x w-full max-w-full shrink-0 overflow-x-auto overflow-y-hidden"
      style={{ background: "#191918" }}
    >
      {track}
    </div>
  );
}

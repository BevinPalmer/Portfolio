"use client";

type GifReelProps = {
  frames: string[];
  /**
   * `fit` — equal slots fill the row width (contact sheet).
   * `scroll` — fixed-size portrait slots; horizontal pan when they overflow.
   * `auto` — `fit` for ≤6 frames, `scroll` when more (avoids unreadable slivers).
   */
  layout?: "fit" | "scroll" | "auto";
  /**
   * Slot aspect ratio (width / height). Portrait campaign frames default to 4/5.
   * Ignored only when omitted on home `fit` cover strips that share row height.
   */
  slotAspect?: `${number}/${number}`;
  className?: string;
};

/**
 * Renders exactly `frames.length` identical slots. Images always `object-fit: cover`
 * — no contain, no letterboxing, no placeholder tiles.
 */
export function GifReel({
  frames,
  layout = "fit",
  slotAspect = "4/5",
  className,
}: GifReelProps) {
  const items = frames.filter((src) => typeof src === "string" && src.trim().length > 0);

  if (items.length === 0) return null;

  const n = items.length;
  const scroll = layout === "scroll" || (layout === "auto" && n > 6);

  const cell = (src: string, index: number) => (
    <div
      key={src}
      className="relative overflow-hidden bg-[#111111]"
      style={
        scroll
          ? {
              flex: "0 0 auto",
              height: "100%",
              aspectRatio: slotAspect,
            }
          : {
              position: "relative",
              width: "100%",
              aspectRatio: slotAspect,
            }
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs */}
      <img
        src={src}
        alt=""
        draggable={false}
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          display: "block",
        }}
      />
    </div>
  );

  if (scroll) {
    return (
      <div
        className={[
          "gif-strip touch-pan-x w-full max-w-full shrink-0 overflow-x-auto overflow-y-hidden",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ background: "#191918" }}
      >
        <div
          className="flex h-[200px] w-max max-w-none md:h-[360px]"
          style={{ display: "flex", gap: 0, background: "#191918" }}
        >
          {items.map(cell)}
        </div>
      </div>
    );
  }

  // Equal-width portrait slots spanning the full row — contact-sheet rhythm.
  return (
    <div
      className={["gif-strip w-full shrink-0", className ?? ""].filter(Boolean).join(" ")}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
        gap: 0,
        width: "100%",
        background: "#191918",
        cursor: "default",
      }}
    >
      {items.map(cell)}
    </div>
  );
}

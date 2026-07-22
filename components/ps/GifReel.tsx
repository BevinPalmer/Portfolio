"use client";

import { useEffect, useId } from "react";

type GifReelProps = {
  frames: string[];
  /**
   * `fit` — equal-width cells fill the row (home + campaign contact sheet).
   * `scroll` — natural-width cells in a shrink-wrapped track; horizontal pan.
   */
  layout?: "fit" | "scroll";
  /**
   * How the image fills its cell. Campaigns use `contain` so full frames
   * aren’t cropped; home product GIFs keep `cover`.
   */
  objectFit?: "cover" | "contain";
  /** Track height in px. Defaults: fit 160→280, scroll 200→360 (mobile→md). */
  heightMobile?: number;
  heightDesktop?: number;
  className?: string;
};

/**
 * Renders exactly `frames.length` cells — no fixed column count, no placeholder
 * tiles. Never put non-cell nodes inside the flex track (that creates a fake slot).
 */
export function GifReel({
  frames,
  layout = "fit",
  objectFit = "cover",
  heightMobile,
  heightDesktop,
  className,
}: GifReelProps) {
  const items = frames.filter((src) => typeof src === "string" && src.trim().length > 0);
  const scroll = layout === "scroll";
  const uid = useId().replace(/:/g, "");
  const trackClass = `gif-strip gif-strip-${uid}`;

  const hMob = heightMobile ?? (scroll ? 200 : 160);
  const hDesk = heightDesktop ?? (scroll ? 360 : 280);

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-gif-reel", uid);
    style.textContent = `
      .gif-strip-${uid} { height: ${hMob}px; }
      @media (min-width: 768px) {
        .gif-strip-${uid} { height: ${hDesk}px; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [uid, hMob, hDesk]);

  if (items.length === 0) return null;

  const track = (
    <div
      className={[trackClass, "flex shrink-0", scroll ? "w-max max-w-none" : "w-full", className ?? ""]
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
        height: hMob,
      }}
    >
      {items.map((src) => (
        <div
          key={src}
          className="relative h-full overflow-hidden"
          style={
            scroll
              ? {
                  flex: "0 0 auto",
                  height: "100%",
                  aspectRatio: "4 / 5",
                  background: "#111111",
                }
              : {
                  flex: "1 1 0%",
                  minWidth: 0,
                  width: 0,
                  height: "100%",
                  background: "#111111",
                }
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
              objectFit,
              objectPosition: "center center",
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

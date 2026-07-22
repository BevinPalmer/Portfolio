"use client";

import { GifReel } from "@/components/ps/GifReel";

const GIF_FILES = [
  "YZY-Black-Hoodie.gif",
  "YZY-Creme-TeeV2.gif",
  "YZY-Black-Fleece.gif",
  "YZY-Bag.gif",
  "trf-10.gif",
] as const;

export function HomeGifReel() {
  return (
    <GifReel
      layout="fit"
      frames={GIF_FILES.map((gif) => `/portfolio/${gif}`)}
    />
  );
}

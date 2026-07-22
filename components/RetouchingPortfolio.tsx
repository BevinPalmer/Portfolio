"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { solidBlurDataURL } from "@/lib/blurDataUrl";
import type { RetouchingPair } from "@/components/RetouchingViewer.types";

export type { RetouchingPair };

const blur = solidBlurDataURL("#ffffff");
const IMAGE_SIZES = "(max-width: 768px) 100vw, 1200px";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function RetouchingPairSlide({
  pair,
  priority,
}: {
  pair: RetouchingPair;
  priority: boolean;
}) {
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const iw = Math.max(1, pair.width);
  const ih = Math.max(1, pair.height);
  const rightInset = 100 - split;

  const updateSplitFromClientX = useCallback((clientX: number) => {
    const el = viewerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    setSplit(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      updateSplitFromClientX(e.clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, updateSplitFromClientX]);

  const onPointerDownHandle = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    updateSplitFromClientX(e.clientX);
  };

  return (
    <article className="w-full">
      <div
        ref={viewerRef}
        className="relative w-full touch-pan-y overflow-hidden bg-white"
        style={{ aspectRatio: `${iw} / ${ih}` }}
      >
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={pair.before}
            alt=""
            fill
            className="object-contain object-center"
            sizes={IMAGE_SIZES}
            quality={88}
            priority={priority}
            placeholder="blur"
            blurDataURL={blur}
          />
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${rightInset}% 0 0)` }}
          >
            <Image
              src={pair.after}
              alt=""
              fill
              className="object-contain object-center"
              sizes={IMAGE_SIZES}
              quality={88}
              priority={priority}
              placeholder="blur"
              blurDataURL={blur}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 z-[10]"
          style={{ left: `${split}%` }}
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white shadow-sm" />
        </div>

        <div
          data-ba-handle="true"
          className="pointer-events-auto absolute inset-y-0 z-[11] flex min-h-[56px] w-14 min-w-[56px] -translate-x-1/2 cursor-ew-resize items-center justify-center"
          style={{ left: `${split}%`, touchAction: "none" }}
          onPointerDown={onPointerDownHandle}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M10 12H5M5 12l2.5-2.5M5 12l2.5 2.5"
                stroke="#999999"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 12h5m0 0l-2.5-2.5M19 12l-2.5 2.5"
                stroke="#999999"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <p
        className="text-left text-[13px] font-normal uppercase tracking-[0.12em] text-[#999999]"
        style={{ margin: "12px 0 48px 0" }}
      >
        {pair.label}
      </p>
    </article>
  );
}

type RetouchingPortfolioProps = {
  pairs: RetouchingPair[];
};

export default function RetouchingPortfolio({ pairs }: RetouchingPortfolioProps) {
  if (pairs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background p-12 text-[15px] text-[#999999]">
        No comparisons yet.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col px-0 pb-[80px] pt-[40px] md:px-[60px]">
        {pairs.map((pair, i) => (
          <RetouchingPairSlide key={pair.id} pair={pair} priority={i < 2} />
        ))}
      </div>
    </div>
  );
}

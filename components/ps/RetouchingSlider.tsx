"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const IMG_SIZES = "(max-width: 768px) 100vw, calc(100vw - 220px)";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  width: number;
  height: number;
  splitPercent: number;
  onSplitChange: (pct: number) => void;
  currentPairIndex: number;
};

export function RetouchingSlider({
  beforeSrc,
  afterSrc,
  width,
  height,
  splitPercent,
  onSplitChange,
  currentPairIndex,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number } | null>(null);

  const baseW = width > 0 ? width : 1;
  const baseH = height > 0 ? height : 1;
  const [loadedNat, setLoadedNat] = useState<{ w: number; h: number } | null>(null);
  const naturalW = loadedNat?.w ?? baseW;
  const naturalH = loadedNat?.h ?? baseH;

  const [innerSize, setInnerSize] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const ow = outer.clientWidth;
    const oh = outer.clientHeight;
    if (ow <= 0 || oh <= 0) return;
    const nw = Math.max(1, naturalW);
    const nh = Math.max(1, naturalH);
    const scale = Math.min(ow / nw, oh / nh);
    setInnerSize({
      w: Math.round(nw * scale),
      h: Math.round(nh * scale),
    });
  }, [naturalW, naturalH]);

  useLayoutEffect(() => {
    measure();
  }, [measure, currentPairIndex, beforeSrc, afterSrc]);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(outer);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const handleBeforeLoad = useCallback((img: HTMLImageElement) => {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setLoadedNat({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId };

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      const el = innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / Math.max(1, rect.width)) * 100;
      onSplitChange(Math.min(100, Math.max(0, pct)));
    };

    const onUp = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  useEffect(() => {
    return () => {
      dragRef.current = null;
    };
  }, []);

  const clipBefore = `inset(0 ${100 - splitPercent}% 0 0)`;
  const clipAfter = `inset(0 0 0 ${splitPercent}%)`;

  return (
    <div className="ps-retouch-slider relative w-full min-h-0 flex-1">
      <div ref={outerRef} className="ps-retouch-viewer-outer">
        <div
          ref={innerRef}
          className="ps-retouch-viewer-inner"
          style={{
            position: "relative",
            overflow: "hidden",
            width: innerSize.w > 0 ? `${innerSize.w}px` : undefined,
            height: innerSize.h > 0 ? `${innerSize.h}px` : undefined,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{ clipPath: clipBefore }}
            aria-hidden
          >
            <Image
              src={beforeSrc}
              alt=""
              width={naturalW}
              height={naturalH}
              fill
              sizes={IMG_SIZES}
              quality={88}
              className="object-cover"
              draggable={false}
              priority
              onLoadingComplete={handleBeforeLoad}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ clipPath: clipAfter }}
            aria-hidden
          >
            <Image
              src={afterSrc}
              alt=""
              width={naturalW}
              height={naturalH}
              fill
              sizes={IMG_SIZES}
              quality={88}
              className="object-cover"
              draggable={false}
              priority
            />
          </div>
          <div
            className="ps-retouch-split-line"
            style={{ left: `${splitPercent}%` }}
            aria-hidden
          />
          <div
            className="ps-retouch-handle ps-slider-handle"
            style={{
              position: "absolute",
              top: "50%",
              left: `${splitPercent}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={onPointerDown}
            role="slider"
            aria-valuenow={Math.round(splitPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Before and after split"
          >
            ‹ ›
          </div>
        </div>
      </div>
    </div>
  );
}

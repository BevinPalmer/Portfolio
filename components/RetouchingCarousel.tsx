"use client";

import { Children, useEffect, useMemo, useRef, type ReactNode } from "react";

type RetouchingCarouselProps = {
  children: ReactNode;
  className?: string;
  /** Pixels per second. Keep low for cinematic motion. */
  speedPxPerSecond?: number;
};

export function RetouchingCarousel({
  children,
  className,
  speedPxPerSecond = 14,
}: RetouchingCarouselProps) {
  const isPausedRef = useRef(false);
  const offsetRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const halfWidthRef = useRef(0);

  const items = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function measure() {
      const track = trackRef.current;
      if (!track) return;
      const total = track.scrollWidth;
      halfWidthRef.current = total / 2;
      offsetRef.current = offsetRef.current % Math.max(1, halfWidthRef.current);
    }

    measure();
    const ro = new ResizeObserver(() => measure());
    if (trackRef.current) ro.observe(trackRef.current);

    function animate(ts: number) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!isPausedRef.current) {
        const half = halfWidthRef.current;
        if (half > 0) {
          offsetRef.current += speedPxPerSecond * dt;
          // Seamless loop: wrap within the first copy width.
          if (offsetRef.current >= half) offsetRef.current -= half;
          const track = trackRef.current;
          if (track) {
            track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [speedPxPerSecond]);

  return (
    <div
      ref={viewportRef}
      className={className}
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
      onTouchStart={() => {
        isPausedRef.current = true;
      }}
      onTouchEnd={() => {
        isPausedRef.current = false;
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        aria-hidden="true"
      >
        {items}
        {items}
      </div>
    </div>
  );
}


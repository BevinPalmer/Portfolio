"use client";

import { useEffect, useRef } from "react";

const GIFS = [
  "/portfolio/YZY-Black-Hoodie.gif",
  "/portfolio/YZY-Creme-TeeV2.gif",
  "/portfolio/YZY-Black-Fleece.gif",
  "/portfolio/YZY-Bag.gif",
  "/portfolio/trf-10.gif",
] as const;

export function HomeMotionStrip() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !scrollerRef.current) return;
      const el = scrollerRef.current;
      el.scrollLeft += startXRef.current - e.clientX;
      startXRef.current = e.clientX;
    };

    const onUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    draggingRef.current = true;
    startXRef.current = e.clientX;
  };

  return (
    <section
      className="gif-strip w-screen max-w-none shrink-0 self-stretch bg-[#000000]"
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}
    >
      <div
        ref={scrollerRef}
        className="home-motion-strip flex h-[170px] w-full touch-pan-x flex-row overflow-y-hidden overflow-x-auto md:h-[240px]"
        style={{ gap: "3px" }}
        onMouseDown={onMouseDown}
      >
        {GIFS.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- animated GIFs
          <img
            key={src}
            src={src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            className="block h-full w-auto shrink-0"
            style={{
              height: "100%",
              width: "auto",
              display: "block",
            }}
          />
        ))}
      </div>
    </section>
  );
}

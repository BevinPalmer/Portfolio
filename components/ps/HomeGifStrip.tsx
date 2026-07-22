"use client";

import { useEffect, useRef, useState } from "react";

const GIF_SRC = [
  "/portfolio/YZY-Bag.gif",
  "/portfolio/YZY-Black-Fleece.gif",
  "/portfolio/YZY-Black-Hoodie.gif",
  "/portfolio/YZY-Creme-TeeV2.gif",
  "/portfolio/trf-10.gif",
] as const;

export function HomeGifStrip() {
  const elRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [pointerDrag, setPointerDrag] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPointerDrag(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!pointerDrag) return;
    const el = elRef.current;
    if (!el) return;
    draggingRef.current = true;
    const startX = e.clientX;
    const startScroll = el.scrollLeft;
    el.classList.add("ps-gif-strip-dragging");

    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      el.scrollLeft = startScroll - (ev.clientX - startX);
    };

    const onUp = () => {
      draggingRef.current = false;
      el.classList.remove("ps-gif-strip-dragging");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={elRef}
      className="ps-gif-strip"
      onMouseDown={pointerDrag ? onMouseDown : undefined}
      role="presentation"
    >
      {GIF_SRC.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element -- animated GIFs
        <img key={src} src={src} alt="" draggable={false} />
      ))}
    </div>
  );
}

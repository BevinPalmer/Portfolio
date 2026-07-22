"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FADE_MS = 500;
const HOLD_MS = 4000;

type Props = {
  images: string[];
  alt: string;
};

/** Crossfades stacked heroes — 0.5s fade, then hold on the next frame. */
export function CampaignHeroFade({ images, alt }: Props) {
  const slides = images.filter((src) => typeof src === "string" && src.trim().length > 0);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, HOLD_MS + FADE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, slides.length]);

  if (slides.length === 0) return null;

  if (slides.length === 1 || reduceMotion) {
    return (
      <Image
        src={slides[0]}
        alt={alt}
        fill
        priority
        quality={88}
        sizes="100vw"
        className="object-cover"
        style={{ objectFit: "cover", objectPosition: "center 20%" }}
      />
    );
  }

  return (
    <>
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority={i === 0}
          quality={88}
          sizes="100vw"
          className="object-cover"
          style={{
            objectFit: "cover",
            objectPosition: "center 20%",
            opacity: i === index ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
            zIndex: i === index ? 1 : 0,
          }}
        />
      ))}
    </>
  );
}

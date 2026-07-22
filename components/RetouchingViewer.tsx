"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { solidBlurDataURL } from "../lib/blurDataUrl";
import type { RetouchingPair } from "./RetouchingViewer.types";

export type { RetouchingPair };

const blur = solidBlurDataURL("#ffffff");

const IMAGE_SIZES = "100vw";
const IMAGE_SIZES_DESKTOP = "(max-width: 767px) 100vw, 960px";

const MOBILE_MQ = "(max-width: 767px)";
const NAV_H = 60;
const DESKTOP_STRIP_H = 48;
const DESKTOP_MAX_VIEWER_W = 960;
const SWIPE_EDGE_PX = 60;
const SWIPE_INTENT_PX = 8;
const SWIPE_RATIO = 1.5;
const SWIPE_COMMIT_PX = 40;
const SWIPE_VELOCITY_MS = 0.3;
const RUBBER = 0.3;
const CROSSFADE_MS = 250;
const TITLE_FADE_IN_MS = 200;
const TITLE_HOLD_MS = 1800;
const TITLE_FADE_OUT_MS = 400;

function preloadPair(pair: RetouchingPair | undefined) {
  if (!pair || typeof window === "undefined") return;
  const preload = (src: string) => {
    const img = new window.Image();
    img.src = src;
  };
  preload(pair.before);
  preload(pair.after);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Dots: all indices if total ≤ 18; else sliding window of 7 centered on current. */
function useDotWindow(total: number, current: number) {
  if (total <= 18) {
    return { dots: total, offset: 0, windowSize: total };
  }
  const windowSize = 7;
  const half = 3;
  const offset = clamp(current - half, 0, total - windowSize);
  return { dots: windowSize, offset, windowSize };
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return isMobile;
}

/** Desktop: fit image in max 960×(viewport − nav − strip), never overflow viewport height. */
function useDesktopViewerBox(naturalW: number, naturalH: number, isMobileViewport: boolean) {
  const [box, setBox] = useState({ w: 640, h: 900 });
  useLayoutEffect(() => {
    if (isMobileViewport || typeof window === "undefined") return;
    const measure = () => {
      const iw = Math.max(1, naturalW);
      const ih = Math.max(1, naturalH);
      const capH = Math.max(120, window.innerHeight - NAV_H - DESKTOP_STRIP_H);
      const capW = Math.min(DESKTOP_MAX_VIEWER_W, document.documentElement.clientWidth);
      const scale = Math.min(capW / iw, capH / ih);
      setBox({ w: iw * scale, h: ih * scale });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [naturalW, naturalH, isMobileViewport]);
  return box;
}

type ComparisonLayerProps = {
  pair: RetouchingPair;
  split: number;
  onBeforeLoadingComplete?: () => void;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function ComparisonLayer({
  pair,
  split,
  onBeforeLoadingComplete,
  priority = true,
  className = "",
  style,
}: ComparisonLayerProps) {
  const iw = Math.max(1, pair.width);
  const ih = Math.max(1, pair.height);
  const aspectPaddingPct = (ih / iw) * 100;
  const rightInset = 100 - split;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-white ${className}`} style={style}>
      <div className="relative h-0 w-full" style={{ paddingBottom: `${aspectPaddingPct}%` }}>
        <div className="absolute inset-0 overflow-hidden bg-white">
          <Image
            key={`before-${pair.id}`}
            src={pair.before}
            alt=""
            fill
            className="object-contain"
            sizes={IMAGE_SIZES}
            quality={85}
            priority={priority}
            placeholder="blur"
            blurDataURL={blur}
            onLoadingComplete={onBeforeLoadingComplete}
          />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${rightInset}% 0 0)` }}>
            <Image
              key={`after-${pair.id}`}
              src={pair.after}
              alt=""
              fill
              className="object-contain"
              sizes={IMAGE_SIZES}
              quality={85}
              priority={priority}
              placeholder="blur"
              blurDataURL={blur}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RetouchingViewer({ pairs }: { pairs: RetouchingPair[] }) {
  const [index, setIndex] = useState(0);
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [placeholderAfter, setPlaceholderAfter] = useState<string | null>(null);
  const [overlayFadeOut, setOverlayFadeOut] = useState(false);

  const total = useMemo(() => pairs.length, [pairs]);

  const [mobileCrossfade, setMobileCrossfade] = useState<{
    from: number;
    to: number;
    outgoingSplit: number;
  } | null>(null);
  const [mobileSwipeX, setMobileSwipeX] = useState(0);
  const [mobileSwipeSpring, setMobileSwipeSpring] = useState(false);
  const [mobileSwipeWillChange, setMobileSwipeWillChange] = useState(false);

  const [titleOverlay, setTitleOverlay] = useState<{ opacity: number; key: number }>({
    opacity: 0,
    key: 0,
  });

  /** Natural aspect from loaded before image — mobile only; avoids letterboxing vs split line. */
  const [mobileImageRatio, setMobileImageRatio] = useState<number | null>(null);
  const [mobileViewerOpacity, setMobileViewerOpacity] = useState(1);

  const viewerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef(50);
  const busyRef = useRef(false);
  const expectPlaceholderFadeRef = useRef(false);
  const beforeLoadHandledForIdRef = useRef<string | null>(null);
  const swipeSessionRef = useRef<{
    pointerId: number;
    mode: "swipe" | "drag";
    x0: number;
    y0: number;
    intentLocked: boolean;
    intent: "none" | "horizontal" | "vertical";
    lastX: number;
    lastT: number;
    prevX: number;
    prevT: number;
    move: (ev: PointerEvent) => void;
    up: (ev: PointerEvent) => void;
  } | null>(null);

  const crossfadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();

  const pair = total > 0 ? pairs[index] : undefined;
  const prevPair = index > 0 ? pairs[index - 1] : undefined;
  const nextPair = index < total - 1 ? pairs[index + 1] : undefined;

  useLayoutEffect(() => {
    splitRef.current = split;
  }, [split]);

  useLayoutEffect(() => {
    beforeLoadHandledForIdRef.current = null;
  }, [pair?.id]);

  useEffect(() => {
    if (!isMobile || !pair) return;
    queueMicrotask(() => {
      setMobileViewerOpacity(0);
      setMobileImageRatio(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when pair id changes
  }, [isMobile, pair?.id]);

  const finishPlaceholderFade = useCallback(() => {
    setOverlayFadeOut(true);
    window.setTimeout(() => {
      setPlaceholderAfter(null);
      setOverlayFadeOut(false);
      busyRef.current = false;
    }, 150);
  }, []);

  const onBeforeLoadingComplete = useCallback(() => {
    const p = pairs[index];
    if (!p) return;
    const id = p.id;
    if (beforeLoadHandledForIdRef.current === id) return;
    beforeLoadHandledForIdRef.current = id;

    if (expectPlaceholderFadeRef.current) {
      expectPlaceholderFadeRef.current = false;
      finishPlaceholderFade();
    } else {
      busyRef.current = false;
    }
  }, [finishPlaceholderFade, index, pairs]);

  const handleMobileBeforeImageLoad = useCallback(
    (img: HTMLImageElement) => {
      setMobileImageRatio(img.naturalHeight / Math.max(1, img.naturalWidth));
      onBeforeLoadingComplete();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMobileViewerOpacity(1);
        });
      });
    },
    [onBeforeLoadingComplete],
  );

  const clearCrossfadeTimer = useCallback(() => {
    if (crossfadeTimerRef.current) {
      clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
  }, []);

  const goDesktop = useCallback(
    (dir: -1 | 1) => {
      if (busyRef.current) return;
      const n = index + dir;
      if (n < 0 || n >= total) return;
      busyRef.current = true;
      expectPlaceholderFadeRef.current = true;
      setPlaceholderAfter(pairs[index].after);
      setOverlayFadeOut(false);
      setIndex(n);
      setSplit(50);
    },
    [index, total, pairs],
  );

  const startMobileCrossfade = useCallback(
    (toIndex: number) => {
      if (busyRef.current) return;
      const from = index;
      if (toIndex === from) return;
      busyRef.current = true;
      clearCrossfadeTimer();
      setMobileCrossfade({
        from,
        to: toIndex,
        outgoingSplit: splitRef.current,
      });
      setIndex(toIndex);
      setSplit(50);
      crossfadeTimerRef.current = setTimeout(() => {
        setMobileCrossfade(null);
        crossfadeTimerRef.current = null;
      }, CROSSFADE_MS);
    },
    [index, clearCrossfadeTimer],
  );

  const go = useCallback(
    (dir: -1 | 1) => {
      const n = index + dir;
      if (n < 0 || n >= total) return;
      if (isMobile) {
        startMobileCrossfade(n);
      } else {
        goDesktop(dir);
      }
    },
    [index, total, isMobile, startMobileCrossfade, goDesktop],
  );

  const detachSwipeListeners = useCallback(() => {
    const s = swipeSessionRef.current;
    if (!s) return;
    window.removeEventListener("pointermove", s.move);
    window.removeEventListener("pointerup", s.up);
    window.removeEventListener("pointercancel", s.up);
    swipeSessionRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      detachSwipeListeners();
      clearCrossfadeTimer();
    };
  }, [detachSwipeListeners, clearCrossfadeTimer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    preloadPair(prevPair);
    preloadPair(nextPair);
    if (!isMobile) {
      const hrefs: string[] = [];
      if (prevPair) {
        hrefs.push(prevPair.before, prevPair.after);
      }
      if (nextPair) {
        hrefs.push(nextPair.before, nextPair.after);
      }
      const links: HTMLLinkElement[] = [];
      for (const href of hrefs) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = new URL(href, window.location.origin).href;
        document.head.appendChild(link);
        links.push(link);
      }
      return () => {
        for (const l of links) {
          if (l.parentNode) document.head.removeChild(l);
        }
      };
    }
    return undefined;
  }, [index, prevPair, nextPair, isMobile]);

  const updateSplitFromClientX = useCallback((clientX: number) => {
    const el = viewerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(clamp(pct, 0, 100));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

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

  /** Mobile: title overlay sequence on pair change. */
  useEffect(() => {
    if (!isMobile || !pair) return;
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setTitleOverlay((o) => ({ opacity: 0, key: o.key + 1 }));
      }, 0),
    );
    timers.push(
      window.setTimeout(() => {
        setTitleOverlay((o) => ({ ...o, opacity: 1 }));
      }, TITLE_FADE_IN_MS),
    );
    timers.push(
      window.setTimeout(() => {
        setTitleOverlay((o) => ({ ...o, opacity: 0 }));
      }, TITLE_FADE_IN_MS + TITLE_HOLD_MS),
    );
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [isMobile, pair?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- pair?.id only

  /** Mobile crossfade: clear busy when new pair's before has loaded. */
  useEffect(() => {
    if (!isMobile || !pair) return;
    const id = pair.id;
    if (beforeLoadHandledForIdRef.current === id) return;
    beforeLoadHandledForIdRef.current = id;
    busyRef.current = false;
  }, [isMobile, pair?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- pair?.id only

  const rubberSwipeX = useCallback(
    (rawDx: number, i: number) => {
      if (i <= 0 && rawDx > 0) return rawDx * RUBBER;
      if (i >= total - 1 && rawDx < 0) return rawDx * RUBBER;
      return rawDx;
    },
    [total],
  );

  const onPointerDownViewer = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-ba-handle='true']")) return;

    if (isMobile && e.pointerType === "touch") {
      detachSwipeListeners();
      const el = viewerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const splitPx = rect.left + (splitRef.current / 100) * rect.width;
      const nearLine = Math.abs(e.clientX - splitPx) <= SWIPE_EDGE_PX;

      if (nearLine) {
        setDragging(true);
        updateSplitFromClientX(e.clientX);
        return;
      }

      const x0 = e.clientX;
      const y0 = e.clientY;
      const pointerId = e.pointerId;
      let intentLocked = false;
      let intent: "none" | "horizontal" | "vertical" = "none";
      let lastX = x0;
      let lastT = performance.now();
      let prevX = x0;
      let prevT = lastT;

      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        const session = swipeSessionRef.current;
        if (!session || session.mode !== "swipe") return;

        const dx = ev.clientX - x0;
        const dy = ev.clientY - y0;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);

        if (!intentLocked) {
          if (Math.max(adx, ady) < SWIPE_INTENT_PX) return;
          if (adx > SWIPE_RATIO * ady) {
            intent = "horizontal";
            intentLocked = true;
            setMobileSwipeWillChange(true);
          } else if (ady > SWIPE_RATIO * adx) {
            intent = "vertical";
            intentLocked = true;
            detachSwipeListeners();
            setMobileSwipeX(0);
            setMobileSwipeWillChange(false);
            return;
          } else {
            return;
          }
        }

        if (intent !== "horizontal") return;

        ev.preventDefault();
        const rubber = rubberSwipeX(dx, index);
        setMobileSwipeSpring(false);
        setMobileSwipeX(rubber);
        prevX = lastX;
        prevT = lastT;
        lastX = ev.clientX;
        lastT = performance.now();
      };

      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        detachSwipeListeners();
        setMobileSwipeWillChange(false);

        const sessionInner = swipeSessionRef.current;
        if (sessionInner && sessionInner.intent !== "horizontal") {
          setMobileSwipeSpring(true);
          setMobileSwipeX(0);
          window.setTimeout(() => setMobileSwipeSpring(false), 320);
          return;
        }

        const dx = ev.clientX - x0;
        const dt = Math.max(1, performance.now() - prevT);
        const vx = (ev.clientX - prevX) / dt;

        let commit = false;
        let dir: -1 | 1 | 0 = 0;
        if (intent === "horizontal") {
          if (Math.abs(dx) >= SWIPE_COMMIT_PX) {
            commit = true;
            dir = dx < 0 ? 1 : -1;
          } else if (Math.abs(vx) > SWIPE_VELOCITY_MS) {
            commit = true;
            dir = vx < 0 ? 1 : -1;
          }
        }

        if (commit && dir === -1 && index > 0) {
          setMobileSwipeSpring(false);
          setMobileSwipeX(0);
          startMobileCrossfade(index - 1);
          return;
        }
        if (commit && dir === 1 && index < total - 1) {
          setMobileSwipeSpring(false);
          setMobileSwipeX(0);
          startMobileCrossfade(index + 1);
          return;
        }

        setMobileSwipeSpring(true);
        setMobileSwipeX(0);
        window.setTimeout(() => setMobileSwipeSpring(false), 320);
      };

      swipeSessionRef.current = {
        pointerId,
        mode: "swipe",
        x0,
        y0,
        intentLocked,
        intent,
        lastX,
        lastT,
        prevX,
        prevT,
        move,
        up,
      };

      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", up, { passive: true });
      window.addEventListener("pointercancel", up, { passive: true });
      return;
    }

    if (!isMobile && e.pointerType === "touch") {
      detachSwipeListeners();
      const x0 = e.clientX;
      const y0 = e.clientY;
      const pointerId = e.pointerId;
      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        const session = swipeSessionRef.current;
        if (!session || session.mode !== "swipe") return;
        const dx = ev.clientX - session.x0;
        const dy = ev.clientY - session.y0;
        const el = viewerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const splitPx = rect.left + (splitRef.current / 100) * rect.width;
        const nearHandle = Math.abs(ev.clientX - splitPx) < 56;
        if (nearHandle) return;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
          detachSwipeListeners();
          if (dx < 0) goDesktop(1);
          else goDesktop(-1);
        }
      };
      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        detachSwipeListeners();
      };
      swipeSessionRef.current = {
        pointerId,
        mode: "swipe",
        x0,
        y0,
        intentLocked: true,
        intent: "horizontal",
        lastX: x0,
        lastT: performance.now(),
        prevX: x0,
        prevT: performance.now(),
        move,
        up,
      };
      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", up, { passive: true });
      window.addEventListener("pointercancel", up, { passive: true });
      return;
    }

    setDragging(true);
    updateSplitFromClientX(e.clientX);
  };

  const onPointerDownHandle = (e: React.PointerEvent) => {
    e.stopPropagation();
    detachSwipeListeners();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    updateSplitFromClientX(e.clientX);
  };

  const dotSpec = useDotWindow(total, index);
  const deskNatW = pair ? Math.max(1, pair.width) : 1;
  const deskNatH = pair ? Math.max(1, pair.height) : 1;
  const desktopBox = useDesktopViewerBox(deskNatW, deskNatH, isMobile);

  if (!pair || total === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white p-12 text-center text-[15px] text-[#999999]">
        <p>No comparisons yet.</p>
        <Link href="/" className="text-[14px] text-[#666666] underline underline-offset-2">
          Back to home
        </Link>
      </div>
    );
  }

  const rightInset = 100 - split;
  const mobileHeightStyle = isMobile ? { height: `calc(100svh - ${NAV_H}px)` } : undefined;

  const swipeTransformStyle: React.CSSProperties = {
    transform: `translate3d(${mobileSwipeX}px,0,0)`,
    transition: mobileSwipeSpring
      ? "transform 0.28s cubic-bezier(0.34, 1.45, 0.64, 1)"
      : "none",
    willChange: mobileSwipeWillChange ? "transform" : undefined,
  };

  return (
    <div
      className={[
        "flex min-h-0 flex-1 flex-col",
        isMobile ? "bg-white md:flex md:flex-col" : "bg-[#f9f9f9]",
      ].join(" ")}
    >
      {isMobile ? (
        <div
          className={[
            "w-full shrink-0",
            "flex min-h-0 flex-1 flex-col md:block md:min-h-0 md:flex-none",
          ].join(" ")}
        >
          <div
            className={[
              "relative w-full overflow-hidden bg-white",
              "min-h-0 flex-1 md:h-0 md:max-h-[calc(100vh-60px)] md:shrink-0",
              !mobileCrossfade ? "flex flex-col" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={isMobile && mobileCrossfade ? mobileHeightStyle : undefined}
          >
            <div
              className={[
                "touch-pan-y overflow-hidden bg-white md:touch-pan-y",
                mobileCrossfade ? "absolute inset-0" : "relative z-[3] w-full min-h-0 flex-1",
              ].join(" ")}
              ref={viewerRef}
              onPointerDown={onPointerDownViewer}
              style={{ touchAction: mobileSwipeWillChange ? "none" : "pan-y" }}
            >
              {mobileCrossfade ? (
                <>
                  <div
                    className="absolute inset-0 z-[1]"
                    style={{
                      opacity: 0,
                      transition: `opacity ${CROSSFADE_MS}ms ease`,
                      animation: `retouchFadeOut ${CROSSFADE_MS}ms ease forwards`,
                    }}
                  >
                    <ComparisonLayer
                      pair={pairs[mobileCrossfade.from]}
                      split={mobileCrossfade.outgoingSplit}
                      priority={false}
                    />
                  </div>
                  <div
                    className="absolute inset-0 z-[2]"
                    style={{
                      opacity: 0,
                      animation: `retouchFadeIn ${CROSSFADE_MS}ms ease forwards`,
                    }}
                  >
                    <ComparisonLayer
                      pair={pairs[mobileCrossfade.to]}
                      split={50}
                      onBeforeLoadingComplete={undefined}
                      priority
                    />
                  </div>
                </>
              ) : null}

              {!mobileCrossfade ? (
                <div className="w-full" style={swipeTransformStyle}>
                  <div
                    style={{
                      opacity: mobileViewerOpacity,
                      transition: "opacity 200ms ease",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingBottom: mobileImageRatio != null ? `${mobileImageRatio * 100}%` : "133%",
                        overflow: "hidden",
                      }}
                    >
                      <div className="absolute inset-0 overflow-hidden bg-white">
                        <Image
                          key={`before-mobile-${pair.id}`}
                          src={pair.before}
                          alt=""
                          fill
                          className="object-cover"
                          sizes={IMAGE_SIZES}
                          quality={85}
                          priority
                          placeholder="blur"
                          blurDataURL={blur}
                          onLoadingComplete={handleMobileBeforeImageLoad}
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1]"
                          style={{ clipPath: `inset(0 ${rightInset}% 0 0)` }}
                          aria-hidden
                        >
                          <Image
                            key={`after-mobile-${pair.id}`}
                            src={pair.after}
                            alt=""
                            fill
                            className="object-cover"
                            sizes={IMAGE_SIZES}
                            quality={85}
                            priority
                            placeholder="blur"
                            blurDataURL={blur}
                          />
                        </div>
                        <div
                          className="pointer-events-none absolute inset-y-0 z-[10]"
                          style={{ left: `${split}%` }}
                        >
                          <div
                            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
                            style={{
                              background: "rgba(255,255,255,0.6)",
                            }}
                          />
                        </div>
                        <div
                          data-ba-handle="true"
                          className="pointer-events-auto absolute inset-y-0 z-[11] flex w-16 min-w-[64px] -translate-x-1/2 cursor-ew-resize items-center justify-center"
                          style={{ left: `${split}%` }}
                          onPointerDown={onPointerDownHandle}
                        >
                          <div
                            className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-white"
                            style={{
                              boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                              touchAction: "none",
                            }}
                          >
                            <span
                              className="select-none text-[12px] font-light leading-none"
                              style={{ color: "#999999" }}
                              aria-hidden
                            >
                              ‹ ›
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {mobileCrossfade ? (
                <>
                  <div
                    className="pointer-events-none absolute inset-y-0 z-[10]"
                    style={{ left: `${split}%` }}
                  >
                    <div
                      className="absolute inset-y-0 left-1/2 -translate-x-1/2"
                      style={{
                        width: 1,
                        background: "rgba(255,255,255,0.6)",
                      }}
                    />
                  </div>
                  <div
                    data-ba-handle="true"
                    className="pointer-events-auto absolute inset-y-0 z-[11] flex w-16 min-w-[64px] -translate-x-1/2 cursor-ew-resize items-center justify-center"
                    style={{ left: `${split}%` }}
                    onPointerDown={onPointerDownHandle}
                  >
                    <div
                      className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-white"
                      style={{
                        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                        touchAction: "none",
                      }}
                    >
                      <span
                        className="select-none text-[12px] font-light leading-none"
                        style={{ color: "#999999" }}
                        aria-hidden
                      >
                        ‹ ›
                      </span>
                    </div>
                  </div>
                </>
              ) : null}

              <p
                className="pointer-events-none absolute right-0 left-0 z-[12] text-center uppercase"
                style={{
                  bottom: 52,
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  color: "#ffffff",
                  textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                  opacity: titleOverlay.opacity,
                  transition:
                    titleOverlay.opacity === 1
                      ? `opacity ${TITLE_FADE_IN_MS}ms ease`
                      : `opacity ${TITLE_FADE_OUT_MS}ms ease`,
                }}
                key={titleOverlay.key}
              >
                {pair.label}
              </p>
              <div
                className="pointer-events-none absolute left-1/2 z-[12] flex -translate-x-1/2 gap-[6px]"
                style={{ bottom: 20 }}
              >
                {Array.from({ length: dotSpec.dots }, (_, i) => {
                  const globalIdx = dotSpec.offset + i;
                  const active = globalIdx === index;
                  return (
                    <span
                      key={`dot-${globalIdx}`}
                      className="block rounded-full bg-white"
                      style={{
                        width: active ? 16 : 5,
                        height: 5,
                        borderRadius: active ? 3 : "50%",
                        opacity: active ? 1 : 0.35,
                        transition: "width 200ms ease, opacity 200ms ease, border-radius 200ms ease",
                      }}
                      aria-hidden
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 max-h-[calc(100vh-60px-48px)] flex-1 flex-col items-center justify-center px-4 py-3">
          <div
            ref={viewerRef}
            className="group relative max-w-[960px] shrink-0 overflow-hidden bg-[#f9f9f9]"
            style={{ width: desktopBox.w, height: desktopBox.h }}
            onPointerDown={onPointerDownViewer}
          >
            <div className="absolute inset-0">
              <Image
                key={`before-${pair.id}`}
                src={pair.before}
                alt=""
                fill
                className="object-contain object-center"
                sizes={IMAGE_SIZES_DESKTOP}
                quality={85}
                priority
                placeholder="blur"
                blurDataURL={blur}
                onLoadingComplete={onBeforeLoadingComplete}
              />
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${rightInset}% 0 0)` }}>
                <Image
                  key={`after-${pair.id}`}
                  src={pair.after}
                  alt=""
                  fill
                  className="object-contain object-center"
                  sizes={IMAGE_SIZES_DESKTOP}
                  quality={85}
                  priority
                  placeholder="blur"
                  blurDataURL={blur}
                />
              </div>
            </div>
            {placeholderAfter ? (
              <div
                className="pointer-events-none absolute inset-0 z-[20] overflow-hidden bg-[#f9f9f9] transition-opacity duration-150 ease-out"
                style={{ opacity: overlayFadeOut ? 0 : 1 }}
                aria-hidden
              >
                <div
                  className="absolute inset-0"
                  style={{
                    filter: "blur(8px)",
                    transform: "scale(1.05)",
                    opacity: 0.4,
                  }}
                >
                  <Image
                    src={placeholderAfter}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes={IMAGE_SIZES_DESKTOP}
                    quality={60}
                  />
                </div>
              </div>
            ) : null}

            <div
              className="pointer-events-none absolute inset-y-0 z-[10]"
              style={{ left: `${split}%` }}
            >
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white" />
            </div>
            <div
              data-ba-handle="true"
              className="pointer-events-auto absolute inset-y-0 z-[11] flex w-12 min-w-[44px] -translate-x-1/2 cursor-ew-resize items-center justify-center md:min-w-[48px]"
              style={{ left: `${split}%` }}
              onPointerDown={onPointerDownHandle}
            >
              <div
                className="flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-full bg-white md:h-9 md:w-9"
                style={{
                  boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
                  touchAction: "none",
                }}
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

            {index > 0 ? (
              <button
                type="button"
                aria-label="Previous"
                className="pointer-events-auto absolute top-1/2 left-4 z-[15] flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[20px] leading-none font-light text-[#999999] opacity-0 shadow-[0_1px_8px_rgba(0,0,0,0.12)] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goDesktop(-1);
                }}
              >
                ‹
              </button>
            ) : null}
            {index < total - 1 ? (
              <button
                type="button"
                aria-label="Next"
                className="pointer-events-auto absolute top-1/2 right-4 z-[15] flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[20px] leading-none font-light text-[#999999] opacity-0 shadow-[0_1px_8px_rgba(0,0,0,0.12)] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goDesktop(1);
                }}
              >
                ›
              </button>
            ) : null}
          </div>
        </div>
      )}

      {isMobile ? (
        <div
          className="grid hidden shrink-0 grid-cols-1 gap-2 border-t border-[#e5e5e5] bg-white px-4 py-3 md:grid md:h-12 md:grid-cols-3 md:items-center md:py-0"
          style={{ borderTopWidth: "0.5px" }}
        >
          <p className="text-center text-[12px] font-normal tracking-[0.1em] text-[#999999] md:text-left">
            {pair.label}
          </p>
          <p className="text-center text-[12px] text-[#cccccc]">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <div className="flex items-center justify-center gap-0 md:justify-end">
            {index > 0 ? (
              <button
                type="button"
                className="cursor-pointer px-6 py-2 text-[18px] leading-none text-[#999999]"
                aria-label="Previous"
                onClick={() => go(-1)}
              >
                ←
              </button>
            ) : (
              <span className="inline-block w-[60px]" aria-hidden />
            )}
            {index < total - 1 ? (
              <button
                type="button"
                className="cursor-pointer px-6 py-2 text-[18px] leading-none text-[#999999]"
                aria-label="Next"
                onClick={() => go(1)}
              >
                →
              </button>
            ) : (
              <span className="inline-block w-[60px]" aria-hidden />
            )}
          </div>
        </div>
      ) : (
        <div
          className="w-full shrink-0 border-t border-[#e5e5e5] bg-white"
          style={{ borderTopWidth: "0.5px" }}
        >
          <div className="mx-auto grid h-12 max-w-[960px] grid-cols-3 items-center px-4">
            <span className="inline-block w-10 shrink-0" aria-hidden />
            <p className="min-w-0 truncate text-center text-[12px] font-normal tracking-[0.1em] text-[#999999]">
              {pair.label}
            </p>
            <p className="text-right text-[12px] text-[#cccccc]">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes retouchFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes retouchFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useLayoutEffect } from "react";

const BODY_PAD_OK = 8;
const FALLBACK_PX = 44;

/**
 * When `env(safe-area-inset-top)` is 0 in broken WebViews, set --ps-safe-top-fallback
 * for `.ps-menubar` (narrow): padding-top / height use max(env(...), var(...)).
 * If computed `body` padding-top from env is already meaningful, do nothing (avoids false
 * positives from an off-tree probe and prevents an extra 44px gap).
 */
export function SafeAreaTopProbe() {
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    const run = () => {
      const narrow = window.matchMedia("(max-width: 767px)").matches;
      const touchy =
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
        window.matchMedia("(pointer: coarse)").matches;
      if (!narrow || !touchy) {
        root.style.removeProperty("--ps-safe-top-fallback");
        return;
      }

      const measure = () => {
        const bodyPad = parseFloat(getComputedStyle(body).paddingTop) || 0;
        if (bodyPad >= BODY_PAD_OK) {
          root.style.removeProperty("--ps-safe-top-fallback");
          return;
        }

        const probe = document.createElement("div");
        probe.setAttribute("aria-hidden", "true");
        probe.style.cssText =
          "position:absolute;left:-9999px;top:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px);";
        body.appendChild(probe);
        const pt = parseFloat(getComputedStyle(probe).paddingTop) || 0;
        body.removeChild(probe);

        if (pt > 0) {
          root.style.removeProperty("--ps-safe-top-fallback");
          return;
        }

        root.style.setProperty("--ps-safe-top-fallback", `${FALLBACK_PX}px`);
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(measure);
      });
    };

    run();
    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", run);
    return () => {
      mq.removeEventListener("change", run);
      root.style.removeProperty("--ps-safe-top-fallback");
    };
  }, []);

  return null;
}

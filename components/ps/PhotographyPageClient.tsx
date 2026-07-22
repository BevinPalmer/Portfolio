"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useState } from "react";
import { usePSWorkspace } from "@/components/ps/PSWorkspaceContext";
import type { ScannedPhoto } from "@/lib/getImages";
import { solidBlurDataURL } from "@/lib/blurDataUrl";

const IMG_SIZES = "(max-width: 768px) 100vw, calc(100vw - 220px)";
const blur = solidBlurDataURL("#191918");
const MOBILE_MQ = "(max-width: 767px)";

function filenameFromSrc(src: string) {
  const seg = src.split("/").pop() ?? "";
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

function useNarrowMobile() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_MQ);
    const go = () => setNarrow(mq.matches);
    go();
    mq.addEventListener("change", go);
    return () => mq.removeEventListener("change", go);
  }, []);
  return narrow;
}

export function PhotographyPageClient({ images }: { images: ScannedPhoto[] }) {
  const { setPhotoPanelInfo } = usePSWorkspace();
  const [open, setOpen] = useState<ScannedPhoto | null>(null);
  const narrow = useNarrowMobile();

  const syncPanel = useCallback(
    (img: ScannedPhoto) => {
      setPhotoPanelInfo({
        src: img.src,
        filename: filenameFromSrc(img.src),
        width: img.width,
        height: img.height,
      });
    },
    [setPhotoPanelInfo],
  );

  useEffect(() => {
    const first = images[0];
    if (!first) {
      setPhotoPanelInfo(null);
      return;
    }
    syncPanel(first);
    return () => setPhotoPanelInfo(null);
  }, [images, setPhotoPanelInfo, syncPanel]);

  const openDialog = (img: ScannedPhoto) => {
    if (narrow) return;
    setOpen(img);
    syncPanel(img);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(null);

  const dialog =
    open && !narrow && typeof document !== "undefined"
      ? createPortal(
          <div
            className="ps-dialog-overlay"
            onClick={close}
            role="presentation"
          >
            <div
              className="ps-dialog-box"
              role="dialog"
              aria-modal="true"
              aria-label={filenameFromSrc(open.src)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ps-dialog-titlebar">
                <span>
                  {filenameFromSrc(open.src)} @ 100% (RGB/8)
                </span>
                <button type="button" className="ps-dialog-close" onClick={close} aria-label="Close">
                  ×
                </button>
              </div>
              <div className="ps-dialog-body">
                <Image
                  src={open.src}
                  alt={open.alt}
                  width={open.width}
                  height={open.height}
                  quality={88}
                  className="max-h-[calc(90vh-24px)] max-w-full object-contain"
                  sizes="90vw"
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={`ps-photo-stack${narrow ? " ps-photo-stack--mobile" : ""}`}>
        {images.map((img) =>
          narrow ? (
            <div key={img.src} className="ps-photo-mobile-row">
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="block h-auto w-full"
                sizes={IMG_SIZES}
                quality={88}
                placeholder="blur"
                blurDataURL={blur}
              />
            </div>
          ) : (
            <button key={img.src} type="button" onClick={() => openDialog(img)}>
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="h-auto w-full"
                sizes={IMG_SIZES}
                quality={88}
                placeholder="blur"
                blurDataURL={blur}
              />
            </button>
          ),
        )}
      </div>
      {dialog}
    </>
  );
}

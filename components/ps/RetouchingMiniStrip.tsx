"use client";

import Image from "next/image";
import { usePSWorkspace } from "@/components/ps/PSWorkspaceContext";

const THUMB_SIZES = "44px";

export function RetouchingMiniStrip() {
  const { retouchingPairs, retouchingIndex, selectRetouchingPair } = usePSWorkspace();
  const current = retouchingPairs[retouchingIndex];

  if (retouchingPairs.length === 0) return null;

  const n = retouchingIndex + 1;
  const t = retouchingPairs.length;

  return (
    <div className="ps-retouch-mini-strip">
      <div className="ps-retouch-mini-row">
        {retouchingPairs.map((pair, i) => (
          <button
            key={pair.id}
            type="button"
            className={`ps-retouch-mini-thumb ${i === retouchingIndex ? "ps-retouch-mini-thumb-active" : ""}`}
            onClick={() => selectRetouchingPair(i)}
            aria-label={`Show ${pair.label}`}
          >
            <Image
              src={pair.after}
              alt=""
              width={44}
              height={34}
              className="h-full w-full object-cover"
              sizes={THUMB_SIZES}
              quality={88}
            />
          </button>
        ))}
      </div>
      {current ? (
        <p className="ps-retouch-mini-line" aria-live="polite">
          {current.label}
          <span className="ps-retouch-mini-line-sep" aria-hidden>
            {" "}
            ·{" "}
          </span>
          {String(n).padStart(2, "0")} / {String(t).padStart(2, "0")}
        </p>
      ) : null}
    </div>
  );
}

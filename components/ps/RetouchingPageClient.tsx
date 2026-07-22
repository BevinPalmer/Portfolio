"use client";

import { useEffect } from "react";
import { RetouchingMiniStrip } from "@/components/ps/RetouchingMiniStrip";
import { RetouchingSlider } from "@/components/ps/RetouchingSlider";
import { usePSWorkspace, type RetouchingPairItem } from "@/components/ps/PSWorkspaceContext";

type Props = {
  pairs: RetouchingPairItem[];
};

export function RetouchingPageClient({ pairs }: Props) {
  const {
    setCanvasFlush,
    setCanvasUnderMount,
    setRetouchingPairs,
    retouchingPairs,
    retouchingIndex,
    splitPercent,
    setSplitPercent,
    selectRetouchingPair,
  } = usePSWorkspace();

  useEffect(() => {
    setCanvasFlush(true);
    setRetouchingPairs(pairs);
    setCanvasUnderMount(<RetouchingMiniStrip />);
    selectRetouchingPair(0);
    return () => {
      setCanvasFlush(false);
      setRetouchingPairs([]);
      setCanvasUnderMount(null);
    };
  }, [pairs, selectRetouchingPair, setCanvasFlush, setCanvasUnderMount, setRetouchingPairs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const len = retouchingPairs.length > 0 ? retouchingPairs.length : pairs.length;
      if (len === 0) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        selectRetouchingPair(Math.max(0, retouchingIndex - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        selectRetouchingPair(Math.min(len - 1, retouchingIndex + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pairs.length, retouchingIndex, retouchingPairs.length, selectRetouchingPair]);

  const list = retouchingPairs.length > 0 ? retouchingPairs : pairs;
  const pair = list[retouchingIndex] ?? list[0];
  const total = list.length;
  const n = total > 0 ? retouchingIndex + 1 : 0;

  if (!pair) {
    return null;
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <RetouchingSlider
        key={pair.id}
        beforeSrc={pair.before}
        afterSrc={pair.after}
        width={pair.width}
        height={pair.height}
        splitPercent={splitPercent}
        onSplitChange={setSplitPercent}
        currentPairIndex={retouchingIndex}
      />
      <div className="shrink-0 ps-retouch-info-strip">
        <span className="ps-retouch-info-left">{pair.label}</span>
        <span className="ps-retouch-info-center">[{Math.round(splitPercent)}%]</span>
        <span className="ps-retouch-info-right">
          {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

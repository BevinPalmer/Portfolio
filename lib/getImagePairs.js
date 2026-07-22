import { retouchingFeatured, retouchingOrder } from "@/lib/curation";
import { getRetouchingMetaForPair } from "@/lib/retouchingMeta";
import { retouchingPairsManifest } from "@/lib/generated/retouchingPairs";

export async function getImagePairs() {
  let pairs = retouchingPairsManifest
    .map((p) => {
      const { title, description } = getRetouchingMetaForPair(p.id);
      return {
        id: p.id,
        before: p.before,
        after: p.after,
        width: p.width,
        height: p.height,
        label: title,
        description,
      };
    })
    .sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { sensitivity: "base" }),
    );

  if (Array.isArray(retouchingFeatured) && retouchingFeatured.length > 0) {
    const featuredSet = new Set(retouchingFeatured.map((x) => String(x).toLowerCase()));
    pairs = pairs.filter((p) => featuredSet.has(String(p.id).toLowerCase()));
  }

  if (Array.isArray(retouchingOrder) && retouchingOrder.length > 0) {
    const orderIndex = new Map(
      retouchingOrder.map((id, idx) => [String(id).toLowerCase(), idx]),
    );
    pairs = pairs.sort((a, b) => {
      const aIdx = orderIndex.get(String(a.id).toLowerCase());
      const bIdx = orderIndex.get(String(b.id).toLowerCase());
      const aHas = typeof aIdx === "number";
      const bHas = typeof bIdx === "number";
      if (aHas && bHas) return aIdx - bIdx;
      if (aHas) return -1;
      if (bHas) return 1;
      return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
    });
  }

  return pairs;
}

export default getImagePairs;


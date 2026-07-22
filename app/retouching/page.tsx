import getImagePairs from "@/lib/getImagePairs";
import { RetouchingPageClient } from "@/components/ps/RetouchingPageClient";

export default async function RetouchingPage() {
  const pairs = await getImagePairs();

  return (
    <RetouchingPageClient
      pairs={pairs.map((p) => ({
        id: p.id,
        before: p.before,
        after: p.after,
        width: p.width,
        height: p.height,
        label: p.label,
      }))}
    />
  );
}

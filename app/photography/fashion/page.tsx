import type { Metadata } from "next";
import Image from "next/image";
import { getPhotography } from "@/lib/getPhotography";
import { solidBlurDataURL } from "@/lib/blurDataUrl";

export const metadata: Metadata = {
  title: "Photography",
};

export default async function PhotographyFashionPage() {
  const list = await getPhotography("fashion");
  const images = list.filter(
    (img) => typeof img.width === "number" && typeof img.height === "number",
  );
  const blur = solidBlurDataURL("#ffffff");

  return (
    <div className="bg-background py-12 md:py-20">
      <div className="mx-auto w-full max-w-[1200px] md:px-10">
        <div className="flex flex-col gap-4 md:gap-8">
          {images.map((img, i) => (
            <div key={`${img.src}-${i}`} className="w-full">
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="h-auto w-full"
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={88}
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                placeholder="blur"
                blurDataURL={blur}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

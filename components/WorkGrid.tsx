"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type WorkImage = {
  src: string;
  title: string;
};

export function WorkGrid({ images }: { images: WorkImage[] }) {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  const order = useMemo(() => images.map((i) => i.src), [images]);

  return (
    <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
      {images.map((item) => {
        const isLoaded = !!loaded[item.src];
        const isPriority = order[0] === item.src;

        return (
          <article key={item.src} className="group">
            <div className="relative overflow-hidden rounded-[2px] border border-border bg-white/20">
              <div className="relative aspect-[4/5]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={[
                    "object-cover transition duration-700 ease-out will-change-transform",
                    "group-hover:scale-[1.03] group-hover:saturate-110",
                    isLoaded ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  onLoadingComplete={() =>
                    setLoaded((prev) => ({ ...prev, [item.src]: true }))
                  }
                  priority={isPriority}
                />
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="font-serif text-lg leading-tight text-white">
                    {item.title}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}


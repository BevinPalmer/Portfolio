"use client";

import Image from "next/image";

export type WorkImage = {
  src: string;
  title: string;
};

export function WorkGridClient({ images }: { images: WorkImage[] }) {
  const placeholders = Array.from({ length: 6 }).map((_, idx) => ({
    key: `placeholder-${idx}`,
  }));

  return (
    <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
      {images.length === 0
        ? placeholders.map((p) => (
            <article key={p.key} className="group">
              <div className="relative overflow-hidden border border-border bg-black/[0.06]">
                <div className="relative aspect-[4/5]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl font-light text-foreground/35">
                      +
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        : images.map((item) => {
            return (
              <article key={item.src} className="group">
                <div className="relative overflow-hidden border border-border bg-foreground/5">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className={[
                        "object-cover",
                        "transition-opacity duration-200 ease-out",
                        "group-hover:opacity-90",
                      ].join(" ")}
                      quality={88}
                    />
                  </div>
                </div>
              </article>
            );
          })}
    </section>
  );
}


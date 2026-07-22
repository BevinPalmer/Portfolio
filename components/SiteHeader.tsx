"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/photography", label: "Photography" },
  { href: "/retouching", label: "Retouching" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function navActive(pathname: string, href: string) {
  if (href === "/photography") {
    return pathname === "/photography" || pathname.startsWith("/photography/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 h-[60px] min-h-[60px]"
        style={{
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          backgroundColor: "rgba(248, 246, 242, 0.95)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className="text-[18px] font-light tracking-[0.04em] text-[#111111]"
          >
            Bevin Palmer
          </Link>

          <nav className="hidden items-center font-sans md:flex">
            {NAV.map((item, i) => {
              const active = navActive(pathname, item.href);
              return (
                <Fragment key={item.href}>
                  {i > 0 ? (
                    <span
                      className="mx-5 select-none text-[11px] font-normal text-[#cccccc]"
                      aria-hidden
                    >
                      ·
                    </span>
                  ) : null}
                  <Link
                    href={item.href}
                    className={[
                      "text-[11px] font-normal uppercase tracking-[0.18em]",
                      active ? "text-[#111111]" : "text-[#999999]",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </Fragment>
              );
            })}
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <span className="flex w-[18px] flex-col justify-center gap-[5px]">
              <span className="h-px w-[18px] bg-[#111111]" />
              <span className="h-px w-[18px] bg-[#111111]" />
              <span className="h-px w-[18px] bg-[#111111]" />
            </span>
          </button>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[60] bg-[#1a1a1a] md:hidden",
          "transition-opacity duration-200 ease-out",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          <div className="flex justify-end px-6 pt-[calc(env(safe-area-inset-top)+16px)]">
            <button
              type="button"
              className="h-12 w-12 text-[28px] font-light leading-none text-white"
              onClick={close}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-2 px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 text-center text-[36px] font-light tracking-[-0.02em] text-white"
                onClick={close}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

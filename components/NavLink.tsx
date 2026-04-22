"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

export function NavLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "text-[13px] tracking-[0.18em] uppercase transition-colors",
        isActive ? "text-foreground" : "text-muted hover:text-foreground",
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}


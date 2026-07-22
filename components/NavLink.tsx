"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

export function NavLink({
  href,
  children,
  /** When true, "Work" is active on home, /photography, and /retouching. */
  workGroup,
}: PropsWithChildren<{ href: string; workGroup?: boolean }>) {
  const pathname = usePathname();

  const isActive = workGroup
    ? pathname === "/" ||
      pathname.startsWith("/photography") ||
      pathname.startsWith("/retouching")
    : pathname === href ||
      (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={[
        "text-[13px] font-normal leading-none tracking-[-0.01em] transition-colors",
        isActive ? "text-foreground" : "text-muted hover:text-foreground",
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PSPanels } from "@/components/ps/PSPanels";
import { usePSWorkspace } from "@/components/ps/PSWorkspaceContext";
import { CONTACT_EMAIL } from "@/lib/site-config";

function tabLabel(
  pathname: string,
  narrow: boolean,
  override?: { docTab?: string | null; docTabNarrow?: string | null },
): string {
  if (narrow && override?.docTabNarrow) return override.docTabNarrow;
  if (!narrow && override?.docTab) return override.docTab;
  if (narrow) {
    if (pathname === "/") return "Home";
    if (pathname === "/photography") return "Photography";
    if (pathname === "/campaigns" || pathname.startsWith("/campaigns/")) return "Campaigns";
    if (pathname === "/retouching") return "Retouching";
    if (pathname === "/about") return "About";
    if (pathname === "/contact") return "Contact";
    return "Bevin Palmer";
  }
  if (pathname === "/") return "Home @ 100%";
  if (pathname === "/photography") return "Photography.psd @ 100%";
  if (pathname === "/campaigns") return "Campaigns.psd @ 100%";
  if (pathname === "/retouching") return "Retouching.psd @ 100%";
  if (pathname === "/about") return "About.txt";
  if (pathname === "/contact") return "Contact.txt";
  return "bevinpalmer.com";
}

/** Mobile menubar center label only (hidden on home). */
function mobileRouteLabel(pathname: string): string {
  if (pathname === "/" || pathname === "") return "";
  if (pathname.startsWith("/campaigns")) return "Campaigns";
  if (pathname.startsWith("/photography")) return "Photography";
  if (pathname.startsWith("/retouching")) return "Retouching";
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/contact")) return "Contact";
  return "";
}

function statusLeft(
  pathname: string,
  opts: { pairIndex: number; pairTotal: number; split: number },
  override?: string | null,
): string {
  if (override) return override;
  if (pathname === "/") return "Photographer  ·  Retoucher  ·  Los Angeles";
  if (pathname === "/photography") return "Gallery  ·  RGB/8  ·  Click to open";
  if (pathname === "/retouching") {
    const n = opts.pairTotal > 0 ? opts.pairIndex + 1 : 0;
    const t = opts.pairTotal;
    return `Pair ${n} of ${t}  ·  ${Math.round(opts.split)}%  ·  Drag handle`;
  }
  if (pathname === "/about") return "Bevin Palmer  ·  Available for work";
  if (pathname === "/contact") return `${CONTACT_EMAIL}  ·  Response within 24h`;
  return "";
}

/** Mobile status — short left line only (no location / no duplicate brand). */
function statusLeftMobile(
  pathname: string,
  opts: { pairIndex: number; pairTotal: number; split: number },
  override?: string | null,
): string {
  if (override) return override;
  if (pathname === "/") return "Photographer · Retoucher";
  if (pathname === "/photography") return "Gallery · RGB/8";
  if (pathname === "/retouching") {
    const n = opts.pairTotal > 0 ? opts.pairIndex + 1 : 0;
    const t = opts.pairTotal;
    return `Pair ${n}/${t} · ${Math.round(opts.split)}%`;
  }
  if (pathname === "/about") return "Available for work";
  if (pathname === "/contact") return "Contact";
  return "";
}

const STATUS_RIGHT = `Bevin Palmer  ·  Los Angeles  ·  ${CONTACT_EMAIL}`;

export function PSAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [narrowDocTab, setNarrowDocTab] = useState(false);
  const {
    canvasFlush,
    canvasUnderMount,
    retouchingIndex,
    splitPercent,
    retouchingPairs,
    workspaceChrome,
  } = usePSWorkspace();

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setNarrowDocTab(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMobileNavOpen(false);
    });
  }, [pathname]);

  const mountKey = workspaceChrome.mountKey ?? null;
  const homeFlush = pathname === "/" ? " ps-canvas-mount--home" : "";
  const homeSurface = pathname === "/" ? " ps-canvas-surface--home" : "";
  const aboutMount = pathname === "/about" ? " ps-canvas-mount--about" : "";
  const aboutSurface = pathname === "/about" ? " ps-canvas-surface--about" : "";
  const photographyMount = pathname === "/photography" ? " ps-canvas-mount--photography" : "";
  const photographySurface = pathname === "/photography" ? " ps-canvas-surface--photography" : "";
  const retouchingMount = pathname === "/retouching" ? " ps-canvas-mount--retouching" : "";
  const retouchingSurface = pathname === "/retouching" ? " ps-canvas-surface--retouching" : "";
  const campaignsMount = mountKey === "campaigns" ? " ps-canvas-mount--campaigns" : "";
  const campaignsSurface = mountKey === "campaigns" ? " ps-canvas-surface--campaigns" : "";
  const mountClass = `ps-canvas-mount${canvasFlush ? " ps-canvas-mount-flush" : ""}${homeFlush}${aboutMount}${photographyMount}${retouchingMount}${campaignsMount}`;
  const surfaceClass = `ps-canvas-surface${canvasFlush ? " ps-canvas-surface-flush" : ""}${homeSurface}${aboutSurface}${photographySurface}${retouchingSurface}${campaignsSurface}`;

  const canvasAreaClass = [
    "ps-canvas-area",
    pathname === "/" ? "ps-canvas-area--home" : "",
    pathname === "/about" ? "ps-canvas-area--about" : "",
    pathname === "/retouching" ? "ps-canvas-area--retouch-mobile" : "",
    pathname === "/retouching" ? "ps-canvas-area--retouching" : "",
    pathname === "/photography" ? "ps-canvas-area--photography" : "",
    mountKey === "campaigns" ? "ps-canvas-area--campaigns" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const navLink = (href: string, label: string) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link href={href} className={active ? "ps-nav-active" : undefined} onClick={closeMobileNav}>
        {label}
      </Link>
    );
  };

  return (
    <div className="ps-body">
      <header className="ps-menubar">
          <Link href="/" className="ps-brand" onClick={closeMobileNav}>
            BEVIN PALMER
          </Link>
          <span className="ps-menubar-route">{mobileRouteLabel(pathname)}</span>
          <nav className="ps-nav" aria-label="Primary">
            {navLink("/photography", "Photography")}
            {navLink("/campaigns", "Campaigns")}
            {navLink("/retouching", "Retouching")}
            {navLink("/about", "About")}
            {navLink("/contact", "Contact")}
          </nav>
          <button
            type="button"
            className={[
              "ps-menubar-toggle",
              mobileNavOpen ? "ps-menubar-toggle-open" : "",
            ].join(" ")}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            {mobileNavOpen ? (
              "×"
            ) : (
              <>
                <span className="ps-menubar-toggle-icon" aria-hidden>
                  ≡
                </span>
                <span className="ps-menubar-toggle-label">Menu</span>
              </>
            )}
          </button>
        </header>

        <div className="ps-workspace-body">
          <main className={canvasAreaClass}>
            <div className="ps-doc-tabs">
              <div className="ps-tab ps-tab-active">
                <span>
                  {tabLabel(pathname, narrowDocTab, {
                    docTab: workspaceChrome.docTab,
                    docTabNarrow: workspaceChrome.docTabNarrow,
                  })}
                </span>
                <span className="ps-tab-close" aria-hidden>
                  ×
                </span>
              </div>
            </div>
            <div className="ps-ruler-h" aria-hidden />
            <div className={mountClass}>
              <div className={surfaceClass}>{children}</div>
              <div className="ps-canvas-checker" aria-hidden />
            </div>
            {canvasUnderMount}
            <div className="ps-canvas-zoom">100%</div>
          </main>
          <PSPanels />
        </div>

        <footer className="ps-statusbar">
          {narrowDocTab ? (
            <>
              <span className="ps-status-left ps-status-narrow">
                {statusLeftMobile(
                  pathname,
                  {
                    pairIndex: retouchingIndex,
                    pairTotal: retouchingPairs.length,
                    split: splitPercent,
                  },
                  workspaceChrome.statusLeftMobile,
                )}
              </span>
              <span className="ps-status-right ps-status-narrow">{CONTACT_EMAIL}</span>
            </>
          ) : (
            <>
              <span className="ps-status-left">
                {statusLeft(
                  pathname,
                  {
                    pairIndex: retouchingIndex,
                    pairTotal: retouchingPairs.length,
                    split: splitPercent,
                  },
                  workspaceChrome.statusLeft,
                )}
              </span>
              <span className="ps-status-right">{STATUS_RIGHT}</span>
            </>
          )}
        </footer>

      <div
        className={`ps-mobile-overlay${mobileNavOpen ? " ps-mobile-overlay-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMobileNav();
        }}
      >
        <button
          type="button"
          className="ps-mobile-overlay-close"
          aria-label="Close menu"
          onClick={closeMobileNav}
        >
          ×
        </button>
        <nav className="ps-mobile-overlay-nav" aria-label="Primary">
          <Link href="/photography" className="ps-mobile-overlay-link" onClick={closeMobileNav}>
            Photography
          </Link>
          <Link href="/campaigns" className="ps-mobile-overlay-link" onClick={closeMobileNav}>
            Campaigns
          </Link>
          <Link href="/retouching" className="ps-mobile-overlay-link" onClick={closeMobileNav}>
            Retouching
          </Link>
          <Link href="/about" className="ps-mobile-overlay-link" onClick={closeMobileNav}>
            About
          </Link>
          <Link href="/contact" className="ps-mobile-overlay-link" onClick={closeMobileNav}>
            Contact
          </Link>
        </nav>
        <p className="ps-mobile-overlay-email">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </div>
  );
}

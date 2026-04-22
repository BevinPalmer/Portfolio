import Link from "next/link";
import { Container } from "@/components/Container";
import { NavLink } from "@/components/NavLink";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <Container className="py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="font-serif text-2xl leading-none tracking-[0.06em]"
            >
              Avery Sinclair
            </Link>
            <p className="text-[12px] tracking-[0.2em] uppercase text-muted">
              Fashion / Commercial Photographer
            </p>
          </div>
          <nav className="flex items-center gap-6">
            <NavLink href="/">Work</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/retouching">Retouching</NavLink>
          </nav>
        </div>
      </Container>
    </header>
  );
}


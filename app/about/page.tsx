import type { Metadata } from "next";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Bio and contact.",
};

export default function AboutPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-12">
        <header className="lg:col-span-5">
          <h1 className="font-serif text-3xl tracking-[0.04em] sm:text-4xl">
            About
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Fashion &amp; commercial photography, with a focus on clean lighting,
            modern styling, and detail-forward retouch.
          </p>
        </header>

        <section className="lg:col-span-7">
          <div className="max-w-2xl space-y-5 text-[15px] leading-7">
            <p>
              Avery Sinclair is a fashion and commercial photographer working
              between studio and location. The work balances minimal composition
              with tactile detail—skin, fabric, product texture—so the image
              feels quiet, intentional, and editorial.
            </p>
            <p>
              Available for campaigns, lookbooks, e-commerce, and brand
              storytelling. For rates, bookings, or availability, email below.
            </p>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <div className="text-[11px] tracking-[0.22em] uppercase text-muted">
              Contact
            </div>
            <a
              href="mailto:hello@averysinclair.com"
              className="mt-2 inline-block font-serif text-xl tracking-[0.02em] underline decoration-border underline-offset-4 transition hover:decoration-foreground"
            >
              hello@averysinclair.com
            </a>
          </div>
        </section>
      </div>
    </Container>
  );
}


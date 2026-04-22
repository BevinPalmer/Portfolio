import type { Metadata } from "next";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Retouching",
  description: "Retouching services for fashion and commercial imagery.",
};

export default function RetouchingPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-12">
        <header className="lg:col-span-5">
          <h1 className="font-serif text-3xl tracking-[0.04em] sm:text-4xl">
            Retouching
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Natural, texture-preserving finishing—built for brand consistency
            and fast turnarounds.
          </p>
        </header>

        <section className="lg:col-span-7">
          <div className="max-w-2xl space-y-5 text-[15px] leading-7">
            <p>
              Retouching is available as part of photography projects or as a
              standalone service. The approach keeps skin and materials real
              while refining tone, color, and polish for a clean final image.
            </p>
          </div>

          <div className="mt-10 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <div className="text-[11px] tracking-[0.22em] uppercase text-muted">
                Services
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                <li>Color correction + consistent look</li>
                <li>Skin cleanup (texture-safe)</li>
                <li>Product cleanup + dust/scratch removal</li>
                <li>Background extensions + comps</li>
              </ul>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.22em] uppercase text-muted">
                Delivery
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                <li>Layered PSD on request</li>
                <li>Web + print exports</li>
                <li>Batch workflows for e-comm</li>
                <li>
                  Contact:{" "}
                  <a
                    href="mailto:hello@averysinclair.com"
                    className="underline decoration-border underline-offset-4 transition hover:decoration-foreground"
                  >
                    hello@averysinclair.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}


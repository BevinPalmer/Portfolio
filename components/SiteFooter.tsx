import { LINKEDIN_URL } from "@/lib/linkedin";
import { CONTACT_EMAIL } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer
      className="bg-background"
      style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-6 text-center text-[12px] leading-relaxed text-[#999999] sm:px-10 md:py-8">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>© 2026 Bevin Palmer</span>
          <span className="select-none" aria-hidden>
            ·
          </span>
          <span>Los Angeles</span>
          <span className="select-none" aria-hidden>
            ·
          </span>
          <a
            href="https://instagram.com/bevinpalmer"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-[#111111]"
          >
            Instagram
          </a>
          <span className="select-none" aria-hidden>
            ·
          </span>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-[#111111]"
          >
            LinkedIn
          </a>
          <span className="select-none" aria-hidden>
            ·
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="transition hover:text-[#111111]"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}

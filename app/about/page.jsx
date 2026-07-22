import Link from "next/link";
import { LINKEDIN_URL } from "@/lib/linkedin";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="ps-about-inner">
      <h1 className="ps-about-name">Bevin Palmer</h1>

      <p className="ps-about-p">
        Photographer and retoucher based in Los Angeles. Working across fashion,
        beauty, and commercial campaigns.
      </p>
      <p className="ps-about-p">
        Post-production work includes e-commerce retouching, skin and texture
        finishing, compositing, and color work for brands and creative teams.
      </p>
      <p className="ps-about-p">
        Available for campaign, editorial, and on-set retouching work.
      </p>

      <a href={`mailto:${CONTACT_EMAIL}`} className="ps-about-mail">
        {CONTACT_EMAIL}
      </a>

      <Link
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="ps-about-resume"
      >
        Resume →
      </Link>

      <a
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ps-about-resume"
      >
        LinkedIn →
      </a>
    </div>
  );
}

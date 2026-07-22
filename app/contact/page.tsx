import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="ps-contact-canvas">
      <a href="mailto:hello@bevinpalmer.com" className="ps-contact-email">
        hello@bevinpalmer.com
      </a>
      <p className="ps-contact-sub">
        Available for retouching and post-production work.
      </p>
    </div>
  );
}

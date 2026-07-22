import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="ps-contact-canvas">
      <a href={`mailto:${CONTACT_EMAIL}`} className="ps-contact-email">
        {CONTACT_EMAIL}
      </a>
      <p className="ps-contact-sub">
        Available for retouching and post-production work.
      </p>
    </div>
  );
}

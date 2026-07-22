import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { PSAppShell } from "@/components/ps/PSAppShell";
import { SafeAreaTopProbe } from "@/components/ps/SafeAreaTopProbe";
import { PSWorkspaceProvider } from "@/components/ps/PSWorkspaceContext";

/** Adobe Fonts kit URL — include Twentieth Century (menubar brand) + Helvetica Now Text 300/400/500. */
const ADOBE_FONTS_HREF = process.env.NEXT_PUBLIC_ADOBE_FONTS_CSS;

/** Placeholder for brand until Adobe loads twentieth-century (weight 800). */
const urbanist = Urbanist({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Bevin Palmer",
    template: "%s · Bevin Palmer",
  },
  description: "Photography and retouching portfolio.",
  metadataBase: new URL("https://bevinpalmer.com"),
  openGraph: {
    title: "Bevin Palmer",
    description: "Photography and retouching portfolio.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bevin Palmer",
    description: "Photography and retouching portfolio.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${urbanist.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {ADOBE_FONTS_HREF ? (
          <link rel="stylesheet" href={ADOBE_FONTS_HREF} />
        ) : null}
      </head>
      <body className="m-0 flex min-h-0 h-full flex-col overflow-hidden bg-[var(--ps-frame)] antialiased">
        <SafeAreaTopProbe />
        <PSWorkspaceProvider>
          <PSAppShell>{children}</PSAppShell>
        </PSWorkspaceProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { ScrollIndicator } from "@/components/layout/scroll-indicator";
import { ScrollVideoCanvas } from "@/components/canvas/scroll-video-canvas";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Technische Display-Schrift für Überschriften und Wortmarke. */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} – ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Webagentur Industrie",
    "Website Maschinenbau",
    "Webdesign Stahlbau",
    "Metallbau Webseite",
    "B2B Webagentur",
    "Produktkonfigurator",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#02060f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">
        {/* Scroll-Hintergrund: liegt fixiert hinter dem gesamten Seiteninhalt. */}
        <ScrollVideoCanvas />

        <SmoothScrollProvider>
          <a
            href="#inhalt"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-signal focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-abyss"
          >
            Zum Inhalt springen
          </a>

          <ScrollIndicator />
          <Navbar />
          <main id="inhalt">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

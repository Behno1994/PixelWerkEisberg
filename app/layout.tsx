import type { Metadata, Viewport } from "next";
import { Pixelify_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { ScrollIndicator } from "@/components/layout/scroll-indicator";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

/**
 * Pixelschrift – ausschliesslich für die Wortmarke „PIXEL WERK".
 *
 * Fliesstext und Überschriften laufen bewusst über die Systemschrift
 * (siehe `--font-sans` in `globals.css`): Das ist die saubere, schweizerisch
 * anmutende Basis, gegen die sich die Pixel-Wortmarke absetzt – und es spart
 * einen Fontdownload im kritischen Pfad.
 */
const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Pixel Werk | Modernes Webdesign für die Industrie",
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
  themeColor: "#0a0f1d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={pixelify.variable}>
      <body className="min-h-screen antialiased">
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

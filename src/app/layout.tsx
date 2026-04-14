import type { Metadata } from "next";
import { Playfair_Display, Mulish } from "next/font/google";
import "./globals.css";
import ClientBranding from "./components/ClientBranding";
import { CurrencyProvider } from "./context/CurrencyContext";
import LiveChatWrapper from "./components/LiveChatWrapper";
import UtilityPopup from "./components/UtilityPopup";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

import { getSiteData } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSiteData();
  const seo = data?.content?.seo_metadata || {};

  const siteTitle = seo.title || "Parkside Villa Kitui | Best Hotel & Conference in Kitui";
  const siteDescription = seo.description || "Experience world-class hospitality at Parkside Villa Kitui. Luxury rooms, fine dining, and premier conference facilities designed for comfort and productivity in Kitui, Kenya.";
  const siteKeywords = seo.keywords ? seo.keywords.split(',').map((k: string) => k.trim()) : ["Kitui hotel", "Parkside Villa Kitui", "accommodation in Kitui", "conference facilities Kitui", "best hotel Kitui", "luxury hotel Kitui, Kenya", "places to stay in Kitui"];

  return {
    metadataBase: new URL('https://www.parksidevillakitui.com'),
    title: siteTitle,
    description: siteDescription,
    keywords: siteKeywords,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: "https://www.parksidevillakitui.com",
      siteName: "Parkside Villa Kitui",
      locale: "en_KE",
      type: "website",
      images: [
        {
          url: "https://www.parksidevillakitui.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Parkside Villa Kitui - Best Hotel & Conference in Kitui",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Parkside Villa Kitui",
      description: siteDescription,
      images: ["https://www.parksidevillakitui.com/og-image.jpg"],
    },
    alternates: {
      canonical: "https://www.parksidevillakitui.com",
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    }
  };
}

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import GoogleTranslateScript from "./components/GoogleTranslateScript";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${mulish.variable}`} suppressHydrationWarning>
        <CurrencyProvider>
          <GoogleTranslateScript />
          <ClientBranding>
            {children}
            <UtilityPopup />
          </ClientBranding>
          <LiveChatWrapper />
        </CurrencyProvider>
      </body>
    </html>
  );
}

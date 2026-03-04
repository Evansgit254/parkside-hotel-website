import type { Metadata } from "next";
import { Playfair_Display, Mulish } from "next/font/google";
import "./globals.css";
import ClientBranding from "./components/ClientBranding";
import { CurrencyProvider } from "./context/CurrencyContext";
import LiveChatWrapper from "./components/LiveChatWrapper";
import UtilityPopup from "./components/UtilityPopup";
import Script from "next/script";

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
    },
    twitter: {
      card: "summary_large_image",
      title: "Parkside Villa Kitui",
      description: siteDescription,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${mulish.variable}`} suppressHydrationWarning>
        <CurrencyProvider>
          <ClientBranding>
            {children}
            <UtilityPopup />
          </ClientBranding>
          <LiveChatWrapper />
        </CurrencyProvider>

        {/* Global Google Translate Scripts */}
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-config" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              if (typeof google !== 'undefined' && google.translate) {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element');
                
                // Also initialize the admin one if it exists
                if (document.getElementById('google_translate_admin')) {
                  new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                  }, 'google_translate_admin');
                }
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
}

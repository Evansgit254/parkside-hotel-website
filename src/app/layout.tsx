import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientBranding from "./components/ClientBranding";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parkside Villa Kitui | Best Hotel & Conference in Kitui",
  description: "Experience world-class hospitality at Parkside Villa Kitui. Luxury rooms, fine dining, and premier conference facilities designed for comfort and productivity in Kitui, Kenya.",
  keywords: ["Kitui hotel", "Parkside Villa Kitui", "accommodation in Kitui", "conference facilities Kitui", "best hotel Kitui", "luxury hotel Kitui, Kenya", "places to stay in Kitui"],
  openGraph: {
    title: "Parkside Villa Kitui | Luxury Accommodation & Dining",
    description: "Kitui's premier destination for luxury accommodation, dining, and corporate events.",
    url: "https://www.parksidevillakitui.com",
    siteName: "Parkside Villa Kitui",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parkside Villa Kitui",
    description: "Kitui's premier destination for luxury accommodation, dining, and corporate events.",
  },
  alternates: {
    canonical: "https://www.parksidevillakitui.com",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
        <ClientBranding>
          {children}
        </ClientBranding>
      </body>
    </html>
  );
}

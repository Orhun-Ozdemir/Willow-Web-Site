import type { Metadata } from "next";
import { Inter, Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import type { Locale } from "@/lib/cms";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `WillowSoft - ${locale.toUpperCase()}`,
    description: "Smart Embedded Connectivity & Industrial IoT Solutions",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} className={`${inter.variable} ${hankenGrotesk.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <RevealObserver />
        <Header locale={locale as Locale} />
        {children}
        <Footer locale={locale as Locale} />
      </body>
    </html>
  );
}

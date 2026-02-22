import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.AUTH_URL || "https://zenflow.app";

export const metadata: Metadata = {
  title: {
    default: "Zenflow - AIウェルネスコーチ",
    template: "%s - Zenflow",
  },
  description:
    "毎日5分のセルフケアルーティンで、心と体の調和を。AIがあなたに寄り添うパーソナルウェルネスコーチ。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "Zenflow",
    title: "Zenflow - AIウェルネスコーチ",
    description:
      "毎日5分のセルフケアルーティンで、心と体の調和を。AIがあなたに寄り添うパーソナルウェルネスコーチ。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenflow - AIウェルネスコーチ",
    description:
      "毎日5分のセルフケアルーティンで、心と体の調和を。AIがあなたに寄り添うパーソナルウェルネスコーチ。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${geistSans.variable} ${notoSansJP.variable} antialiased`}>
        {children}
        <CookieBanner />
        <ToastContainer />
      </body>
    </html>
  );
}

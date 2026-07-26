import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devtechstore.my.id"),
  title: {
    default: "DevTech AI Store - Langganan Google AI Pro Lebih Murah",
    template: "%s | DevTech AI Store",
  },
  description:
    "Dapatkan Akses Google AI Pro Premium Resmi & Bergaransi dengan Harga Terbaik di Indonesia. Pembayaran QRIS Cepat & Praktis.",
  keywords: [
    "DevTech AI Store",
    "devtechstore.my.id",
    "google ai pro",
    "langganan google ai pro murah",
    "gemini advanced indonesia",
    "beli google ai pro resmi",
    "upgrade google ai pro bergaransi",
    "jasa langganan ai indonesia",
  ],
  authors: [{ name: "DevTech AI Store" }],
  creator: "DevTech AI Store",
  publisher: "DevTech AI Store",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  alternates: {
    canonical: "https://devtechstore.my.id",
  },
  verification: {
    google: "_2Q1cke-Z0W6oJhYJWeYX9MDqSui1HvRqZ7w5q7qs_U",
  },
  openGraph: {
    title: "DevTech AI Store - Langganan Google AI Pro Lebih Murah",
    description: "Akses Penuh Google AI Pro Premium Resmi, Aman & Bergaransi. Bayar via QRIS Cepat.",
    url: "https://devtechstore.my.id",
    siteName: "DevTech AI Store",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "DevTech AI Store Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevTech AI Store - Langganan Google AI Pro",
    description: "Akses Penuh Google AI Pro Premium Resmi & Bergaransi dengan Penawaran Harga Terbaik.",
    images: ["/logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) untuk Google Search Rich Snippet
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "DevTech AI Store",
    "url": "https://devtechstore.my.id",
    "logo": "https://devtechstore.my.id/logo.jpeg",
    "description": "Penyedia Layanan Langganan Google AI Pro Resmi & Bergaransi di Indonesia.",
    "priceRange": "Rp15.000 - Rp60.000",
    "paymentAccepted": "QRIS, Transfer Bank",
    "currenciesAccepted": "IDR",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "IDR",
      "price": "15000",
      "availability": "https://schema.org/InStock",
      "url": "https://devtechstore.my.id",
    },
  };

  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased font-sans`}
    >
      <head>
        <meta name="google-site-verification" content="_2Q1cke-Z0W6oJhYJWeYX9MDqSui1HvRqZ7w5q7qs_U" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

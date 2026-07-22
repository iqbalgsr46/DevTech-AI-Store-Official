import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DevTech AI Store - Langganan Google AI Pro Lebih Murah",
  description:
    "Butuh Akses Google AI Pro? Kami Urus Semuanya. Pembayaran QRIS, Proses Cepat, Bergaransi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased font-sans scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}

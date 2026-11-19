import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Markazi_Text } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import Providers from "@/components/Providers";

const markazi = Markazi_Text({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "بيت الحكمة — مجلة الفكر والثقافة والمعرفة",
    template: "%s | بيت الحكمة",
  },
  description: "مجلة عربية رقمية للقراءة المتأنية والتحليلات المعمّقة في السياسة والاقتصاد والثقافة والعلوم والتاريخ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${markazi.variable} ${ibmPlexArabic.variable}`}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          تجاوز إلى المحتوى
        </a>
        <Providers>
          <Header />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}

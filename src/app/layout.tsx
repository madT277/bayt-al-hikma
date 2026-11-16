import type { Metadata } from "next";
import { Amiri, Cairo } from "next/font/google";
import "./globals.css";

// EXACT PATHS: Pointing directly to the components folder!
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Global Providers
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({ 
  subsets: ["arabic"], 
  variable: "--font-arabic",
  display: 'swap',
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "بيت الحكمة | Bayt Al-Hikma",
  description: "مجلة الكترونية فكرية تعنى بالتحليلات العميقة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`}>
      <body className="bg-surface text-foreground min-h-screen flex flex-col font-arabic-serif">
        <AuthProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
"use client";

import { useState } from "react";
import { Menu, Search, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { SearchOverlay } from "@/components/SearchOverlay";

const categories = [
  { label: "السياسة الدولية", slug: "geopolitics" },
  { label: "الاقتصاد", slug: "economy" },
  { label: "الثقافة", slug: "culture" },
  { label: "العلوم", slug: "science" },
  { label: "التاريخ", slug: "history" },
  { label: "الرياضة", slug: "sports" },
];

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <>
      <header>
        {/* Utility bar */}
        <div className="bg-secondary py-1.5 px-4">
          <div className="container mx-auto flex justify-between items-center">
            <span className="text-secondary-foreground text-xs opacity-80 font-arabic-serif">
              العدد ٤٧ — أبريل ٢٠٢٦
            </span>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/admin" className="text-xs text-accent-foreground bg-accent/20 rounded px-2 py-1 flex items-center gap-1 hover:bg-accent/30 transition-colors font-arabic-serif">
                    <LayoutDashboard size={12} /> لوحة التحكم
                  </Link>
                  {/* FIX: The missing Logout Button! */}
                  <button onClick={handleLogout} className="text-destructive hover:text-destructive/80 text-xs flex items-center gap-1 font-arabic-serif transition-colors">
                    <LogOut size={12} /> خروج
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-secondary-foreground text-xs hover:underline flex items-center gap-1 font-arabic-serif">
                  <LogIn size={12} /> دخول
                </Link>
              )}
              <Link href="/newsletter" className="text-secondary-foreground text-xs hover:underline font-arabic-serif">
                اشترك في النشرة البريدية ←
              </Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-primary py-5 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <button className="text-primary-foreground" aria-label="بحث" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
            <Link href="/" className="text-center">
              <h1 className="text-primary-foreground text-3xl leading-tight font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                بيت الحكمة
              </h1>
              <p className="text-primary-foreground/60 text-xs mt-0.5">
                Bayt Al-Hikma
              </p>
            </Link>
            <button className="text-primary-foreground" aria-label="القائمة" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="bg-primary border-t border-primary-foreground/10 px-4 py-4 md:hidden">
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-primary-foreground/80 hover:text-primary-foreground block py-1 font-arabic-serif" onClick={() => setMenuOpen(false)}>
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-primary-foreground/10 pt-2 mt-2">
                <Link href="/archive" className="text-sm text-primary-foreground/80 hover:text-primary-foreground block py-1 font-arabic-serif" onClick={() => setMenuOpen(false)}>الأرشيف</Link>
              </li>
              <li><Link href="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground block py-1 font-arabic-serif" onClick={() => setMenuOpen(false)}>عن المجلة</Link></li>
            </ul>
          </div>
        )}

        {/* Category nav */}
        <nav className="bg-background border-b border-border py-3 px-4 overflow-x-auto">
          <ul className="container mx-auto flex items-center justify-center gap-6 whitespace-nowrap">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/category/${cat.slug}`} className="text-sm text-foreground/70 hover:text-foreground transition-colors font-bold font-arabic-serif">
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
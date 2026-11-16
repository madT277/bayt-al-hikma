"use client";

import { useEffect, useState } from "react";
import { Menu, Search, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { SearchOverlay } from "@/components/SearchOverlay";
import { createClient } from "@/lib/supabase/client";

const categories = [
  { label: "السياسة الدولية", slug: "geopolitics" },
  { label: "الاقتصاد", slug: "economy" },
  { label: "الثقافة", slug: "culture" },
  { label: "العلوم", slug: "science" },
  { label: "التاريخ", slug: "history" },
  { label: "الرياضة", slug: "sports" },
];

interface LatestIssueSummary {
  issue_number: number | string;
  title_ar: string;
  publish_date: string | null;
}

function formatIssueBanner(issue: LatestIssueSummary): string {
  const num = Number(issue.issue_number);
  const numLabel = Number.isFinite(num)
    ? new Intl.NumberFormat("ar-EG").format(num)
    : String(issue.issue_number);

  let datePart = "";
  if (issue.publish_date) {
    const isoMatch = String(issue.publish_date).match(/\d{4}-\d{2}-\d{2}/);
    const candidate = isoMatch ? `${isoMatch[0]}T00:00:00Z` : String(issue.publish_date);
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      datePart = new Intl.DateTimeFormat("ar-EG", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(parsed);
    }
  }

  const titlePart = issue.title_ar?.trim() ? ` · ${issue.title_ar.trim()}` : "";
  return datePart
    ? `العدد ${numLabel}${titlePart} — ${datePart}`
    : `العدد ${numLabel}${titlePart}`;
}

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [latestIssue, setLatestIssue] = useState<LatestIssueSummary | null>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    supabase
      .from("issues")
      .select("issue_number, title_ar, publish_date")
      .eq("status", "published")
      .order("issue_number", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Header latest issue lookup failed:", error.message);
          return;
        }
        if (active && data) {
          setLatestIssue(data as LatestIssueSummary);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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
            {latestIssue ? (
              <Link
                href={`/issue/${latestIssue.issue_number}`}
                className="text-secondary-foreground text-xs opacity-90 hover:opacity-100 hover:underline font-arabic-serif transition-opacity"
              >
                {formatIssueBanner(latestIssue)}
              </Link>
            ) : (
              <span className="text-secondary-foreground text-xs opacity-80 font-arabic-serif">
                مجلة بيت الحكمة — فكر وثقافة ومعرفة
              </span>
            )}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/admin" className="text-xs text-accent-foreground bg-accent/20 rounded px-2 py-1 flex items-center gap-1 hover:bg-accent/30 transition-colors font-arabic-serif">
                    <LayoutDashboard size={12} /> لوحة التحكم
                  </Link>
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

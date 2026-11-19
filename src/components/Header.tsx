"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { SearchOverlay } from "@/components/SearchOverlay";
import { createClient } from "@/lib/supabase/client";
import { SECTIONS } from "@/lib/sections";
import { arNumber, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { describeError } from "@/lib/errors";

interface LatestIssueSummary {
  issue_number: number | string;
  title_ar: string;
  publish_date: string | null;
}

function formatIssueBanner(issue: LatestIssueSummary): string {
  const numLabel = arNumber(issue.issue_number);
  const datePart = formatDate(issue.publish_date, "month");
  const titlePart = issue.title_ar?.trim() ? ` · ${issue.title_ar.trim()}` : "";
  return datePart ? `العدد ${numLabel}${titlePart} — ${datePart}` : `العدد ${numLabel}${titlePart}`;
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [latestIssue, setLatestIssue] = useState<LatestIssueSummary | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Keyboard shortcut: "/" opens search when not typing in an input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        const editable = (e.target as HTMLElement | null)?.isContentEditable;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT" && !editable) {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Fetch latest published issue dynamically
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

  // Check whether signed-in user has editor/admin privileges
  useEffect(() => {
    let active = true;
    if (!user) {
      setIsEditor(false);
      return;
    }

    const metaRole = typeof user.app_metadata?.role === "string" ? user.app_metadata.role : null;
    if (metaRole === "admin" || metaRole === "editor") {
      setIsEditor(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setIsEditor(data?.role === "admin" || data?.role === "editor");
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast({ ...describeError(error), variant: "destructive" });
    }
  };

  return (
    <>
      <header className="border-b border-border bg-background">
        {/* Top editorial utility strip */}
        <div className="border-b border-border/70">
          <div className="wrap flex h-10 items-center justify-between gap-4 text-xs">
            <div className="min-w-0 truncate">
              {latestIssue ? (
                <Link
                  href={`/issue/${latestIssue.issue_number}`}
                  className="inline-flex items-center gap-2 font-medium text-muted-foreground hover:text-accent"
                >
                  <BookOpen className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
                  <span className="truncate">{formatIssueBanner(latestIssue)}</span>
                </Link>
              ) : (
                <span className="text-muted-foreground">مجلة فكر وثقافة ومعرفة</span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {user ? (
                <>
                  {isEditor && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                    >
                      <LayoutDashboard className="size-3.5" aria-hidden="true" />
                      <span>لوحة التحرير</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <UserRound className="size-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">حسابي</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="size-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">خروج</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="size-3.5" aria-hidden="true" />
                  <span>دخول</span>
                </Link>
              )}

              <span className="h-3.5 w-px bg-border" aria-hidden="true" />

              <Link
                href="/newsletter"
                className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-accent"
              >
                <Mail className="size-3.5 text-accent" aria-hidden="true" />
                <span className="hidden sm:inline">النشرة البريدية</span>
                <span className="sm:hidden">النشرة</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Masthead */}
        <div className="wrap flex items-center justify-between py-4 md:py-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded text-foreground transition-colors hover:bg-muted md:hidden"
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link
              href="/archive"
              className="hidden items-center gap-1.5 font-sans text-xs font-semibold text-muted-foreground hover:text-foreground md:inline-flex"
            >
              <span>الأرشيف</span>
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <Link href="/" className="group text-center">
            <span className="block font-serif text-3xl font-bold leading-none tracking-tight text-foreground transition-colors group-hover:text-accent md:text-4xl">
              بيت الحكمة
            </span>
            <span className="mt-1 block font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Bayt Al-Hikma
            </span>
          </Link>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              aria-label="البحث في المجلة"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="hidden md:inline">بحث</span>
              <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground lg:inline">
                /
              </kbd>
            </button>
          </div>
        </div>

        {/* Section navigation with animated active hairline */}
        <nav aria-label="أقسام المجلة" className="hidden border-t border-border/70 md:block">
          <div className="wrap">
            <ul className="flex items-center justify-center gap-8">
              {SECTIONS.map((sec) => {
                const active = pathname === `/category/${sec.slug}`;
                return (
                  <li key={sec.slug} className="relative">
                    <Link
                      href={`/category/${sec.slug}`}
                      className={`inline-block py-3 font-sans text-sm transition-colors ${
                        active ? "font-semibold text-accent" : "text-ink-soft hover:text-foreground"
                      }`}
                    >
                      {sec.label}
                    </Link>
                    {active && (
                      <motion.span
                        layoutId="nav-active-rule"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile navigation drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-border bg-background md:hidden"
            >
              <nav className="wrap py-6" aria-label="القائمة الرئيسية">
                <ul className="divide-y divide-border/70">
                  {SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const active = pathname === `/category/${sec.slug}`;
                    return (
                      <li key={sec.slug}>
                        <Link
                          href={`/category/${sec.slug}`}
                          className={`flex items-center justify-between py-3 font-sans text-base ${
                            active ? "font-semibold text-accent" : "text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                            {sec.label}
                          </span>
                          <ArrowLeft className="size-4 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                  <Link href="/archive" className="hover:text-foreground">الأرشيف</Link>
                  <Link href="/about" className="hover:text-foreground">عن المجلة</Link>
                  <Link href="/write-for-us" className="hover:text-foreground">اكتب معنا</Link>
                  <Link href="/contact" className="hover:text-foreground">تواصل معنا</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

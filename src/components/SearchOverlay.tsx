"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CircleAlert, Search, SearchX, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SECTIONS, sectionLabel } from "@/lib/sections";
import { describeError } from "@/lib/errors";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  id: string;
  title_ar: string;
  slug: string;
  subtitle_ar: string | null;
  section: string;
  author_name: string | null;
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setErrorText(null);
    const t = setTimeout(() => inputRef.current?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setErrorText(null);
      setLoading(false);
      return;
    }

    const sb = createClient();
    const timer = setTimeout(async () => {
      setLoading(true);
      setErrorText(null);
      const { data, error } = await sb
        .from("articles")
        .select("id, title_ar, slug, subtitle_ar, section, author_name")
        .eq("status", "published")
        .or(`title_ar.ilike.%${trimmed}%,subtitle_ar.ilike.%${trimmed}%,body_ar.ilike.%${trimmed}%`)
        .limit(10);

      setLoading(false);
      if (error) {
        setErrorText(describeError(error).description);
        setResults([]);
        return;
      }
      setResults((data as SearchResult[]) || []);
    }, 260);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="البحث في المجلة"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="wrap-narrow py-12 md:py-16"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="kicker">البحث في الأرشيف</span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="إغلاق البحث"
              >
                <span>إغلاق</span>
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="relative border-b-2 border-foreground pb-3">
              <Search
                className="pointer-events-none absolute right-0 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن مقال، موضوع، أو عبارة..."
                className="w-full bg-transparent pr-8 pl-8 font-serif text-2xl font-bold text-foreground placeholder:text-muted-foreground/70 focus:outline-none md:text-3xl"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="مسح البحث"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Quick section links before typing */}
            {!query.trim() && (
              <div className="mt-10">
                <p className="mb-4 text-xs font-semibold text-muted-foreground">أو تصفّح حسب القسم</p>
                <div className="flex flex-wrap gap-3">
                  {SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    return (
                      <Link
                        key={sec.slug}
                        href={`/category/${sec.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded border border-border px-3.5 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                      >
                        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span>{sec.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="mt-8 divide-y divide-border" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2 py-5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && errorText && (
              <div role="alert" className="mt-8 flex items-start gap-3 rounded border border-destructive/30 bg-danger-soft p-4 text-sm text-destructive">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>{errorText}</p>
              </div>
            )}

            {/* Empty results */}
            {!loading && !errorText && query.trim() && results.length === 0 && (
              <div className="py-16 text-center">
                <SearchX className="mx-auto mb-4 size-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                <p className="font-serif text-xl font-bold text-foreground">
                  لا توجد نتائج لـ «{query.trim()}»
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  جرّب كلمات أقصر أو ابحث في أحد الأقسام أعلاه.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <ul className="mt-6 divide-y divide-border">
                {results.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/article/${item.slug}`}
                      onClick={onClose}
                      className="group flex items-start justify-between gap-4 py-5"
                    >
                      <div className="min-w-0">
                        <span className="kicker">{sectionLabel(item.section)}</span>
                        <h3 className="mt-1 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-accent">
                          <span className="link-underline">{item.title_ar}</span>
                        </h3>
                        {item.subtitle_ar && (
                          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{item.subtitle_ar}</p>
                        )}
                      </div>
                      <ArrowLeft
                        className="mt-6 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

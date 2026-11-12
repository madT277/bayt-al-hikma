"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  title_ar: string;
  slug: string;
  subtitle_ar: string | null;
  section: string;
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sb = createClient();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await sb
        .from("articles")
        .select("id, title_ar, slug, subtitle_ar, section")
        .eq("status", "published")
        .or(`title_ar.ilike.%${query}%,subtitle_ar.ilike.%${query}%,body_ar.ilike.%${query}%`)
        .limit(10);
      setResults((data as SearchResult[]) || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, sb]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-sm flex flex-col overflow-y-auto" dir="rtl">
      <div className="max-w-screen-md mx-auto w-full px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-arabic-serif font-bold text-primary">البحث في المجلة</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative mb-12">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-outline" size={24} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مقال، كاتب، أو موضوع..."
            className="w-full h-16 pr-14 pl-4 text-xl font-arabic-serif bg-surface-container border-2 border-outline-variant/30 rounded text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-4">
          {loading && <p className="text-outline text-center font-label">جاري البحث...</p>}
          {!loading && query && results.length === 0 && (
            <p className="text-outline text-center font-label">لا توجد نتائج لـ «{query}»</p>
          )}
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/article/${r.slug}`}
              onClick={onClose}
              className="block p-5 rounded border border-outline-variant/20 bg-surface hover:border-primary/50 transition-colors"
            >
              <span className="text-[11px] text-secondary font-label tracking-widest uppercase">{r.section}</span>
              <h3 className="text-xl font-arabic-serif font-bold text-primary mt-1">{r.title_ar}</h3>
              {r.subtitle_ar && <p className="text-sm text-on-surface-variant mt-2">{r.subtitle_ar}</p>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
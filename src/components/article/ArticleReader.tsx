"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, X, Clock3 } from "lucide-react";
import type { Article } from "@/types";

interface ArticleReaderProps {
  article: Article;
  relatedArticles: Article[];
  categoryName: string;
  safeBodyHtml: string;
}

export default function ArticleReader({ article, relatedArticles, categoryName, safeBodyHtml }: ArticleReaderProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const element = articleRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const total = element.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.top <= 0 ? 100 : 0);
        return;
      }
      setProgress(Math.min(100, Math.max(0, (-rect.top / total) * 100)));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const publishedDate = article.published_at || article.created_at;
  const formattedDate = publishedDate
    ? new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric" }).format(new Date(publishedDate))
    : "";

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-primary/10" aria-label="تقدم القراءة">
        <div className="h-full bg-secondary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <main ref={articleRef} className={`min-h-screen ${zenMode ? "fixed inset-0 z-50 overflow-y-auto bg-[#fbfaf7]" : "bg-background"}`} dir="rtl">
        {article.cover_image && (
          <div className="relative isolate h-[38vh] min-h-[260px] max-h-[560px] w-full overflow-hidden bg-muted md:h-[54vh]">
            <Image src={article.cover_image} alt={article.title_ar} fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062e2d]/90 via-[#062e2d]/20 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-5 pb-10 text-white md:px-8 md:pb-14">
              <span className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm backdrop-blur">{categoryName}</span>
              <h1 className="max-w-4xl font-arabic-serif text-3xl font-bold leading-[1.5] md:text-5xl">{article.title_ar}</h1>
              {article.subtitle_ar && <p className="mt-4 max-w-3xl text-base leading-8 text-white/85 md:text-xl">{article.subtitle_ar}</p>}
            </div>
          </div>
        )}

        <div className={`mx-auto flex max-w-7xl flex-col gap-12 px-5 py-10 md:px-8 md:py-16 lg:flex-row-reverse lg:items-start ${zenMode ? "max-w-5xl" : ""}`}>
          <article className="min-w-0 flex-1">
            {!article.cover_image && (
              <header className="mb-10 border-b border-border pb-8">
                <span className="inline-flex rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">{categoryName}</span>
                <h1 className="mt-5 font-arabic-serif text-3xl font-bold leading-[1.5] text-primary md:text-5xl">{article.title_ar}</h1>
                {article.subtitle_ar && <p className="mt-4 text-lg leading-9 text-muted-foreground">{article.subtitle_ar}</p>}
              </header>
            )}

            <div className="mb-9 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">بقلم: {article.author_name || "فريق التحرير"}</span>
                {formattedDate && <span>{formattedDate}</span>}
                {article.reading_time && <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {article.reading_time} دقائق للقراءة</span>}
              </div>
              <button type="button" onClick={() => setZenMode((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-secondary hover:bg-secondary/10" aria-pressed={zenMode}>
                {zenMode ? <X size={16} /> : <BookOpen size={16} />}
                {zenMode ? "إنهاء وضع القراءة" : "وضع القراءة المركّزة"}
              </button>
            </div>

            <div className="article-body prose prose-lg max-w-none text-foreground prose-headings:font-arabic-serif prose-headings:text-primary prose-p:leading-[2.15] prose-p:text-[1.12rem] prose-a:text-secondary prose-blockquote:border-r-4 prose-blockquote:border-secondary prose-blockquote:pr-5 prose-img:mx-auto prose-img:rounded-2xl prose-table:w-full" dangerouslySetInnerHTML={{ __html: safeBodyHtml }} />
          </article>

          {!zenMode && (
            <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                  <h2 className="font-arabic-serif text-xl font-bold text-primary">مقالات ذات صلة</h2>
                  <BookOpen size={19} className="text-secondary" />
                </div>
                {relatedArticles.length ? (
                  <div className="space-y-5">
                    {relatedArticles.map((related) => (
                      <Link key={related.id} href={`/article/${related.slug}`} className="group flex items-start gap-4">
                        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {related.cover_image ? <Image src={related.cover_image} alt={related.title_ar} fill sizes="96px" className="object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-secondary"><BookOpen size={22} /></div>}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-secondary">{categoryName}</span>
                          <h3 className="mt-1 line-clamp-3 font-arabic-serif text-sm font-bold leading-6 text-foreground transition group-hover:text-secondary">{related.title_ar}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">لا توجد مقالات أخرى في هذا القسم حالياً.</p>}
              </div>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

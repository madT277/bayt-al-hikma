"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Clock3,
  Maximize2,
  Minimize2,
  Type,
  UserRound,
} from "lucide-react";
import type { Article } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { describeError } from "@/lib/errors";
import { formatDate, readingTimeLabel } from "@/lib/format";
import { coverFor } from "@/lib/images";
import { splitArticleBody } from "@/lib/editorial-blocks/types";
import { EditorialBlockRenderer } from "@/components/editorial-blocks/EditorialBlockRenderer";
import { ShareButtons } from "@/components/article/ShareButtons";
import ScrollReveal from "@/components/ScrollReveal";

interface ArticleReaderProps {
  article: Article;
  relatedArticles: Article[];
  categoryName: string;
  safeBodyHtml: string;
}

const FONT_SIZES = [
  { id: "sm", label: "صغير", className: "text-[1.15rem]" },
  { id: "md", label: "افتراضي", className: "text-[1.3125rem]" },
  { id: "lg", label: "كبير", className: "text-[1.5rem]" },
] as const;

export default function ArticleReader({
  article,
  relatedArticles,
  categoryName,
  safeBodyHtml,
}: ArticleReaderProps) {
  const [zenMode, setZenMode] = useState(false);
  const [fontIdx, setFontIdx] = useState(1);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Smooth spring reading-progress hairline
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 32, restDelta: 0.001 });

  // Escape exits focus-reading mode
  useEffect(() => {
    if (!zenMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZenMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zenMode]);

  // Check if the signed-in reader already bookmarked this article
  useEffect(() => {
    let active = true;
    if (!user) {
      setSavedId(null);
      return;
    }
    const sb = createClient();
    sb.from("saved_articles")
      .select("id")
      .eq("user_id", user.id)
      .eq("article_id", article.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setSavedId(data?.id ?? null);
      });
    return () => {
      active = false;
    };
  }, [user, article.id]);

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "سجّل الدخول لحفظ المقالات",
        description: "يمكنك الاحتفاظ بقائمة قراءاتك الخاصة بعد تسجيل الدخول.",
      });
      return;
    }

    setSavingBookmark(true);
    const sb = createClient();

    if (savedId) {
      const { error } = await sb.from("saved_articles").delete().eq("id", savedId);
      setSavingBookmark(false);
      if (error) {
        toast({ ...describeError(error, "save"), variant: "destructive" });
        return;
      }
      setSavedId(null);
      toast({ title: "أُزيل المقال من المحفوظات" });
    } else {
      const { data, error } = await sb
        .from("saved_articles")
        .insert({ user_id: user.id, article_id: article.id })
        .select("id")
        .single();
      setSavingBookmark(false);
      if (error) {
        toast({ ...describeError(error, "save"), variant: "destructive" });
        return;
      }
      setSavedId(data.id);
      toast({ title: "تم حفظ المقال", description: "تجده في صفحة حسابك للعودة إليه لاحقاً." });
    }
  };

  const formattedDate = formatDate(article.published_at || article.created_at, "long");
  const coverSrc = coverFor(article.cover_image, article.section);
  const currentFont = FONT_SIZES[fontIdx];
  const bodySegments = splitArticleBody(safeBodyHtml);

  return (
    <>
      {/* Reading progress hairline */}
      <motion.div
        style={{ scaleX, transformOrigin: "right center" }}
        className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-accent"
        aria-hidden="true"
      />

      <main
        className={
          zenMode
            ? "fixed inset-0 z-50 overflow-y-auto bg-background"
            : "min-h-screen bg-background"
        }
        dir="rtl"
      >
        <article className="py-12 md:py-16">
          {/* Editorial article header */}
          <header className="wrap-narrow">
            <div className="flex items-center gap-3 text-xs">
              <Link href={`/category/${article.section}`} className="kicker hover:underline">
                {categoryName}
              </Link>
              {formattedDate && (
                <>
                  <span className="text-border" aria-hidden="true">•</span>
                  <time className="meta">{formattedDate}</time>
                </>
              )}
            </div>

            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.2] text-foreground md:text-5xl">
              {article.title_ar}
            </h1>

            {article.subtitle_ar && (
              <p className="mt-5 font-serif text-xl leading-relaxed text-muted-foreground md:text-2xl">
                {article.subtitle_ar}
              </p>
            )}

            {/* Ruled metadata + reader controls (no heavy box) */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <UserRound className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>{article.author_name || "فريق التحرير"}</span>
                </span>
                {article.reading_time && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    <span>{readingTimeLabel(article.reading_time)} للقراءة</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Font size stepper */}
                <button
                  type="button"
                  onClick={() => setFontIdx((i) => (i + 1) % FONT_SIZES.length)}
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  title="تغيير حجم الخط"
                  aria-label={`حجم الخط: ${currentFont.label}`}
                >
                  <Type className="size-3.5" aria-hidden="true" />
                  <span>{currentFont.label}</span>
                </button>

                {/* Save / bookmark button */}
                <button
                  type="button"
                  onClick={toggleBookmark}
                  disabled={savingBookmark}
                  aria-pressed={Boolean(savedId)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition-colors ${
                    savedId
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {savedId ? (
                    <BookmarkCheck className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Bookmark className="size-3.5" aria-hidden="true" />
                  )}
                  <span>{savedId ? "محفوظ" : "حفظ"}</span>
                </button>

                {/* Focus reading mode */}
                <button
                  type="button"
                  onClick={() => setZenMode((v) => !v)}
                  aria-pressed={zenMode}
                  className={`inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition-colors ${
                    zenMode
                      ? "border-foreground bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {zenMode ? (
                    <Minimize2 className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Maximize2 className="size-3.5" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">{zenMode ? "إنهاء التركيز" : "قراءة مركّزة"}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Wide editorial photograph */}
          <figure className="wrap my-10 md:my-12">
            <div className="relative aspect-[16/9] max-h-[540px] w-full overflow-hidden rounded bg-muted">
              <Image
                src={coverSrc}
                alt={article.title_ar}
                fill
                priority
                sizes="(min-width: 1200px) 1136px, 100vw"
                className="object-cover"
              />
            </div>
          </figure>

          {/* Article prose + embedded editorial blocks */}
          <div className="wrap-narrow">
            <div className="space-y-6">
              {bodySegments.map((segment, index) =>
                segment.kind === "html" ? (
                  <div
                    key={`prose-${index}`}
                    className={`article-body ${currentFont.className}`}
                    dangerouslySetInnerHTML={{ __html: segment.html }}
                  />
                ) : (
                  <EditorialBlockRenderer
                    key={`block-${index}`}
                    blockType={segment.blockType}
                    payload={segment.payload}
                  />
                ),
              )}
            </div>

            {/* End-of-article colophon & share */}
            <footer className="mt-14 space-y-6 border-t border-border pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <ShareButtons title={article.title_ar} />
                <Link
                  href={`/category/${article.section}`}
                  className="link-underline inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-accent"
                >
                  <span>المزيد في {categoryName}</span>
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </footer>
          </div>
        </article>

        {/* Related reading — open editorial strip, not boxed cards */}
        {!zenMode && relatedArticles.length > 0 && (
          <section className="border-t border-border py-16">
            <div className="wrap">
              <div className="section-head">
                <h2 className="font-serif text-2xl font-bold text-foreground">مقالات ذات صلة</h2>
                <Link
                  href={`/category/${article.section}`}
                  className="link-underline inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-accent"
                >
                  <span>كل مقالات {categoryName}</span>
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {relatedArticles.map((related, idx) => (
                  <ScrollReveal key={related.id} delay={idx * 0.06}>
                    <Link href={`/article/${related.slug}`} className="group block">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-muted">
                        <Image
                          src={coverFor(related.cover_image, related.section)}
                          alt={related.title_ar}
                          fill
                          sizes="(min-width: 768px) 33vw, 100vw"
                          className="img-zoom object-cover"
                        />
                      </div>
                      <span className="kicker mt-4 block">{categoryName}</span>
                      <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
                        <span className="link-underline">{related.title_ar}</span>
                      </h3>
                      {related.subtitle_ar && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{related.subtitle_ar}</p>
                      )}
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

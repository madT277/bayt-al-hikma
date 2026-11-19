import Image from "next/image";
import Link from "next/link";
import { Clock3, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSection, SECTIONS } from "@/lib/sections";
import { articlesLabel, formatDate, readingTimeLabel } from "@/lib/format";
import { coverFor } from "@/lib/images";
import { EmptyState } from "@/components/ui/EmptyState";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const sb = await createClient();
  const sec = getSection(params.slug);
  const categoryTitle = sec?.label ?? "القسم";
  const Icon = sec?.icon ?? Newspaper;

  const { data: articlesData, error } = await sb
    .from("articles")
    .select("id,title_ar,slug,subtitle_ar,cover_image,section,author_name,reading_time,published_at,created_at")
    .eq("section", params.slug)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) console.error("Category articles lookup failed:", error.message);
  const articles = articlesData ?? [];

  return (
    <main className="section min-h-[70vh] bg-background" dir="rtl">
      <div className="wrap">
        {/* Editorial category masthead */}
        <header className="mb-14 border-b border-foreground pb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="kicker inline-flex items-center gap-1.5">
                <Icon className="size-3.5" aria-hidden="true" />
                <span>قسم</span>
              </span>
              <h1 className="mt-2 font-serif text-4xl font-bold text-foreground md:text-5xl">
                {categoryTitle}
              </h1>
              {sec?.description && (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {sec.description}
                </p>
              )}
            </div>
            <span className="meta font-semibold text-foreground">{articlesLabel(articles.length)}</span>
          </div>

          {/* Sibling section switcher */}
          <div className="mt-6 flex flex-wrap gap-2">
            {SECTIONS.map((item) => {
              const active = item.slug === params.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className={`rounded border px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                    active
                      ? "border-accent bg-accent-soft font-semibold text-accent"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        {articles.length === 0 ? (
          <EmptyState
            icon={Icon}
            title={`لا توجد مقالات في قسم ${categoryTitle} حالياً`}
            description="نعمل على إعداد مقالات جديدة في هذا القسم. يمكنك استكشاف الأقسام الأخرى أو تصفّح أرشيف الأعداد."
            action={{ label: "العودة للرئيسية", href: "/" }}
            secondaryAction={{ label: "تصفّح الأرشيف", href: "/archive" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, idx) => (
              <ScrollReveal key={article.id} delay={idx * 0.05} as="article">
                <Link href={`/article/${article.slug}`} className="group block">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-muted">
                    <Image
                      src={coverFor(article.cover_image, article.section)}
                      alt={article.title_ar}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="img-zoom object-cover"
                    />
                  </div>
                  <h2 className="mt-4 font-serif text-2xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
                    <span className="link-underline">{article.title_ar}</span>
                  </h2>
                  {article.subtitle_ar && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {article.subtitle_ar}
                    </p>
                  )}
                  <div className="meta mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-foreground">
                      {article.author_name || "فريق التحرير"}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>{formatDate(article.published_at || article.created_at)}</span>
                    {article.reading_time && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {readingTimeLabel(article.reading_time)}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

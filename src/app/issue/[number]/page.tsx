import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, Clock3, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sectionLabel } from "@/lib/sections";
import { arNumber, articlesLabel, formatDate, readingTimeLabel } from "@/lib/format";
import { coverFor, PHOTOS } from "@/lib/images";
import { EmptyState } from "@/components/ui/EmptyState";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export default async function IssuePage({ params }: { params: { number: string } }) {
  const issueNumber = Number.parseInt(params.number, 10);
  if (!Number.isFinite(issueNumber) || issueNumber < 1) notFound();

  const supabase = await createClient();
  const { data: issue, error: issueError } = await supabase
    .from("issues")
    .select("id,issue_number,title_ar,theme_ar,publish_date,cover_image,status")
    .eq("issue_number", issueNumber)
    .eq("status", "published")
    .maybeSingle();

  if (issueError) console.error("Issue lookup failed:", issueError.message);
  if (!issue) notFound();

  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("id,title_ar,slug,subtitle_ar,author_name,cover_image,section,reading_time")
    .eq("issue_id", issue.id)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (articlesError) console.error("Issue articles lookup failed:", articlesError.message);

  const list = articles ?? [];

  return (
    <main className="section min-h-screen bg-background" dir="rtl">
      <div className="wrap">
        <Link
          href="/archive"
          className="link-underline mb-8 inline-flex items-center gap-2 font-sans text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-3.5" aria-hidden="true" />
          <span>العودة إلى الأرشيف</span>
        </Link>

        {/* Editorial issue spread */}
        <section className="grid grid-cols-1 items-center gap-10 border-b border-foreground pb-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded bg-muted lg:mx-0 lg:max-w-none">
              <Image
                src={issue.cover_image || PHOTOS.issueCover}
                alt={`غلاف العدد ${issue.issue_number}: ${issue.title_ar}`}
                fill
                priority
                sizes="(min-width: 1024px) 320px, 80vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <span className="kicker inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5" aria-hidden="true" />
              <span>العدد {arNumber(issue.issue_number)}</span>
            </span>

            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {issue.title_ar}
            </h1>

            {issue.theme_ar && (
              <p className="mt-5 max-w-2xl font-serif text-2xl leading-relaxed text-ink-soft">
                «{issue.theme_ar}»
              </p>
            )}

            <div className="meta mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5">
              {issue.publish_date && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  <span>تاريخ النشر: {formatDate(issue.publish_date)}</span>
                </span>
              )}
              <span>{articlesLabel(list.length)}</span>
            </div>
          </div>
        </section>

        {/* Table of contents — numbered editorial index instead of heavy cards */}
        <section className="pt-14">
          <div className="section-head">
            <div>
              <span className="kicker">محتويات العدد</span>
              <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">فهرس العدد</h2>
            </div>
            <span className="meta">{articlesLabel(list.length)}</span>
          </div>

          {list.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="لا توجد مقالات في هذا العدد بعد"
              description="يتم حالياً مراجعة وتنسيق مقالات هذا العدد. يمكنك العودة إلى الأرشيف أو قراءة المقالات المستقلة."
              action={{ label: "الصفحة الرئيسية", href: "/" }}
              secondaryAction={{ label: "كل الأعداد", href: "/archive" }}
              compact
            />
          ) : (
            <ol className="divide-y divide-border">
              {list.map((article, index) => (
                <ScrollReveal key={article.id} delay={index * 0.05} as="li">
                  <Link
                    href={`/article/${article.slug}`}
                    className="group grid grid-cols-1 items-center gap-6 py-8 md:grid-cols-12"
                  >
                    <span className="hidden font-serif text-3xl font-bold text-muted-foreground/50 md:col-span-1 md:block">
                      {arNumber(index + 1).padStart(2, "٠")}
                    </span>

                    <div className="md:col-span-8">
                      <span className="kicker">{sectionLabel(article.section)}</span>
                      <h3 className="mt-1.5 font-serif text-2xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
                        <span className="link-underline">{article.title_ar}</span>
                      </h3>
                      {article.subtitle_ar && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {article.subtitle_ar}
                        </p>
                      )}
                      <div className="meta mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-medium text-foreground">
                          {article.author_name || "فريق التحرير"}
                        </span>
                        {article.reading_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="size-3.5" aria-hidden="true" />
                            <span>{readingTimeLabel(article.reading_time)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-muted">
                        <Image
                          src={coverFor(article.cover_image, article.section)}
                          alt={article.title_ar}
                          fill
                          sizes="(min-width: 768px) 260px, 100vw"
                          className="img-zoom object-cover"
                        />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}

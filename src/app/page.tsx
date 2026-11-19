import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock3, Mail, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SECTIONS, sectionLabel } from "@/lib/sections";
import { arNumber, formatDate, readingTimeLabel } from "@/lib/format";
import { coverFor, PHOTOS } from "@/lib/images";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionComparison, type SectionCountItem } from "@/components/article/AnimatedChart";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: latestIssue, error: issueError },
    { data: articles, error: articlesError },
    { data: allSections },
  ] = await Promise.all([
    supabase
      .from("issues")
      .select("id,issue_number,title_ar,theme_ar,publish_date,cover_image,status")
      .eq("status", "published")
      .order("issue_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("articles")
      .select("id,title_ar,slug,subtitle_ar,cover_image,section,author_name,reading_time,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("articles")
      .select("section")
      .eq("status", "published"),
  ]);

  if (issueError) console.error("Homepage issue lookup failed:", issueError.message);
  if (articlesError) console.error("Homepage article lookup failed:", articlesError.message);

  const featured = articles?.[0] ?? null;
  const secondary = articles?.slice(1, 5) ?? [];

  // Count published articles per section for the multi-colour comparison strip
  const sectionCounts: Record<string, number> = {};
  for (const row of allSections ?? []) {
    if (row.section) {
      sectionCounts[row.section] = (sectionCounts[row.section] ?? 0) + 1;
    }
  }
  const comparisonItems: SectionCountItem[] = SECTIONS.map((sec) => ({
    slug: sec.slug,
    label: sec.label,
    count: sectionCounts[sec.slug] ?? 0,
    color: sec.color,
  }));

  return (
    <main className="bg-background" dir="rtl">
      {/* 1. Latest Issue — open asymmetric editorial feature (no heavy dark box) */}
      <section className="section border-b border-border">
        <div className="wrap">
          {latestIssue ? (
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3 text-xs">
                  <span className="kicker">العدد الأحدث · {arNumber(latestIssue.issue_number)}</span>
                  {latestIssue.publish_date && (
                    <>
                      <span className="text-border" aria-hidden="true">•</span>
                      <span className="meta">{formatDate(latestIssue.publish_date, "month")}</span>
                    </>
                  )}
                </div>

                <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.15] text-foreground md:text-5xl">
                  <Link href={`/issue/${latestIssue.issue_number}`} className="link-underline hover:text-accent">
                    {latestIssue.title_ar}
                  </Link>
                </h1>

                {latestIssue.theme_ar ? (
                  <p className="mt-5 font-serif text-xl leading-relaxed text-ink-soft">
                    {latestIssue.theme_ar}
                  </p>
                ) : (
                  <p className="mt-5 font-serif text-xl leading-relaxed text-muted-foreground">
                    ملف عددي يجمع قراءات ومقالات معمّقة حول الأفكار التي تشكّل عالمنا المعاصر.
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link
                    href={`/issue/${latestIssue.issue_number}`}
                    className="inline-flex h-11 items-center gap-2 rounded bg-primary px-6 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink-soft"
                  >
                    <span>اقرأ العدد</span>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/archive"
                    className="link-underline font-sans text-sm font-semibold text-accent"
                  >
                    أرشيف الأعداد
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <Link
                  href={`/issue/${latestIssue.issue_number}`}
                  className="group relative block aspect-[16/10] w-full overflow-hidden rounded bg-muted"
                >
                  <Image
                    src={latestIssue.cover_image || PHOTOS.issueCover}
                    alt={`غلاف العدد ${latestIssue.issue_number}: ${latestIssue.title_ar}`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="img-zoom object-cover"
                  />
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="العدد الأول قيد الإعداد"
              description="يعكف فريق التحرير على تجهيز ملف العدد الأول. اشترك في النشرة البريدية لتصلك فور صدوره."
              action={{ label: "اشترك في النشرة", href: "/newsletter" }}
              secondaryAction={{ label: "عن بيت الحكمة", href: "/about" }}
            />
          )}
        </div>
      </section>

      {/* 2. Recent Articles — Lead story + ruled vertical index (fewer cards, more space) */}
      <section className="section border-b border-border">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">قراءات مختارة</span>
              <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">أحدث المقالات</h2>
            </div>
            <Link
              href="/archive"
              className="link-underline inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-accent"
            >
              <span>تصفّح كل الأعداد</span>
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {!featured ? (
            <EmptyState
              icon={Newspaper}
              title="لا توجد مقالات منشورة حالياً"
              description="ستظهر هنا أحدث المقالات والتحليلات فور نشرها من غرفة التحرير."
              action={{ label: "استكشف الأرشيف", href: "/archive" }}
              compact
            />
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* Lead story */}
              <ScrollReveal as="article" className={secondary.length > 0 ? "lg:col-span-7" : "lg:col-span-12"}>
                <Link href={`/article/${featured.slug}`} className="group block">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-muted">
                    <Image
                      src={coverFor(featured.cover_image, featured.section)}
                      alt={featured.title_ar}
                      fill
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="img-zoom object-cover"
                    />
                  </div>
                  <div className="mt-5">
                    <span className="kicker">{sectionLabel(featured.section)}</span>
                    <h3 className="mt-2 font-serif text-3xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent md:text-4xl">
                      <span className="link-underline">{featured.title_ar}</span>
                    </h3>
                    {featured.subtitle_ar && (
                      <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
                        {featured.subtitle_ar}
                      </p>
                    )}
                    <div className="meta mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-semibold text-foreground">
                        {featured.author_name || "فريق التحرير"}
                      </span>
                      {featured.published_at && <span>{formatDate(featured.published_at)}</span>}
                      {featured.reading_time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          <span>{readingTimeLabel(featured.reading_time)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              {/* Secondary stories — clean hairline-separated editorial list */}
              {secondary.length > 0 && (
                <div className="divide-y divide-border border-t border-border lg:col-span-5 lg:border-r lg:border-t-0 lg:pr-10">
                  {secondary.map((article, idx) => (
                    <ScrollReveal key={article.id} delay={idx * 0.06} as="article">
                      <Link
                        href={`/article/${article.slug}`}
                        className="group flex items-start gap-5 py-6 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="kicker">{sectionLabel(article.section)}</span>
                          <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
                            <span className="link-underline">{article.title_ar}</span>
                          </h3>
                          <div className="meta mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>{article.author_name || "فريق التحرير"}</span>
                            {article.reading_time && (
                              <>
                                <span aria-hidden="true">•</span>
                                <span>{readingTimeLabel(article.reading_time)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded bg-muted">
                          <Image
                            src={coverFor(article.cover_image, article.section)}
                            alt={article.title_ar}
                            fill
                            sizes="96px"
                            className="img-zoom object-cover"
                          />
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Multi-colour editorial section comparison (6 distinct hues) */}
      <section className="section border-b border-border">
        <div className="wrap">
          <ScrollReveal>
            <SectionComparison items={comparisonItems} />
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Quiet editorial newsletter invitation (no floating promo card) */}
      <section className="section">
        <div className="wrap">
          <ScrollReveal>
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <span className="kicker">النشرة الأسبوعية</span>
                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  قراءة واحدة متأنية في بريدك كل أسبوع
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                  نختار لك أبرز المقالات والملفات الفكرية الجديدة، دون إعلانات أو رسائل مزعجة.
                  يمكنك إلغاء الاشتراك بضغطة واحدة في أي وقت.
                </p>
                <div className="mt-6">
                  <Link
                    href="/newsletter"
                    className="inline-flex h-11 items-center gap-2 rounded bg-accent px-6 font-sans text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    <span>اشترك في النشرة</span>
                  </Link>
                </div>
              </div>
              <div className="md:col-span-5">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-muted">
                  <Image
                    src={PHOTOS.newsletter}
                    alt="كتاب مفتوح وفنجان قهوة"
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}

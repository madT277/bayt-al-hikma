import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SECTION_LABELS } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: latestIssue, error: issueError }, { data: articles, error: articlesError }] = await Promise.all([
    supabase.from("issues")
      .select("id,issue_number,title_ar,theme_ar,publish_date,cover_image,status")
      .eq("status", "published")
      .order("issue_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("articles")
      .select("id,title_ar,slug,subtitle_ar,cover_image,section,author_name,reading_time,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4),
  ]);
  if (issueError) console.error("Homepage issue lookup failed:", issueError.message);
  if (articlesError) console.error("Homepage article lookup failed:", articlesError.message);

  const featured = articles?.[0] ?? null;
  const secondary = articles?.slice(1) ?? [];
  const dateLabel = (value: string | null) => value
    ? new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value))
    : "";

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="text-xs font-bold tracking-[.24em] text-secondary">مجلة فكر وثقافة ومعرفة</span>
            <h1 className="mt-3 font-arabic-serif text-4xl font-bold leading-tight text-primary md:text-6xl">بيت الحكمة</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">مساحة عربية للأفكار التي تستحق التأمل.</p>
          </div>
          <Link href="/archive" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-primary transition hover:border-secondary hover:bg-secondary/10">
            تصفح الأرشيف <ArrowLeft size={16} />
          </Link>
        </div>

        {latestIssue ? (
          <Link href={`/issue/${latestIssue.issue_number}`} className="group relative mb-14 grid overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-xl md:min-h-[350px] md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="relative z-10 flex flex-col justify-center p-7 md:p-12">
              <span className="w-fit rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 text-xs font-bold text-secondary">العدد الأحدث · {latestIssue.issue_number}</span>
              <h2 className="mt-5 max-w-3xl font-arabic-serif text-3xl font-bold leading-[1.5] md:text-5xl">{latestIssue.title_ar}</h2>
              {latestIssue.theme_ar && <p className="mt-4 max-w-2xl text-base leading-8 text-white/75 md:text-lg">{latestIssue.theme_ar}</p>}
              <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-primary transition group-hover:gap-4">اقرأ العدد <ArrowLeft size={16} /></span>
            </div>
            <div className="relative hidden min-h-[350px] overflow-hidden md:block">
              {latestIssue.cover_image ? <Image src={latestIssue.cover_image} alt={`غلاف ${latestIssue.title_ar}`} fill priority sizes="280px" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-white/5"><BookOpen size={72} className="text-secondary" /></div>}
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary to-transparent" />
            </div>
          </Link>
        ) : (
          <div className="mb-14 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <BookOpen className="mx-auto mb-4 text-secondary" size={48} />
            <h2 className="font-arabic-serif text-2xl font-bold text-primary">العدد الأول قيد الإعداد</h2>
            <p className="mx-auto mt-3 max-w-xl leading-8 text-muted-foreground">نعمل على إعداد محتوى بيت الحكمة. يمكنك استكشاف المقالات المنشورة أو الاشتراك في النشرة البريدية.</p>
            <Link href="/newsletter" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-secondary hover:text-primary">اشترك في النشرة</Link>
          </div>
        )}

        <div className="mb-7 flex items-end justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold tracking-[.2em] text-secondary">قراءات مختارة</span>
            <h2 className="mt-2 font-arabic-serif text-3xl font-bold text-primary">أحدث المقالات</h2>
          </div>
          <Link href="/archive" className="text-sm font-bold text-secondary transition hover:text-primary">كل الأعداد ←</Link>
        </div>

        {!featured ? (
          <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">لا توجد مقالات منشورة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.2fr_.8fr]">
            <Link href={`/article/${featured.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                {featured.cover_image ? <Image src={featured.cover_image} alt={featured.title_ar} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-secondary"><BookOpen size={54} /></div>}
              </div>
              <div className="p-6 md:p-8">
                <span className="text-xs font-bold text-secondary">{SECTION_LABELS[featured.section] || featured.section}</span>
                <h3 className="mt-3 font-arabic-serif text-2xl font-bold leading-[1.6] text-primary transition group-hover:text-secondary md:text-3xl">{featured.title_ar}</h3>
                {featured.subtitle_ar && <p className="mt-3 line-clamp-2 leading-8 text-muted-foreground">{featured.subtitle_ar}</p>}
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{featured.author_name || "فريق التحرير"}</span>{featured.published_at && <span>{dateLabel(featured.published_at)}</span>}{featured.reading_time && <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {featured.reading_time} دقائق</span>}</div>
              </div>
            </Link>

            <div className="space-y-5">
              {secondary.map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`} className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-secondary/60 hover:shadow-md">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-36">
                    {article.cover_image ? <Image src={article.cover_image} alt={article.title_ar} fill sizes="144px" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-secondary"><BookOpen size={28} /></div>}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    <span className="text-xs font-bold text-secondary">{SECTION_LABELS[article.section] || article.section}</span>
                    <h3 className="mt-2 line-clamp-3 font-arabic-serif text-lg font-bold leading-7 text-primary transition group-hover:text-secondary">{article.title_ar}</h3>
                    {article.published_at && <span className="mt-3 text-xs text-muted-foreground">{dateLabel(article.published_at)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

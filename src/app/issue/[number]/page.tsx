import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import { BookOpen, ChevronLeft } from "lucide-react";
import BackToTop from "@/components/BackToTop";
import { SECTION_LABELS } from "@/types";

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
    .select("id,title_ar,slug,subtitle_ar,author_name,cover_image,section")
    .eq("issue_id", issue.id)
    .eq("status", "published")
    .order("created_at", { ascending: true });
  if (articlesError) console.error("Issue articles lookup failed:", articlesError.message);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <ScrollReveal>
          <Link href="/archive" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-primary">
            <ChevronLeft size={16} /> العودة إلى الأرشيف
          </Link>
          <section className="relative isolate mb-14 overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground shadow-xl md:p-10">
            {issue.cover_image && <div className="absolute inset-0 -z-10 opacity-20"><Image src={issue.cover_image} alt="" fill sizes="100vw" className="object-cover" /></div>}
            <div className="flex flex-col items-center gap-8 md:flex-row">
              {issue.cover_image ? (
                <div className="relative aspect-[3/4] w-44 shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-2xl md:w-56">
                  <Image src={issue.cover_image} alt={`غلاف ${issue.title_ar}`} fill sizes="224px" className="object-cover" />
                </div>
              ) : <div className="flex aspect-[3/4] w-44 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 md:w-56"><BookOpen size={58} className="text-secondary" /></div>}
              <div className="text-center md:text-right">
                <span className="inline-flex rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 text-sm font-bold text-secondary">العدد {issue.issue_number}</span>
                <h1 className="mt-5 font-arabic-serif text-3xl font-bold leading-[1.5] md:text-5xl">{issue.title_ar}</h1>
                {issue.theme_ar && <p className="mt-4 text-lg leading-8 text-white/80">« {issue.theme_ar} »</p>}
                {issue.publish_date && <p className="mt-5 text-sm text-white/60">تاريخ النشر: {issue.publish_date}</p>}
              </div>
            </div>
          </section>
        </ScrollReveal>

        <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold tracking-[.2em] text-secondary">محتويات العدد</span>
            <h2 className="mt-2 font-arabic-serif text-3xl font-bold text-primary">فهرس العدد</h2>
          </div>
          <span className="text-sm text-muted-foreground">{articles?.length ?? 0} مقالات</span>
        </div>

        {articles?.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {articles.map((article, index) => (
              <ScrollReveal key={article.id} delay={index * 0.05}>
                <Link href={`/article/${article.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-lg sm:flex-row">
                  <div className="relative h-52 shrink-0 bg-muted sm:h-auto sm:w-40">
                    {article.cover_image ? <Image src={article.cover_image} alt={article.title_ar} fill sizes="160px" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full min-h-40 items-center justify-center text-secondary"><BookOpen size={34} /></div>}
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-5">
                    <span className="text-xs font-bold text-secondary">{SECTION_LABELS[article.section] || article.section}</span>
                    <h3 className="mt-2 font-arabic-serif text-xl font-bold leading-8 text-primary transition group-hover:text-secondary">{article.title_ar}</h3>
                    {article.subtitle_ar && <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{article.subtitle_ar}</p>}
                    {article.author_name && <p className="mt-4 text-xs text-muted-foreground">بقلم: {article.author_name}</p>}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-secondary" size={42} />
            <p className="font-arabic-serif text-lg font-bold text-primary">لا توجد مقالات منشورة في هذا العدد حتى الآن.</p>
          </div>
        )}
      </div>
      <BackToTop />
    </main>
  );
}

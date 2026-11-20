"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CircleAlert, FileText, PenLine, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SECTIONS, sectionLabel } from "@/lib/sections";
import { arNumber, formatDate } from "@/lib/format";
import { describeError } from "@/lib/errors";
import { AnimatedChart, type ComparisonPoint } from "@/components/article/AnimatedChart";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentArticleRow {
  id: string;
  title_ar: string;
  slug: string;
  section: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [stats, setStats] = useState({ published: 0, drafts: 0, subscribers: 0, issues: 0 });
  const [sectionChart, setSectionChart] = useState<ComparisonPoint[]>([]);
  const [recentArticles, setRecentArticles] = useState<RecentArticleRow[]>([]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    Promise.all([
      supabase.from("articles").select("id, title_ar, slug, section, status, created_at").order("created_at", { ascending: false }),
      supabase.from("subscribers").select("id", { count: "exact", head: true }),
      supabase.from("issues").select("id", { count: "exact", head: true }),
    ]).then(([articlesRes, subsRes, issuesRes]) => {
      if (!active) return;
      if (articlesRes.error) {
        setErrorText(describeError(articlesRes.error).description);
        setLoading(false);
        return;
      }

      const rows = (articlesRes.data ?? []) as RecentArticleRow[];
      const published = rows.filter((r) => r.status === "published").length;
      const drafts = rows.length - published;

      const counts: Record<string, number> = {};
      for (const r of rows) {
        counts[r.section] = (counts[r.section] ?? 0) + 1;
      }

      const chartPoints: ComparisonPoint[] = SECTIONS.map((sec) => ({
        label: sec.label,
        value: counts[sec.slug] ?? 0,
        colorIndex: sec.color,
        href: `/category/${sec.slug}`,
      }));

      setStats({
        published,
        drafts,
        subscribers: subsRes.count ?? 0,
        issues: issuesRes.count ?? 0,
      });
      setSectionChart(chartPoints);
      setRecentArticles(rows.slice(0, 6));
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const maxSectionCount = Math.max(1, ...sectionChart.map((c) => c.value));

  return (
    <main className="section min-h-[75vh] bg-background" dir="rtl">
      <div className="wrap space-y-14">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-6">
          <div>
            <span className="kicker">غرفة التحرير</span>
            <h1 className="mt-2 font-serif text-4xl font-bold text-foreground">لوحة التحكم</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/write"
              className="inline-flex h-10 items-center gap-2 rounded bg-accent px-4 font-sans text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <PenLine className="size-4" aria-hidden="true" />
              <span>كتابة مقال مستقل</span>
            </Link>
            <Link
              href="/admin/issues"
              className="inline-flex h-10 items-center gap-2 rounded border border-foreground px-4 font-sans text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              <span>إدارة الأعداد</span>
            </Link>
          </div>
        </header>

        {errorText && (
          <div role="alert" className="flex items-start gap-3 rounded border border-destructive/30 bg-danger-soft p-4 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{errorText}</p>
          </div>
        )}

        {/* Editorial KPI bar — clean hairline columns instead of heavy boxed cards */}
        <section className="grid grid-cols-2 gap-8 border-b border-border pb-10 md:grid-cols-4">
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-10 w-16" />
              </div>
            ))
          ) : (
            <>
              <Metric icon={FileText} label="المقالات المنشورة" value={stats.published} />
              <Metric icon={PenLine} label="المسودات" value={stats.drafts} />
              <Metric icon={BookOpen} label="الأعداد" value={stats.issues} />
              <Metric icon={Users} label="المشتركون في النشرة" value={stats.subscribers} />
            </>
          )}
        </section>

        {/* Multi-colour section comparison chart */}
        {!loading && sectionChart.length > 0 && (
          <section>
            <AnimatedChart
              title="مقارنة الإنتاج التحريري بين الأقسام"
              subtitle="عدد المقالات (منشورة ومسودات) في كل قسم"
              data={sectionChart}
              unit=" مقال"
              maxValue={maxSectionCount}
            />
          </section>
        )}

        {/* Recent articles list */}
        <section>
          <div className="section-head">
            <h2 className="font-serif text-2xl font-bold text-foreground">آخر المقالات المضافة</h2>
            <Link href="/admin/write" className="link-underline inline-flex items-center gap-1 text-xs font-semibold text-accent">
              <span>مقال جديد</span>
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentArticles.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              لا توجد مقالات بعد. ابدأ بكتابة أول مقال أو إنشاء عدد جديد.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentArticles.map((art) => (
                <li key={art.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="kicker">{sectionLabel(art.section)}</span>
                      <span className="text-border" aria-hidden="true">•</span>
                      <span className="meta">{formatDate(art.created_at)}</span>
                    </div>
                    <p className="mt-1 truncate font-serif text-xl font-bold text-foreground">
                      {art.title_ar}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded px-2.5 py-1 font-sans text-xs font-semibold ${
                        art.status === "published"
                          ? "bg-success-soft text-success"
                          : "bg-warning-soft text-warning"
                      }`}
                    >
                      {art.status === "published" ? "منشور" : "مسودة"}
                    </span>
                    <Link
                      href={`/admin/write?edit=${art.id}`}
                      className="link-underline font-sans text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      تعديل
                    </Link>
                    {art.status === "published" && (
                      <Link
                        href={`/article/${encodeURIComponent(art.slug)}`}
                        className="link-underline font-sans text-xs font-semibold text-accent"
                      >
                        معاينة
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-4 text-accent" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className="font-serif text-4xl font-bold tabular-nums text-foreground">{arNumber(value)}</p>
    </div>
  );
}

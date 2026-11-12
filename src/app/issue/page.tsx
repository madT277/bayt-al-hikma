import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الأعداد" };

export default async function IssuesIndexPage() {
  const supabase = await createClient();
  const { data: issues, error } = await supabase
    .from("issues")
    .select("id,title_ar,theme_ar,cover_image,issue_number,publish_date,status,created_at")
    .eq("status", "published")
    .order("publish_date", { ascending: false });
  if (error) console.error("Issues index lookup failed:", error.message);

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-14 md:py-20" dir="rtl">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <span className="text-sm font-bold tracking-[.2em] text-secondary">أرشيف المجلة</span>
        <h1 className="mt-3 font-arabic-serif text-4xl font-bold text-primary md:text-5xl">أعداد بيت الحكمة</h1>
        <p className="mt-4 leading-8 text-muted-foreground">رحلة في الأفكار والمعرفة عبر أعداد المجلة.</p>
        <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-secondary" />
      </header>

      {issues?.length ? (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Link key={issue.id} href={`/issue/${issue.issue_number}`} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {issue.cover_image ? <img src={issue.cover_image} alt={issue.title_ar} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-secondary"><BookOpen size={48} /></div>}
                <span className="absolute right-4 top-4 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">العدد {issue.issue_number}</span>
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-secondary">{issue.publish_date || ""}</p>
                <h2 className="mt-2 font-arabic-serif text-2xl font-bold text-primary transition group-hover:text-secondary">{issue.title_ar}</h2>
                {issue.theme_ar && <p className="mt-3 line-clamp-2 leading-7 text-muted-foreground">{issue.theme_ar}</p>}
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">تصفح العدد <span aria-hidden="true">←</span></span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <BookOpen className="mx-auto mb-4 text-secondary" size={42} />
          <p className="font-arabic-serif text-xl font-bold text-primary">لا توجد أعداد منشورة حالياً.</p>
        </div>
      )}
    </main>
  );
}

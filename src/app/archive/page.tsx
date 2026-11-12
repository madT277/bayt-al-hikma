import Link from "next/link";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: issues, error } = await supabase
    .from("issues")
    .select("id,issue_number,title_ar,publish_date,cover_image,theme_ar")
    .eq("status", "published")
    .order("publish_date", { ascending: false });
  if (error) console.error("Archive lookup failed:", error.message);

  return (
    <main className="mx-auto min-h-[70vh] max-w-screen-xl px-5 py-14 md:px-8 md:py-20" dir="rtl">
      <ScrollReveal>
        <header className="mb-12 border-b border-border pb-7 text-center md:text-right">
          <span className="text-sm font-bold tracking-[.2em] text-secondary">ذاكرة المجلة</span>
          <h1 className="mt-3 font-arabic-serif text-4xl font-bold text-primary md:text-5xl">أرشيف الأعداد</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">تصفح أعداد مجلة بيت الحكمة وما جمعته من مقالات وملفات معرفية.</p>
        </header>
      </ScrollReveal>

      {!issues?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <BookOpen className="mx-auto mb-5 text-secondary" size={54} />
          <p className="font-arabic-serif text-2xl font-bold text-primary">لا توجد أعداد منشورة بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {issues.map((issue, index) => (
            <ScrollReveal key={issue.id} delay={0.04 * index}>
              <Link href={`/issue/${issue.issue_number}`} className="group block h-full text-center">
                <div className="relative mb-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  {issue.cover_image ? <img src={issue.cover_image} alt={`غلاف ${issue.title_ar}`} loading="lazy" className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex aspect-[3/4] items-center justify-center text-secondary"><BookOpen size={56} /></div>}
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">العدد {issue.issue_number}</span>
                </div>
                <h2 className="font-arabic-serif text-xl font-bold leading-8 text-primary transition group-hover:text-secondary">{issue.title_ar}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{issue.publish_date}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </main>
  );
}

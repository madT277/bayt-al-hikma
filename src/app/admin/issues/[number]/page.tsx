import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

export default async function IssuePage({ params }: { params: { number: string } }) {
  const sb = await createClient();
  const issueNumber = parseInt(params.number);

  // 1. Get the "Box" (The Issue)
  const { data: issue } = await sb
    .from("issues")
    .select("*")
    .eq("issue_number", issueNumber)
    .eq("status", "published")
    .maybeSingle();

  if (!issue) notFound();

  // 2. Get the "Pages" (The Articles inside this Issue)
  const { data: articles } = await sb
    .from("articles")
    .select("id, title_ar, slug, subtitle_ar, cover_image, section, author_name")
    .eq("issue_id", issue.id)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  const safeArticles = articles || [];

  return (
    <main className="flex-1 container mx-auto py-12 px-4 max-w-5xl" dir="rtl">
      {/* Magazine Cover Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center bg-[#003434] text-white p-8 rounded-2xl shadow-xl mb-16">
        {issue.cover_image ? (
          <img src={issue.cover_image} alt={issue.title_ar} className="w-full md:w-64 aspect-[3/4] object-cover rounded-lg shadow-2xl border-4 border-[#E5B95F]/20" />
        ) : (
          <div className="w-full md:w-64 aspect-[3/4] bg-white/10 rounded-lg flex items-center justify-center border-4 border-[#E5B95F]/20">
            <BookOpen size={64} className="text-[#E5B95F]/50" />
          </div>
        )}
        <div className="flex-1 text-center md:text-right">
          <span className="text-[#E5B95F] font-bold tracking-wider mb-2 block font-arabic-serif">العدد {issue.issue_number}</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-arabic-serif leading-tight">{issue.title_ar}</h1>
          {issue.theme_ar && <p className="text-xl text-white/80 font-arabic-serif italic mb-6">« {issue.theme_ar} »</p>}
        </div>
      </div>

      {/* Table of Contents (Articles) */}
      <h2 className="text-3xl font-bold text-[#003434] mb-8 font-arabic-serif border-b-2 border-[#E5B95F] pb-2 inline-block">فهرس العدد</h2>
      
      {safeArticles.length === 0 ? (
        <p className="text-muted-foreground text-lg font-arabic-serif bg-card p-8 rounded-xl border text-center">لا توجد مقالات منشورة في هذا العدد حتى الآن.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safeArticles.map((article) => (
            <Link key={article.id} href={`/article/${article.slug}`} className="group flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border hover:border-[#E5B95F] hover:shadow-md transition-all">
              {article.cover_image ? (
                <img src={article.cover_image} alt={article.title_ar} className="w-full sm:w-32 h-32 object-cover rounded-lg" />
              ) : (
                <div className="w-full sm:w-32 h-32 bg-muted rounded-lg flex items-center justify-center"><BookOpen className="text-muted-foreground/50" /></div>
              )}
              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-[#E5B95F] mb-1 font-arabic-serif">{article.section}</span>
                <h3 className="text-xl font-bold text-foreground group-hover:text-[#003434] transition-colors font-arabic-serif mb-2">{article.title_ar}</h3>
                {article.author_name && <p className="text-sm text-muted-foreground font-arabic-serif">بقلم: {article.author_name}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
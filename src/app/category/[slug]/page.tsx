import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ScrollReveal from "@/components/ScrollReveal";

const categoryNames: Record<string, string> = {
  "geopolitics": "السياسة الدولية",
  "economy": "الاقتصاد",
  "culture": "الثقافة",
  "science": "العلوم",
  "history": "التاريخ",
  "sports": "الرياضة",
};

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const sb = await createClient();
  const categoryTitle = categoryNames[params.slug] || "القسم";

  // Fetch articles for this specific category
  const { data: articlesData } = await sb
    .from("articles")
    .select("*")
    .eq("section", params.slug)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles = articlesData || [];

  return (
    <main className="min-h-[70vh] bg-surface py-16 px-6">
      <div className="max-w-screen-xl mx-auto">
        <ScrollReveal>
          <div className="border-b border-outline-variant/30 pb-6 mb-12">
            <h1 className="text-4xl font-arabic-serif font-bold text-primary">
              {categoryTitle}
            </h1>
          </div>
        </ScrollReveal>

        {articles.length === 0 ? (
          <ScrollReveal delay={0.2}>
            <p className="text-on-surface-variant text-lg font-arabic-serif text-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              لا توجد مقالات في هذا القسم حالياً.
            </p>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <ScrollReveal key={article.id} delay={i * 0.1}>
                <Link href={`/article/${article.slug}`} className="block group">
                  <div className="w-full aspect-video bg-surface-container-high rounded-xl mb-4 overflow-hidden relative">
                     {article.cover_image && (
                      <Image src={article.cover_image} alt={article.title_ar} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <h3 className="text-xl font-arabic-serif font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {article.title_ar}
                  </h3>
                  <p className="text-sm font-label text-outline uppercase tracking-widest">
                    {new Date(article.created_at).toLocaleDateString("ar-EG")}
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
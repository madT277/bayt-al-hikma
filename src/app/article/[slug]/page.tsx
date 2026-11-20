import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sectionLabel } from "@/lib/sections";
import type { Article } from "@/types";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import ArticleReader from "@/components/article/ArticleReader";

export const dynamic = "force-dynamic";

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const decodedSlug = decodeSlug(params.slug);
  const candidates = decodedSlug === params.slug ? [decodedSlug] : [decodedSlug, params.slug];

  const { data: articleData, error } = await supabase
    .from("articles")
    .select("*")
    .in("slug", candidates)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (error) console.error("Article lookup failed:", error.message);
  if (!articleData) notFound();

  const article = articleData as Article;
  const { data: relatedData } = await supabase
    .from("articles")
    .select("*")
    .eq("section", article.section)
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <ArticleReader
      article={article}
      relatedArticles={(relatedData ?? []) as Article[]}
      categoryName={sectionLabel(article.section)}
      safeBodyHtml={sanitizeArticleHtml(article.body_ar || "")}
    />
  );
}

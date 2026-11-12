import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  const [{ data: articles, error: articlesError }, { data: issues, error: issuesError }] = await Promise.all([
    supabase.from("articles").select("slug,published_at,updated_at").eq("status", "published"),
    supabase.from("issues").select("issue_number,publish_date").eq("status", "published"),
  ]);
  if (articlesError) console.error("Sitemap articles lookup failed:", articlesError.message);
  if (issuesError) console.error("Sitemap issues lookup failed:", issuesError.message);

  return [
    { url: siteUrl, priority: 1.0 },
    ...(issues ?? []).map((issue) => ({
      url: `${siteUrl}/issue/${issue.issue_number}`,
      lastModified: issue.publish_date ? new Date(issue.publish_date) : new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.9,
    })),
    ...(articles ?? []).map((article) => ({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: new Date(article.updated_at ?? article.published_at ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

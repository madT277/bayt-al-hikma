import { createClient } from "./server";
import type { Article, Issue, IssueWithArticles } from "@/types";

export async function getRecentIssues(limit = 4): Promise<Issue[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("issues")
    .select("id,title_ar,theme_ar,cover_image,issue_number,publish_date,status,created_at")
    .eq("status", "published")
    .order("publish_date", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getRecentIssues:", error.message);
    return [];
  }
  return (data ?? []) as Issue[];
}

export async function getRecentStandalones(limit = 4): Promise<Article[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .eq("status", "published")
    .is("issue_id", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getRecentStandalones:", error.message);
    return [];
  }
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const sb = await createClient();
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    decoded = slug;
  }
  const candidates = decoded === slug ? [decoded] : [decoded, slug];
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .in("slug", candidates)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getArticleBySlug:", error.message);
    return null;
  }
  return (data as Article | null) ?? null;
}

export async function getIssueWithArticles(issueNumber: number): Promise<IssueWithArticles | null> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("issues")
    .select("*, articles(*)")
    .eq("issue_number", issueNumber)
    .eq("status", "published")
    .eq("articles.status", "published")
    .order("created_at", { referencedTable: "articles", ascending: true })
    .maybeSingle();
  if (error) {
    console.error("getIssueWithArticles:", error.message);
    return null;
  }
  return (data as IssueWithArticles | null) ?? null;
}

export async function getArticlesBySection(section: string, limit = 12): Promise<Article[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("section", section)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getArticlesBySection:", error.message);
    return [];
  }
  return (data ?? []) as Article[];
}

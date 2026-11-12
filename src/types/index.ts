export type ArticleStatus = "draft" | "published";
export type SubscriptionTier = "free" | "reader" | "supporter";
export type ArticleSection = "editorial" | "geopolitics" | "economy" | "culture" | "history" | "science" | "sports" | "standalone";

export interface Issue {
  id: string;
  title_ar: string;
  theme_ar: string | null;
  cover_image: string | null;
  issue_number: number;
  publish_date: string;
  status: ArticleStatus;
  created_at: string;
  articles?: Article[];
}

export interface Article {
  id: string;
  slug: string;
  title_ar: string;
  subtitle_ar: string | null;
  body_ar: string;
  cover_image: string | null;
  section: string;
  issue_id: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string | null;
  reading_time?: number | null;
  issue?: Issue | null;
}

export type IssueWithArticles = Issue & { articles: Article[] };

export interface Subscriber {
  id: string;
  email: string;
  verified: boolean;
  created_at: string;
}

export interface SupabaseListResponse<T> {
  data: T[] | null;
  error: { message: string } | null;
  count: number | null;
}

export const SECTION_LABELS: Record<string, string> = {
  editorial: "كلمة التحرير",
  geopolitics: "السياسة الدولية",
  economy: "الاقتصاد",
  culture: "الثقافة",
  history: "التاريخ",
  science: "العلوم",
  sports: "الرياضة",
  standalone: "مقال",
};

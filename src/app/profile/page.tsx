"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, Crown, LogOut } from "lucide-react";

interface SavedArticle {
  id: string;
  article: { id: string; title_ar: string; slug: string; subtitle_ar: string | null } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; subscription_tier: string } | null>(null);
  const [saved, setSaved] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Fetch profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, subscription_tier")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setProfile(profileData);

      // Fetch saved articles
      const { data: savedData } = await supabase
        .from("saved_articles")
        .select("id, article:articles(id, title_ar, slug, subtitle_ar)")
        .eq("user_id", session.user.id);
      setSaved((savedData as any) || []);
      
      setLoading(false);
    };

    fetchUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center font-arabic-serif">جاري التحميل...</div>;

  return (
    <main className="max-w-2xl mx-auto py-16 px-6 min-h-[70vh]">
      <div className="flex items-center justify-between mb-12 border-b border-outline-variant/30 pb-6">
        <div>
          <h2 className="text-4xl font-arabic-serif font-bold text-primary mb-2">
            {profile?.display_name || "القارئ"}
          </h2>
          <p className="text-sm text-on-surface-variant font-label tracking-widest">{user?.email}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-label uppercase tracking-widest ${profile?.subscription_tier === "premium" ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface"}`}>
          <Crown size={16} />
          {profile?.subscription_tier === "premium" ? "مشترك مميّز" : "مجاني"}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-arabic-serif font-bold text-primary mb-6 flex items-center gap-3">
          <Bookmark size={24} className="text-secondary" /> المقالات المحفوظة
        </h3>
        
        {saved.length === 0 ? (
          <p className="text-on-surface-variant text-lg font-arabic-serif bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
            لم تحفظ أي مقالات بعد.
          </p>
        ) : (
          <div className="space-y-4">
            {saved.map((s) => s.article && (
              <Link key={s.id} href={`/article/${s.article.slug}`} className="block p-5 rounded-xl border border-outline-variant/30 bg-surface hover:border-primary/50 transition-colors group">
                <h4 className="text-xl font-arabic-serif font-bold text-on-surface group-hover:text-primary transition-colors">
                  {s.article.title_ar}
                </h4>
                {s.article.subtitle_ar && <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{s.article.subtitle_ar}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" className="flex items-center gap-2 font-label text-error hover:bg-error/10 hover:text-error border-error/30" onClick={handleSignOut}>
        <LogOut size={18} /> تسجيل الخروج
      </Button>
    </main>
  );
}
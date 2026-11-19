"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Check, LayoutDashboard, LogOut, Trash2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/errors";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

interface ProfileData {
  display_name: string | null;
  subscription_tier: string | null;
  role?: string | null;
}

interface SavedRow {
  id: string;
  article: {
    id: string;
    title_ar: string;
    slug: string;
    subtitle_ar: string | null;
  } | null;
}

const TIER_LABELS: Record<string, string> = {
  free: "قارئ",
  reader: "مشترك",
  supporter: "داعم",
};

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace("/login?next=/profile");
        return;
      }
      if (!active) return;
      setUser(authUser);

      const [{ data: profileData }, { data: savedData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, subscription_tier, role")
          .eq("user_id", authUser.id)
          .maybeSingle(),
        supabase
          .from("saved_articles")
          .select("id, article:articles(id, title_ar, slug, subtitle_ar)")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;
      const p = (profileData as ProfileData | null) ?? null;
      setProfile(p);
      setNameInput(p?.display_name ?? "");
      setSaved((savedData as unknown as SavedRow[]) || []);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast({ title: "الاسم مطلوب", description: "أدخل اسماً قبل الحفظ.", variant: "destructive" });
      return;
    }

    setSavingName(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);
    setSavingName(false);

    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }

    setProfile((prev) => ({ ...(prev ?? { display_name: trimmed, subscription_tier: "free" }), display_name: trimmed }));
    toast({ title: "تم تحديث اسمك" });
  };

  const removeSaved = async (rowId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("saved_articles").delete().eq("id", rowId);
    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }
    setSaved((prev) => prev.filter((item) => item.id !== rowId));
    toast({ title: "أُزيل المقال من المحفوظات" });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="section min-h-[70vh]" dir="rtl" aria-busy="true">
        <div className="wrap-narrow space-y-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="border-t border-border pt-8">
            <SkeletonText lines={4} />
          </div>
        </div>
      </main>
    );
  }

  const isEditor = profile?.role === "admin" || profile?.role === "editor";
  const tierLabel = TIER_LABELS[profile?.subscription_tier ?? "free"] ?? "قارئ";

  return (
    <main className="section min-h-[70vh] bg-background" dir="rtl">
      <div className="wrap-narrow space-y-14">
        {/* Account header */}
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-6">
          <div>
            <span className="kicker inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" aria-hidden="true" />
              <span>{tierLabel}</span>
            </span>
            <h1 className="mt-2 font-serif text-4xl font-bold text-foreground">
              {profile?.display_name || "حساب القارئ"}
            </h1>
            <p className="meta mt-1" dir="ltr">
              {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isEditor && (
              <Button variant="accent" size="sm" asChild>
                <Link href="/admin">
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  <span>لوحة التحرير</span>
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4" aria-hidden="true" />
              <span>خروج</span>
            </Button>
          </div>
        </header>

        {/* Display name form */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-foreground">الاسم المعروض</h2>
          <form onSubmit={handleSaveName} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="اسمك في بيت الحكمة" htmlFor="profile-name" className="flex-1">
              <Input
                id="profile-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="اكتب اسمك"
              />
            </Field>
            <Button type="submit" loading={savingName} className="h-12 shrink-0">
              <Check className="size-4" aria-hidden="true" />
              <span>حفظ</span>
            </Button>
          </form>
        </section>

        {/* Saved articles */}
        <section className="border-t border-border pt-10">
          <div className="section-head">
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-foreground">
              <Bookmark className="size-5 text-accent" aria-hidden="true" />
              <span>المقالات المحفوظة</span>
            </h2>
          </div>

          {saved.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="لم تحفظ أي مقالات بعد"
              description="اضغط على زر «حفظ» أثناء قراءة أي مقال لتجده هنا متى أردت العودة إليه."
              action={{ label: "تصفّح المقالات", href: "/" }}
              compact
            />
          ) : (
            <ul className="divide-y divide-border">
              {saved.map((item) =>
                item.article ? (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-5">
                    <Link href={`/article/${item.article.slug}`} className="group min-w-0 flex-1">
                      <h3 className="font-serif text-xl font-bold text-foreground transition-colors group-hover:text-accent">
                        <span className="link-underline">{item.article.title_ar}</span>
                      </h3>
                      {item.article.subtitle_ar && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                          {item.article.subtitle_ar}
                        </p>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeSaved(item.id)}
                      className="rounded p-2 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-destructive"
                      aria-label={`إزالة ${item.article.title_ar} من المحفوظات`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

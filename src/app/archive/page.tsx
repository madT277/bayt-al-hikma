import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { arNumber, formatDate } from "@/lib/format";
import { PHOTOS } from "@/lib/images";
import { EmptyState } from "@/components/ui/EmptyState";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: issues, error } = await supabase
    .from("issues")
    .select("id,issue_number,title_ar,publish_date,cover_image,theme_ar")
    .eq("status", "published")
    .order("issue_number", { ascending: false });

  if (error) console.error("Archive lookup failed:", error.message);

  return (
    <main className="section min-h-[70vh] bg-background" dir="rtl">
      <div className="wrap">
        <header className="mb-14 border-b border-foreground pb-8">
          <span className="kicker">ذاكرة المجلة</span>
          <h1 className="mt-2 font-serif text-4xl font-bold text-foreground md:text-5xl">
            أرشيف الأعداد
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            تصفّح أعداد بيت الحكمة المنشورة، وما جمعه كل عدد من مقالات وملفات معرفية.
          </p>
        </header>

        {!issues?.length ? (
          <EmptyState
            icon={BookOpen}
            title="لا توجد أعداد منشورة بعد"
            description="فور صدور العدد الأول سيظهر هنا مع كامل فهرس مقالاته."
            action={{ label: "العودة للرئيسية", href: "/" }}
            secondaryAction={{ label: "اشترك في النشرة", href: "/newsletter" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue, index) => (
              <ScrollReveal key={issue.id} delay={index * 0.05} as="article">
                <Link href={`/issue/${issue.issue_number}`} className="group block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-muted">
                    <Image
                      src={issue.cover_image || PHOTOS.issueCover}
                      alt={`غلاف العدد ${issue.issue_number}: ${issue.title_ar}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="img-zoom object-cover"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="kicker">العدد {arNumber(issue.issue_number)}</span>
                      <span className="meta">{formatDate(issue.publish_date, "month")}</span>
                    </div>
                    <h2 className="mt-2 font-serif text-2xl font-bold text-foreground transition-colors group-hover:text-accent">
                      <span className="link-underline">{issue.title_ar}</span>
                    </h2>
                    {issue.theme_ar && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {issue.theme_ar}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-accent">
                      <span>تصفّح العدد</span>
                      <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

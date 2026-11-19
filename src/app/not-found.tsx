import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, House } from "lucide-react";
import { PHOTOS } from "@/lib/images";
import { SECTIONS } from "@/lib/sections";
import { arNumber } from "@/lib/format";

export default function NotFound() {
  return (
    <main className="section bg-background" dir="rtl">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="kicker inline-flex items-center gap-1.5">
              <Compass className="size-3.5" aria-hidden="true" />
              <span>خطأ {arNumber(404)}</span>
            </span>

            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
              هذه الصفحة ليست في الرفّ الذي تبحث فيه
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              ربما نُقل المقال إلى رابط جديد، أو أن العنوان الذي أدخلته غير مكتمل. يمكنك العودة إلى
              الصفحة الرئيسية أو الانتقال مباشرة إلى أحد الأقسام.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded bg-primary px-6 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink-soft"
              >
                <House className="size-4" aria-hidden="true" />
                <span>العودة للرئيسية</span>
              </Link>
              <Link
                href="/archive"
                className="link-underline inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-accent"
              >
                <span>تصفّح أرشيف الأعداد</span>
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-12 border-t border-border pt-6">
              <p className="mb-3 text-xs font-semibold text-muted-foreground">أو ابدأ من أحد الأقسام</p>
              <div className="flex flex-wrap gap-2.5">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <Link
                      key={sec.slug}
                      href={`/category/${sec.slug}`}
                      className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      <span>{sec.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-muted">
              <Image
                src={PHOTOS.notFound}
                alt="ممر طويل لرفوف الكتب في مكتبة"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

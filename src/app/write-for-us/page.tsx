import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Feather, Mail } from "lucide-react";
import { PHOTOS } from "@/lib/images";
import { SECTIONS } from "@/lib/sections";

export const metadata: Metadata = {
  title: "اكتب معنا",
  description: "شروط وإرشادات نشر المقالات في مجلة بيت الحكمة.",
};

const GUIDELINES = [
  "أن يكون المقال أصلياً ولم يسبق نشره في منصة أخرى.",
  "أن يتراوح الطول بين ١٠٠٠ و ٢٥٠٠ كلمة، بلغة عربية سليمة وواضحة.",
  "أن يستند إلى التحليل الموضوعي وتوثيق المصادر والبيانات المذكورة.",
  "أن يُرفق بملخص قصير من سطرين وسيرة ذاتية موجزة للكاتب.",
];

export default function WriteForUsPage() {
  return (
    <main className="section bg-background" dir="rtl">
      <div className="wrap">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="kicker inline-flex items-center gap-1.5">
              <Feather className="size-3.5" aria-hidden="true" />
              <span>دعوة للكتّاب</span>
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
              اكتب معنا في بيت الحكمة
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              نبحث دائماً عن أصوات تحليلية وبحثية قادرة على تفكيك القضايا المعقدة وتقديمها بلغة
              عربية رصينة تجمع بين الصرامة المعرفية وجمال السرد.
            </p>

            <section className="mt-10 border-t border-border pt-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">ضوابط النشر</h2>
              <ul className="mt-5 space-y-3.5 text-base text-ink-soft">
                {GUIDELINES.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10 border-t border-border pt-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">الأقسام المفتوحة للمساهمات</h2>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <Link
                      key={sec.slug}
                      href={`/category/${sec.slug}`}
                      className="inline-flex items-center gap-2 rounded border border-border px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      <span>{sec.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="mt-10 border-t border-foreground/20 pt-8">
              <p className="text-sm text-muted-foreground">لإرسال المسودات أو اقتراح موضوع مقال:</p>
              <a
                href="mailto:editor@baytalhikma.com"
                className="mt-2 inline-flex items-center gap-2 font-sans text-lg font-semibold text-accent hover:underline"
                dir="ltr"
              >
                <Mail className="size-4" aria-hidden="true" />
                <span>editor@baytalhikma.com</span>
              </a>
              <p className="meta mt-2">يردّ فريق التحرير عادةً خلال ٥ إلى ٧ أيام عمل.</p>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-muted">
              <Image
                src={PHOTOS.writeForUs}
                alt="قلم حبر يكتب على ورق"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

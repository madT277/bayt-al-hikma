import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PHOTOS } from "@/lib/images";

export const metadata: Metadata = {
  title: "عن بيت الحكمة",
  description: "رسالة مجلة بيت الحكمة ورؤيتها وفريقها التحريري.",
};

export default function AboutPage() {
  return (
    <main className="section bg-background" dir="rtl">
      <article className="wrap">
        <header className="wrap-narrow !px-0">
          <span className="kicker">عن المجلة</span>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
            بيت الحكمة: مساحة عربية للقراءة المتأنية
          </h1>
          <p className="mt-5 font-serif text-xl leading-relaxed text-muted-foreground">
            نحيي تقليد المعرفة والترجمة والحوار النقدي في قالب رقمي هادئ يحترم وقت القارئ وذكاءه.
          </p>
        </header>

        <figure className="my-12">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded bg-muted">
            <Image
              src={PHOTOS.about}
              alt="رفوف مكتبة واسعة ممتلئة بالكتب"
              fill
              priority
              sizes="(min-width: 1200px) 1136px, 100vw"
              className="object-cover"
            />
          </div>
        </figure>

        <div className="wrap-narrow article-body !px-0">
          <p>
            «بيت الحكمة» مجلة عربية رقمية تسعى إلى إحياء تقاليد المعرفة العربية في قالب عصري. اسمها
            مستوحى من المؤسسة العلمية الشهيرة التي أسّسها العباسيون في بغداد، والتي كانت منارةً
            للعلم والترجمة والحوار بين الحضارات.
          </p>

          <blockquote>
            المعرفة لا حدود لها، والسعي إليها واجب إنساني يتجاوز الجغرافيا والزمان؛ نكتب للقارئ الذي
            يفضّل الفهم الهادئ على الضجيج العابر.
          </blockquote>

          <h2>رسالتنا</h2>
          <p>
            نقدّم محتوى عربياً أصيلاً يجمع بين العمق الفكري والوضوح في العرض. نؤمن بأنّ القارئ العربي
            يستحق مادة تحليلية رصينة تحترم ذكاءه وتُثري وعيه، بعيداً عن الإثارة السريعة والسطحية التي
            تسود كثيراً من المنصات الرقمية.
          </p>

          <h2>رؤيتنا</h2>
          <p>
            أن نكون مرجعاً موثوقاً للباحث عن فهم أعمق للعالم من حوله. نطمح إلى بناء مجتمع معرفي عربي
            يُقدّر القراءة المتأنية والتفكير النقدي، ويرى في التراث العربي ينبوعاً حيّاً للإلهام لا
            مجرد ذكرى ماضية.
          </p>

          <h2>فريق التحرير</h2>
          <p>
            يضمّ بيت الحكمة كتّاباً وباحثين ومحررين من مختلف أنحاء العالم العربي، يجمعهم شغف مشترك
            بالمعرفة وإيمان عميق بقدرة الكلمة الرصينة على توسيع الأفق.
          </p>
        </div>

        <footer className="wrap-narrow mt-14 flex flex-wrap items-center gap-6 border-t border-border pt-8 !px-0">
          <Link
            href="/write-for-us"
            className="inline-flex h-11 items-center gap-2 rounded bg-primary px-6 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink-soft"
          >
            <span>اكتب معنا</span>
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/archive" className="link-underline font-sans text-sm font-semibold text-accent">
            تصفّح أرشيف الأعداد
          </Link>
        </footer>
      </article>
    </main>
  );
}

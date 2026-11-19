import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Feather, Mail, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "قنوات التواصل مع إدارة وتحرير مجلة بيت الحكمة.",
};

const CHANNELS = [
  {
    icon: Mail,
    title: "الإدارة والاستفسارات العامة",
    description: "للأسئلة العامة والشراكات والتعاون المؤسسي.",
    email: "contact@baytalhikma.com",
  },
  {
    icon: Feather,
    title: "غرفة التحرير والمساهمات",
    description: "لإرسال مسودات المقالات أو التصحيحات والملاحظات التحريرية.",
    email: "editor@baytalhikma.com",
  },
  {
    icon: ShieldAlert,
    title: "الخصوصية وحقوق النشر",
    description: "للاستفسار حول البيانات الشخصية أو أذونات إعادة النشر.",
    email: "legal@baytalhikma.com",
  },
];

export default function ContactPage() {
  return (
    <main className="section min-h-[70vh] bg-background" dir="rtl">
      <div className="wrap-narrow">
        <span className="kicker">التواصل</span>
        <h1 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">
          تواصل معنا
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          نرحّب بأسئلتكم وملاحظاتكم ومقترحاتكم التحريرية. اختر القناة الأنسب لموضوع رسالتك أدناه.
        </p>

        <ul className="mt-12 divide-y divide-border border-y border-border">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <li key={ch.email} className="flex flex-col justify-between gap-4 py-7 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded border border-border text-accent">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">{ch.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{ch.description}</p>
                  </div>
                </div>
                <a
                  href={`mailto:${ch.email}`}
                  dir="ltr"
                  className="link-underline shrink-0 font-sans text-sm font-semibold text-accent"
                >
                  {ch.email}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex items-center justify-between text-sm text-muted-foreground">
          <span>هل ترغب في نشر مقال لدينا؟</span>
          <Link href="/write-for-us" className="link-underline inline-flex items-center gap-1.5 font-semibold text-accent">
            <span>اطّلع على ضوابط النشر</span>
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { SECTIONS } from "@/lib/sections";

export default function Footer() {
  const year = new Intl.NumberFormat("ar-EG", { useGrouping: false }).format(new Date().getFullYear());

  return (
    <footer className="mt-auto border-t border-foreground/20 bg-muted/40" dir="rtl">
      <div className="wrap py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Colophon */}
          <div className="md:col-span-5">
            <Link href="/" className="font-serif text-3xl font-bold text-foreground hover:text-accent">
              بيت الحكمة
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              مجلة عربية رقمية للقراءة المتأنية والتحليل المعمّق في قضايا الفكر والسياسة والاقتصاد
              والثقافة والعلوم، بعيداً عن الضجيج والعجلة.
            </p>
            <Link
              href="/newsletter"
              className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-accent hover:underline"
            >
              <Mail className="size-4" aria-hidden="true" />
              <span>اشترك في النشرة الأسبوعية</span>
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Sections */}
          <div className="md:col-span-4">
            <h2 className="font-sans text-xs font-semibold text-muted-foreground">الأقسام</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {SECTIONS.map((sec) => (
                <li key={sec.slug}>
                  <Link href={`/category/${sec.slug}`} className="link-underline text-ink-soft hover:text-foreground">
                    {sec.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Info */}
          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-semibold text-muted-foreground">عن المجلة</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/archive" className="link-underline text-ink-soft hover:text-foreground">أرشيف الأعداد</Link></li>
              <li><Link href="/about" className="link-underline text-ink-soft hover:text-foreground">من نحن</Link></li>
              <li><Link href="/write-for-us" className="link-underline text-ink-soft hover:text-foreground">اكتب معنا</Link></li>
              <li><Link href="/contact" className="link-underline text-ink-soft hover:text-foreground">تواصل معنا</Link></li>
              <li><Link href="/privacy" className="link-underline text-ink-soft hover:text-foreground">سياسة الخصوصية</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} بيت الحكمة. جميع الحقوق محفوظة.</p>
          <p>قراءة متأنية باللغة العربية</p>
        </div>
      </div>
    </footer>
  );
}

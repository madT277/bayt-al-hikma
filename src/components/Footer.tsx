import Link from "next/link";

const categories1 = [
  { label: "السياسة الدولية", slug: "geopolitics" },
  { label: "الاقتصاد",        slug: "economy" },
  { label: "الثقافة",         slug: "culture" },
];
const categories2 = [
  { label: "العلوم",          slug: "science" },
  { label: "التاريخ",         slug: "history" },
  { label: "الرياضة",         slug: "sports" },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-10 px-4 mt-auto">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-right" dir="rtl">
        <div>
          <Link href="/" className="text-xl mb-2 block font-arabic-serif font-bold text-accent">بيت الحكمة</Link>
          <p className="text-primary-foreground/70 text-sm leading-relaxed font-arabic-serif">
            مجلة عربية رقمية تسعى إلى إثراء المحتوى العربي بمقالات معمّقة وتحليلات
            شاملة. نسلّط الضوء على قضايا الفكر والثقافة والعلوم.
          </p>
          <div className="flex gap-4 mt-4 text-sm font-arabic-serif">
            <Link href="/about" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">عن المجلة</Link>
            <Link href="/archive" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">الأرشيف</Link>
            <Link href="/newsletter" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">النشرة</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-primary-foreground/80 font-arabic-serif">الأقسام</h4>
          <ul className="space-y-1.5 font-arabic-serif">
            {categories1.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-primary-foreground/80 font-arabic-serif">&nbsp;</h4>
          <ul className="space-y-1.5 font-arabic-serif">
            {categories2.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 pt-4 border-t border-primary-foreground/10 text-center font-arabic-serif">
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} بيت الحكمة. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
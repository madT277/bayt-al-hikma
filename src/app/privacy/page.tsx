import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف تتعامل مجلة بيت الحكمة مع بيانات القراء والمشتركين.",
};

export default function PrivacyPage() {
  return (
    <main className="section min-h-[70vh] bg-background" dir="rtl">
      <article className="wrap-narrow">
        <span className="kicker">الشفافية</span>
        <h1 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">
          سياسة الخصوصية
        </h1>
        <p className="meta mt-3 border-b border-border pb-6">آخر تحديث: أبريل ٢٠٢٦</p>

        <div className="article-body mt-8">
          <h2>١. البيانات التي نجمعها</h2>
          <p>
            نجمع فقط المعلومات التي تقدّمها لنا طوعاً عند إنشاء حساب قارئ (البريد الإلكتروني والاسم
            المعروض)، أو عند الاشتراك في النشرة البريدية، أو عند حفظ المقالات في قائمتك الخاصة.
          </p>

          <h2>٢. كيف نستخدم بياناتك</h2>
          <p>
            تُستخدم بياناتك لتشغيل حسابك وحفظ مقالاتك المفضلة وإرسال النشرة البريدية الأسبوعية عند
            اشتراكك فيها. لا نبيع بيانات القراء ولا نشاركها مع جهات إعلانية.
          </p>

          <h2>٣. ملفات تعريف الارتباط (Cookies)</h2>
          <p>
            نستخدم ملفات تعريف الارتباط الأساسية فقط للحفاظ على جلسة تسجيل الدخول وتفضيلات التصفح.
            يمكنك حذفها أو تقييدها في أي وقت من إعدادات متصفحك.
          </p>

          <h2>٤. حقوقك والتواصل</h2>
          <p>
            يحق لك طلب الاطلاع على بياناتك أو تعديلها أو حذف حسابك بالكامل عبر{" "}
            <Link href="/contact">صفحة التواصل معنا</Link>.
          </p>
        </div>
      </article>
    </main>
  );
}

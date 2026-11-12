import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-8 min-h-[70vh]">
      <h1 className="text-4xl font-serif text-teal border-b-2 border-gold pb-4 inline-block">سياسة الخصوصية</h1>
      
      <div className="space-y-6 text-ink-2 leading-relaxed">
        <p className="text-sm text-ink-3">آخر تحديث: أبريل 2026</p>
        
        <h2 className="text-xl font-bold text-teal mt-6">1. جمع المعلومات</h2>
        <p>نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند الاشتراك في النشرة البريدية أو عند التواصل معنا.</p>
        
        <h2 className="text-xl font-bold text-teal mt-6">2. استخدام المعلومات</h2>
        <p>نستخدم معلوماتك لتحسين تجربة المستخدم، وإرسال التحديثات الدورية عبر البريد الإلكتروني، وتحليل أداء الموقع لتطوير المحتوى.</p>
        
        <h2 className="text-xl font-bold text-teal mt-6">3. ملفات تعريف الارتباط (Cookies)</h2>
        <p>يستخدم هذا الموقع ملفات تعريف الارتباط لتحسين تجربة التصفح وتقديم إعلانات مخصصة (مثل Google AdSense). يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.</p>
      </div>
    </main>
  )
}
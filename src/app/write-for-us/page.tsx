import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'اكتب معنا',
}

export default function WriteForUsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-8 min-h-[70vh]">
      <h1 className="text-4xl font-serif text-teal border-b-2 border-gold pb-4 inline-block">اكتب معنا</h1>
      <div className="space-y-6 text-ink-2 leading-relaxed">
        <p>تبحث بيت الحكمة دائماً عن أصوات تحليلية جديدة قادرة على تفكيك القضايا المعقدة وتقديمها بلغة عربية رصينة.</p>
        
        <h2 className="text-2xl font-serif text-teal mt-8">شروط النشر</h2>
        <ul className="list-disc list-inside space-y-2 marker:text-gold">
          <li>أن يكون المقال أصلياً ولم يسبق نشره.</li>
          <li>أن يتراوح طول المقال بين 1000 و 1500 كلمة.</li>
          <li>أن يعتمد على التحليل الموضوعي وتوثيق المعلومات.</li>
        </ul>

        <div className="bg-cream-2 p-6 rounded-lg border border-border mt-8">
          <p>لإرسال المسودات، يرجى مراسلتنا على:</p>
          <a href="mailto:editor@baytalhikma.com" className="text-teal font-bold hover:underline">editor@baytalhikma.com</a>
        </div>
      </div>
    </main>
  )
}
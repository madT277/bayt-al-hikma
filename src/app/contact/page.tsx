import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تواصل معنا',
}

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 space-y-8 min-h-[70vh]">
      <h1 className="text-4xl font-serif text-teal border-b-2 border-gold pb-4 inline-block">تواصل معنا</h1>
      <p className="text-ink-2">نرحب بأسئلتكم واقتراحاتكم. يمكنكم مراسلتنا عبر البريد الإلكتروني أدناه.</p>
      
      <div className="bg-white p-8 border border-border rounded-lg text-center">
        <p className="text-lg font-bold text-teal">البريد الإلكتروني للإدارة والتحرير:</p>
        <a href="mailto:contact@baytalhikma.com" className="text-gold hover:underline text-xl mt-2 inline-block">
          contact@baytalhikma.com
        </a>
      </div>
    </main>
  )
}
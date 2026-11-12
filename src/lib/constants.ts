export const NAV_LINKS = [
  { label: 'الرئيسية', href: '/' },
  { label: 'الأعداد', href: '/issue' },
  { label: 'الأرشيف', href: '/archive' },
  { label: 'عن المجلة', href: '/about' },
  { label: 'النشرة', href: '/newsletter' },
  { label: 'تواصل معنا', href: '/contact' }
]

export const CATEGORY_LINKS = [
  { label: 'السياسة الدولية', href: '/category/geopolitics' },
  { label: 'الاقتصاد', href: '/category/economy' },
  { label: 'الثقافة', href: '/category/culture' },
  { label: 'العلوم', href: '/category/science' },
  { label: 'التاريخ', href: '/category/history' },
  { label: 'الرياضة', href: '/category/sports' }
]

export const SECTION_LABELS: Record<string, string> = {
  geopolitics: 'السياسة الدولية',
  economy: 'الاقتصاد',
  culture: 'الثقافة',
  science: 'العلوم',
  history: 'التاريخ',
  sports: 'الرياضة',
  editorial: 'التحرير'
};
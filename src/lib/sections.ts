import {
  Feather,
  FlaskConical,
  Globe,
  Newspaper,
  Palette,
  ScrollText,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface SectionDef {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Index into the categorical `data-*` palette (1–6). Used only in comparisons. */
  color: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Public sections, in navigation order. */
export const SECTIONS: SectionDef[] = [
  {
    slug: "geopolitics",
    label: "السياسة الدولية",
    description: "قراءات في موازين القوى والتحولات الجيوسياسية وما وراء الأخبار.",
    icon: Globe,
    color: 1,
  },
  {
    slug: "economy",
    label: "الاقتصاد",
    description: "الاقتصاد السياسي والتنمية والأسواق، بلغة يفهمها غير المتخصص.",
    icon: TrendingUp,
    color: 2,
  },
  {
    slug: "culture",
    label: "الثقافة",
    description: "الأدب والفنون والأفكار التي تشكّل وعينا المعاصر.",
    icon: Palette,
    color: 3,
  },
  {
    slug: "science",
    label: "العلوم",
    description: "البحث العلمي والتقنيات الناشئة وأسئلتها الفلسفية.",
    icon: FlaskConical,
    color: 4,
  },
  {
    slug: "history",
    label: "التاريخ",
    description: "إعادة قراءة التاريخ العربي والعالمي بعين ناقدة.",
    icon: ScrollText,
    color: 5,
  },
  {
    slug: "sports",
    label: "الرياضة",
    description: "الرياضة بوصفها ظاهرة ثقافية واقتصادية واجتماعية.",
    icon: Trophy,
    color: 6,
  },
];

const EXTRA: SectionDef[] = [
  { slug: "editorial", label: "كلمة التحرير", description: "افتتاحية العدد.", icon: Feather, color: 6 },
  { slug: "standalone", label: "مقال", description: "مقالات خارج الأعداد الدورية.", icon: Newspaper, color: 6 },
];

const ALL = [...SECTIONS, ...EXTRA];

export function getSection(slug: string | null | undefined): SectionDef | undefined {
  return ALL.find((section) => section.slug === slug);
}

export function sectionLabel(slug: string | null | undefined): string {
  return getSection(slug)?.label ?? "مقال";
}

/** CSS colour for a section in charts/legends. */
export function sectionColor(slug: string | null | undefined): string {
  return `hsl(var(--data-${getSection(slug)?.color ?? 6}))`;
}

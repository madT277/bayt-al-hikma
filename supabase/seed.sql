-- =============================================================================
-- Bayt Al-Hikma (بيت الحكمة) — Sample Seed Script
-- File: supabase/seed.sql
--
-- Populates:
--   1. Categories lookup table (matching the app's sections)
--   2. Sample Issue #1 ("القوة الناعمة") with verified photography & clean date
--   3. Two full Arabic sample articles linked to Issue #1 (including a
--      multi-column comparison table to showcase the editorial comparison styles)
--
-- Safe to run multiple times (idempotent ON CONFLICT upserts).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Categories table
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  slug          text primary key,
  label_ar      text not null,
  description_ar text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

insert into public.categories (slug, label_ar, description_ar, display_order)
values
  ('editorial',   'كلمة التحرير',     'افتتاحيات المجلة ورؤيتها الفكرية', 1),
  ('geopolitics', 'السياسة الدولية',  'تحليلات معمقة في العلاقات الدولية والتحولات الجيوسياسية', 2),
  ('economy',     'الاقتصاد',         'قراءات في الاقتصاد السياسي والتنمية والأسواق العالمية', 3),
  ('culture',     'الثقافة',          'نقد أدبي وفني ومسارات الفكر المعاصر', 4),
  ('science',     'العلوم',           'آفاق البحث العلمي والتقنيات الناشئة وفلسفة العلوم', 5),
  ('history',     'التاريخ',          'إعادة قراءة التاريخ العربي والعالمي بمنظور نقدي', 6),
  ('sports',      'الرياضة',          'الرياضة بوصفها ظاهرة ثقافية واجتماعية واقتصادية', 7),
  ('standalone',  'مقال مستقل',       'مقالات رأي وتحليلات يومية خارج الأعداد الدورية', 8)
on conflict (slug) do update set
  label_ar       = excluded.label_ar,
  description_ar = excluded.description_ar,
  display_order  = excluded.display_order;

-- -----------------------------------------------------------------------------
-- 2. Sample Issue #1 (verified real photography + clean ISO publish_date)
-- -----------------------------------------------------------------------------
insert into public.issues (issue_number, title_ar, theme_ar, publish_date, cover_image, status)
values (
  1,
  'القوة الناعمة',
  'كيف تشكّل الثقافة والمعرفة والرواية الإعلامية موازين القوى في القرن الحادي والعشرين',
  '2026-04-16',
  'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1400&q=80',
  'published'
)
on conflict (issue_number) do update set
  title_ar     = coalesce(nullif(public.issues.title_ar, ''), excluded.title_ar),
  theme_ar     = coalesce(public.issues.theme_ar, excluded.theme_ar),
  publish_date = '2026-04-16',
  cover_image  = coalesce(public.issues.cover_image, excluded.cover_image),
  status       = 'published';

-- -----------------------------------------------------------------------------
-- 3. Two Sample Arabic Articles (linked to Issue #1)
-- -----------------------------------------------------------------------------
with target_issue as (
  select id from public.issues where issue_number = 1 limit 1
)
insert into public.articles (
  slug,
  title_ar,
  subtitle_ar,
  body_ar,
  cover_image,
  section,
  issue_id,
  status,
  author_name,
  published_at
)
values
  (
    'cultural-diplomacy-digital-age',
    'الدبلوماسية الثقافية في العصر الرقمي: من بيت الحكمة إلى الفضاء السيبراني',
    'قراءة في تحوّل أدوات التأثير المعرفي وكيف تعيد المنصات الرقمية صياغة الذاكرة الجمعية للشعوب.',
    '<h2>المعرفة بوصفها قوة ناعمة عابرة للحدود</h2>'
    || '<p>لم تكن القوة في التاريخ الإنساني يوماً مجرّد تفوّق عسكري أو هيمنة اقتصادية صلبة؛ بل كانت في جوهرها قدرةً على صياغة المعنى وتصدير النموذج الحضاري. وحين تأسس «بيت الحكمة» في بغداد، لم يكن مجرّد خزانة للكتب، بل كان مركز ثقلٍ معرفي جذب العلماء والمترجمين والفلاسفة من مختلف الحواضر.</p>'
    || '<blockquote>إن الأمم التي تكتفي باستيراد أدوات التفكير دون المساهمة في إنتاجها تظلّ على هامش السردية العالمية مهما بلغت ثرواتها المادية.</blockquote>'
    || '<h2>مقارنة بين ثلاث مراحل للتأثير الثقافي</h2>'
    || '<table><thead><tr><th>المعيار</th><th>عصر المخطوطة</th><th>عصر الطباعة</th><th>العصر الرقمي</th></tr></thead>'
    || '<tbody>'
    || '<tr><td>سرعة الانتشار</td><td>بطيئة ومحدودة بالنُسّاخ</td><td>إقليمية عبر الصحف والكتب</td><td>فورية وعابرة للحدود</td></tr>'
    || '<tr><td>الفاعل الرئيسي</td><td>المؤسسات العلمية والوقفية</td><td>دور النشر والدول الوطنية</td><td>المنصات والمجتمعات المعرفية</td></tr>'
    || '<tr><td>التحدي الأكبر</td><td>الندرة وكلفة النقل</td><td>الرقابة وتكلفة التوزيع</td><td>السطحية وتشتت الانتباه</td></tr>'
    || '</tbody></table>'
    || '<p>من هنا تبرز أهمية بناء منصات فكرية عربية تجمع بين عمق التحليل الأكاديمي وجمالية السرد الصحفي، لتقديم قراءة نقدية متوازنة للتحولات الكبرى في السياسة والاقتصاد والثقافة.</p>',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1400&q=80',
    'culture',
    (select id from target_issue),
    'published',
    'د. ليلى المنصور',
    now() - interval '1 day'
  ),
  (
    'knowledge-economy-arab-world',
    'اقتصاد المعرفة والتحول الهيكلي في المشرق العربي',
    'لماذا يرتبط مستقبل التنمية الاقتصادية بتمويل البحث العلمي وحاضنات الابتكار المحلي؟',
    '<h2>ما بعد الاقتصاد الريعي</h2>'
    || '<p>تشهد الاقتصادات العربية نقاشاً متصاعداً حول سبل تنويع مصادر الدخل والانتقال من نماذج الاستهلاك والريع إلى اقتصاد الإنتاج المعرفي. ولا يقتصر هذا التحول على استيراد التقنيات الحديثة، بل يتطلب بنيةً مؤسسيةً تربط الجامعات ومراكز الأبحاث بالقطاعات الإنتاجية.</p>'
    || '<blockquote>الاستثمار في العقل البشري والبنية التحتية الرقمية هو الضمانة الوحيدة لتحقيق سيادة اقتصادية مستدامة في زمن الذكاء الاصطناعي.</blockquote>'
    || '<h2>ثلاث ركائز للنهوض الاقتصادي المعرفي</h2>'
    || '<ul><li>توطين البحث والتطوير في القطاعات الحيوية كالطاقة المتجددة والتقنيات الحيوية.</li><li>تحديث التشريعات الاقتصادية لدعم الشركات الناشئة وحماية الملكية الفكرية.</li><li>بناء شبكات تعاون علمي عربي مشترك يقلل من هجرة الكفاءات.</li></ul>'
    || '<p>إن تجارب الدول التي حققت قفزات تنموية خلال العقود الثلاثة الماضية تؤكد أن رأس المال المعرفي يتراكم ببطء، لكنه متى بلغ الكتلة الحرجة أحدث تحولاً مضاعفاً في النمو والإنتاجية.</p>',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    'economy',
    (select id from target_issue),
    'published',
    'د. طارق العبدالله',
    now() - interval '2 hours'
  )
on conflict (slug) do update set
  title_ar     = excluded.title_ar,
  subtitle_ar  = excluded.subtitle_ar,
  body_ar      = excluded.body_ar,
  cover_image  = excluded.cover_image,
  section      = excluded.section,
  issue_id     = excluded.issue_id,
  status       = excluded.status,
  author_name  = excluded.author_name,
  published_at = excluded.published_at;

commit;

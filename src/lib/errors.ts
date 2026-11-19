/**
 * Turns Supabase / Postgres / network errors into specific Arabic messages
 * a reader can act on. Never show raw English error strings in the UI.
 */
export interface FriendlyError {
  title: string;
  description: string;
}

type AnyError = { message?: string; code?: string; status?: number; name?: string } | null | undefined;

export function describeError(error: AnyError | unknown, context?: string): FriendlyError {
  const e = (error ?? {}) as { message?: string; code?: string; status?: number; name?: string };
  const message = (e.message ?? "").toLowerCase();
  const code = e.code ?? "";

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      title: "لا يوجد اتصال بالإنترنت",
      description: "يبدو أنك غير متصل. تحقّق من الشبكة، وسنحتفظ بما كتبته حتى تعيد المحاولة.",
    };
  }
  if (message.includes("failed to fetch") || message.includes("networkerror") || message.includes("load failed")) {
    return {
      title: "تعذّر الوصول إلى الخادم",
      description: "انقطع الاتصال أثناء الطلب. أعد المحاولة بعد لحظات.",
    };
  }

  // Auth
  if (message.includes("invalid login credentials")) {
    return { title: "بيانات الدخول غير صحيحة", description: "تأكّد من البريد الإلكتروني وكلمة المرور، مع مراعاة الأحرف الكبيرة والصغيرة." };
  }
  if (message.includes("email not confirmed")) {
    return { title: "البريد غير مؤكَّد بعد", description: "افتح رسالة التأكيد التي أرسلناها إلى بريدك، ثم سجّل الدخول." };
  }
  if (message.includes("user already registered") || message.includes("already been registered")) {
    return { title: "هذا البريد مسجَّل مسبقاً", description: "لديك حساب بهذا البريد. جرّب تسجيل الدخول بدلاً من إنشاء حساب جديد." };
  }
  if (message.includes("password should be at least") || message.includes("weak password")) {
    return { title: "كلمة المرور قصيرة", description: "استخدم ٨ أحرف على الأقل، ويفضّل أن تمزج بين الحروف والأرقام." };
  }
  if (message.includes("unable to validate email") || message.includes("invalid email")) {
    return { title: "صيغة البريد غير صحيحة", description: "اكتب البريد بالشكل name@example.com." };
  }
  if (message.includes("rate limit") || e.status === 429) {
    return { title: "محاولات كثيرة متتالية", description: "انتظر دقيقة واحدة ثم حاول مجدداً." };
  }
  if (message.includes("jwt expired") || message.includes("refresh token")) {
    return { title: "انتهت جلستك", description: "سجّل الدخول مرة أخرى لمتابعة ما كنت تفعله." };
  }

  // Postgres / PostgREST
  if (code === "23505") {
    if (context === "newsletter") {
      return { title: "أنت مشترك بالفعل", description: "هذا البريد موجود في قائمة النشرة، وستصلك الأعداد الجديدة عليه." };
    }
    if (context === "save") {
      return { title: "المقال محفوظ مسبقاً", description: "تجده في صفحة حسابك ضمن المقالات المحفوظة." };
    }
    return { title: "القيمة مستخدمة مسبقاً", description: "يوجد سجل بالقيمة نفسها. غيّر العنوان أو الرقم وأعد الحفظ." };
  }
  if (code === "42501" || message.includes("row-level security") || message.includes("permission denied")) {
    return { title: "ليست لديك صلاحية", description: "هذا الإجراء متاح للمحررين فقط. إن كنت محرراً، سجّل الخروج ثم الدخول من جديد." };
  }
  if (code === "23502") {
    return { title: "حقل مطلوب فارغ", description: "أكمل الحقول الأساسية (مثل العنوان) ثم أعد الحفظ." };
  }
  if (code === "22P02" || code === "22007") {
    return { title: "قيمة بصيغة غير صحيحة", description: "تحقّق من الأرقام والتواريخ المدخلة." };
  }
  if (code === "42703" || code === "PGRST204") {
    return { title: "قاعدة البيانات بحاجة إلى تحديث", description: "أحد الحقول غير موجود في الجدول. شغّل ملف الترحيل الأخير في Supabase." };
  }

  // Storage
  if (message.includes("payload too large") || message.includes("exceeded the maximum allowed size")) {
    return { title: "الصورة كبيرة جداً", description: "الحد الأقصى ٥ ميغابايت. صغّر الصورة أو احفظها بصيغة JPG." };
  }
  if (message.includes("bucket not found")) {
    return { title: "مخزن الصور غير مهيّأ", description: "أنشئ مخزن article-images في Supabase Storage." };
  }

  return {
    title: "لم تكتمل العملية",
    description: code
      ? `حدث خطأ غير متوقع (الرمز ${code}). أعد المحاولة، وإن تكرر فراسلنا مع هذا الرمز.`
      : "حدث خطأ غير متوقع. أعد المحاولة بعد قليل.",
  };
}

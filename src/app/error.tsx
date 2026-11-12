"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-5 text-center" dir="rtl">
      <h2 className="font-arabic-serif text-2xl font-bold text-primary">حدث خطأ غير متوقع</h2>
      <p className="max-w-lg leading-8 text-muted-foreground">تعذر تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.</p>
      <button onClick={reset} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-secondary hover:text-primary">
        حاول مرة أخرى
      </button>
    </div>
  );
}

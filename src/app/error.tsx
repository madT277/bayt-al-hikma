"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, RefreshCw, TriangleAlert } from "lucide-react";
import { describeError } from "@/lib/errors";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  const friendly = describeError(error);

  return (
    <main className="section bg-background" dir="rtl">
      <div className="wrap-narrow text-center">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-destructive/30 bg-danger-soft text-destructive">
          <TriangleAlert className="size-6" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <span className="kicker text-destructive">تعذّر عرض الصفحة</span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">
          {friendly.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          {friendly.description}
        </p>

        {error.digest && (
          <p className="meta mt-4">
            مرجع العطل: <code className="rounded bg-muted px-2 py-0.5 text-foreground">{error.digest}</code>
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCw className="size-4" aria-hidden="true" />
            <span>إعادة المحاولة</span>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <House className="size-4" aria-hidden="true" />
              <span>الصفحة الرئيسية</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

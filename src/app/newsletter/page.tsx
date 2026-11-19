"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleCheck, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/errors";
import { PHOTOS } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setErrorText("أدخل بريداً إلكترونياً صحيحاً، مثل name@example.com.");
      return;
    }

    setLoading(true);
    setErrorText(null);

    const supabase = createClient();
    const { error } = await supabase.from("subscribers").insert({ email: cleaned });
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setSubscribedEmail(cleaned);
        setEmail("");
        return;
      }
      setErrorText(describeError(error, "newsletter").description);
      return;
    }

    setSubscribedEmail(cleaned);
    setEmail("");
  };

  return (
    <main className="section min-h-[70vh] bg-background" dir="rtl">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="kicker inline-flex items-center gap-1.5">
              <Mail className="size-3.5" aria-hidden="true" />
              <span>النشرة البريدية</span>
            </span>

            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
              ملخّص أسبوعي لأهم ما يُنشر في بيت الحكمة
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              رسالة واحدة في نهاية كل أسبوع تضم أحدث المقالات والتحليلات المعمّقة وإشعاراً عند صدور
              كل عدد جديد. بلا إعلانات وبلا إزعاج.
            </p>

            {subscribedEmail ? (
              <div className="mt-8 rounded border border-success/30 bg-success-soft p-6">
                <div className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">تم تسجيل اشتراكك</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      سيصل العدد القادم إلى <span dir="ltr" className="font-semibold">{subscribedEmail}</span>.
                    </p>
                    <Link
                      href="/"
                      className="link-underline mt-4 inline-block font-sans text-xs font-semibold text-accent"
                    >
                      العودة إلى المقالات
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-md space-y-4">
                <Field
                  label="البريد الإلكتروني"
                  htmlFor="newsletter-email"
                  error={errorText}
                  hint="نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت."
                >
                  <Input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorText) setErrorText(null);
                    }}
                    aria-invalid={Boolean(errorText)}
                  />
                </Field>

                <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full sm:w-auto">
                  {loading ? "جاري التسجيل..." : "اشترك في النشرة"}
                </Button>
              </form>
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-muted">
              <Image
                src={PHOTOS.newsletter}
                alt="كتاب مفتوح وفنجان قهوة للقراءة الصباحية"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

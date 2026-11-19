"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleAlert, CircleCheck, Eye, EyeOff, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/errors";
import { PHOTOS } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<{ title: string; description: string } | null>(null);
  const [created, setCreated] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorBanner({ title: "الاسم مطلوب", description: "اكتب الاسم الذي تود أن يظهر في حسابك." });
      return;
    }
    if (password.length < 8) {
      setErrorBanner({ title: "كلمة المرور قصيرة", description: "اختر كلمة مرور من ٨ أحرف على الأقل." });
      return;
    }

    setLoading(true);
    setErrorBanner(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });

    setLoading(false);
    if (error) {
      setErrorBanner(describeError(error));
      return;
    }

    setCreated(true);
  };

  return (
    <main className="section min-h-[75vh] bg-background" dir="rtl">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="kicker inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" aria-hidden="true" />
              <span>عضوية القارئ</span>
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">إنشاء حساب جديد</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              احفظ المقالات التي تهمّك وابنِ مكتبتك الخاصة داخل بيت الحكمة.
            </p>

            {created ? (
              <div className="mt-8 rounded border border-success/30 bg-success-soft p-6">
                <div className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">تم إنشاء حسابك بنجاح</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      تحقّق من بريدك الإلكتروني إن طُلب التأكيد، أو انتقل مباشرة لتسجيل الدخول.
                    </p>
                    <Link
                      href="/login"
                      className="mt-5 inline-flex h-10 items-center rounded bg-primary px-5 font-sans text-xs font-semibold text-primary-foreground transition-colors hover:bg-ink-soft"
                    >
                      الانتقال لتسجيل الدخول
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {errorBanner && (
                  <div
                    role="alert"
                    className="mt-6 flex items-start gap-3 rounded border border-destructive/30 bg-danger-soft p-4 text-destructive"
                  >
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <div className="text-xs leading-relaxed">
                      <p className="font-semibold">{errorBanner.title}</p>
                      <p className="mt-0.5 opacity-90">{errorBanner.description}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSignup} noValidate className="mt-8 space-y-5">
                  <Field label="الاسم الكامل" htmlFor="signup-name">
                    <Input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="مثال: سارة العلي"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </Field>

                  <Field label="البريد الإلكتروني" htmlFor="signup-email">
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  <Field
                    label="كلمة المرور"
                    htmlFor="signup-password"
                    hint="٨ أحرف على الأقل."
                  >
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="اختر كلمة مرور قوية"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>

                  <Button type="submit" size="lg" loading={loading} className="w-full">
                    {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                  </Button>
                </form>

                <p className="mt-6 text-sm text-muted-foreground">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/login" className="link-underline font-semibold text-accent">
                    سجّل دخولك
                  </Link>
                </p>
              </>
            )}
          </div>

          <div className="hidden lg:col-span-7 lg:block">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-muted">
              <Image
                src={PHOTOS.auth}
                alt="صفحات كتب مفتوحة"
                fill
                priority
                sizes="58vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

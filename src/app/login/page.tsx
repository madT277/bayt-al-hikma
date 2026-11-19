"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/errors";
import { PHOTOS } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<{ title: string; description: string } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorBanner({
        title: "أكمل بيانات الدخول",
        description: "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة.",
      });
      return;
    }

    setLoading(true);
    setErrorBanner(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      setErrorBanner(describeError(error));
      return;
    }

    let target = nextPath && nextPath.startsWith("/") ? nextPath : null;
    if (!target && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();
      const isEditor = profile?.role === "admin" || profile?.role === "editor";
      target = isEditor ? "/admin" : "/profile";
    }

    router.push(target || "/");
    router.refresh();
  };

  return (
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

      <form onSubmit={handleLogin} noValidate className="mt-8 space-y-5">
        <Field label="البريد الإلكتروني" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="كلمة المرور" htmlFor="login-password">
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="أدخل كلمة المرور"
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
          {loading ? "جاري تسجيل الدخول..." : "دخول"}
        </Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="section min-h-[75vh] bg-background" dir="rtl">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="kicker inline-flex items-center gap-1.5">
              <LogIn className="size-3.5" aria-hidden="true" />
              <span>حساب القارئ</span>
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">تسجيل الدخول</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ادخل إلى حسابك للوصول إلى مقالاتك المحفوظة أو لوحة التحرير.
            </p>

            <Suspense
              fallback={
                <div className="mt-8 space-y-5">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>

            <p className="mt-6 text-sm text-muted-foreground">
              ليس لديك حساب بعد؟{" "}
              <Link href="/signup" className="link-underline font-semibold text-accent">
                أنشئ حساباً جديداً
              </Link>
            </p>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    setLoading(false);
    
    if (error) {
      alert("خطأ في التسجيل: " + error.message);
    } else {
      alert("تم إنشاء الحساب! يمكنك الآن تسجيل الدخول.");
      router.push("/login");
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full bg-surface-container-low p-8 rounded-xl border border-outline-variant/30 shadow-sm">
        <h2 className="text-3xl font-arabic-serif font-bold text-primary text-center mb-8">إنشاء حساب جديد</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            type="text"
            required
            placeholder="الاسم الكامل"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="text-right font-arabic-serif h-12"
            dir="rtl"
          />
          <Input
            type="email"
            required
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-right font-arabic-serif h-12"
            dir="rtl"
          />
          <Input
            type="password"
            required
            minLength={6}
            placeholder="كلمة المرور (٦ أحرف على الأقل)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-right font-arabic-serif h-12"
            dir="rtl"
          />
          <Button type="submit" className="w-full h-12 text-lg font-arabic-serif" disabled={loading}>
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </Button>
        </form>
        <p className="text-sm text-on-surface-variant font-label tracking-widest text-center mt-6">
          لديك حساب بالفعل؟ <Link href="/login" className="text-secondary hover:underline">سجّل دخولك</Link>
        </p>
      </div>
    </main>
  );
}
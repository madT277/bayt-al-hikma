"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      setErrorMsg("خطأ في تسجيل الدخول: تحقق من البريد وكلمة المرور.");
    } else {
      router.push("/admin"); // Instantly sends you to the dashboard!
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full bg-surface-container-low p-8 rounded-xl border border-outline-variant/30 shadow-sm">
        <h2 className="text-3xl font-arabic-serif font-bold text-primary text-center mb-8">تسجيل الدخول</h2>
        
        {errorMsg && <p className="text-error text-sm text-center mb-4 font-label">{errorMsg}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
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
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-right font-arabic-serif h-12"
            dir="rtl"
          />
          <Button type="submit" className="w-full h-12 text-lg font-arabic-serif" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
      </div>
    </main>
  );
}
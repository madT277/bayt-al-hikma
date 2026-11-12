"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FileText, Users, BookOpen, PenLine } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, subscribers: 0, issues: 0 });
  const supabase = createClient();

  useEffect(() => {
    Promise.all([
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("subscribers").select("id", { count: "exact", head: true }), // FIX: Using subscribers table
      supabase.from("issues").select("id", { count: "exact", head: true }),
    ]).then(([a, s, i]) => {
      setStats({
        articles: a.count || 0,
        subscribers: s.count || 0,
        issues: i.count || 0,
      });
    });
  }, [supabase]);

  return (
    <main className="flex-1 container mx-auto py-10 px-4 max-w-screen-xl" dir="rtl">
      <h2 className="text-3xl text-[#003434] font-arabic-serif font-bold border-b border-border pb-3 mb-8">
        لوحة التحكم
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<FileText />} label="المقالات المنشورة" value={stats.articles} />
        <StatCard icon={<Users />} label="المشتركون" value={stats.subscribers} />
        <StatCard icon={<BookOpen />} label="الأعداد" value={stats.issues} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/write" className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group">
          <div className="p-3 bg-[#E5B95F]/20 rounded-lg text-[#003434] group-hover:bg-[#E5B95F] transition-colors">
            <PenLine size={28} />
          </div>
          <div>
            <h3 className="text-foreground text-xl font-arabic-serif font-bold mb-1">كتابة مقال جديد</h3>
            <p className="text-sm text-muted-foreground font-arabic-serif">أنشئ وانشر مقالًا جديدًا</p>
          </div>
        </Link>
        
        <Link href="/admin/issues" className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group">
          <div className="p-3 bg-[#E5B95F]/20 rounded-lg text-[#003434] group-hover:bg-[#E5B95F] transition-colors">
            <BookOpen size={28} />
          </div>
          <div>
            <h3 className="text-foreground text-xl font-arabic-serif font-bold mb-1">إدارة الأعداد</h3>
            <p className="text-sm text-muted-foreground font-arabic-serif">أنشئ وأدِر أعداد المجلة</p>
          </div>
        </Link>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card text-center shadow-sm">
      <div className="flex justify-center text-[#E5B95F] mb-3 scale-150">{icon}</div>
      <p className="text-4xl font-bold text-[#003434] mb-1">{value}</p>
      <p className="text-sm text-muted-foreground font-arabic-serif">{label}</p>
    </div>
  );
}
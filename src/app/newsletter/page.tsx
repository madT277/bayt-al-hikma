"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("subscribers").insert({ email });
    setLoading(false);
    
    if (error) {
      if (error.code === "23505") {
        toast({ title: "هذا البريد مسجّل بالفعل!", description: "أنت مشترك في النشرة." });
      } else {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "تم الاشتراك بنجاح!", description: "شكرًا لانضمامك إلى نشرة بيت الحكمة." });
    }
    setEmail("");
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="text-accent" size={28} />
        </div>
        <h2 className="text-3xl text-foreground mb-3 font-arabic-serif font-bold">النشرة البريدية</h2>
        <p className="text-muted-foreground leading-relaxed mb-8 font-arabic-serif">
          اشترك في نشرة بيت الحكمة لتصلك أحدث المقالات والتحليلات المعمّقة مباشرةً إلى بريدك الإلكتروني كل أسبوع.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="أدخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 text-right h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-arabic-serif"
          />
          <button type="submit" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors font-arabic-serif" disabled={loading}>
            {loading ? "جاري الاشتراك..." : "اشترك الآن"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 font-arabic-serif">
          نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.
        </p>
      </div>
    </main>
  );
}
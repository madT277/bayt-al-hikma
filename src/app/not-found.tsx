import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center py-32 px-6">
      <div className="text-center max-w-md">
        <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-muted-foreground" size={40} />
        </div>
        <h1 className="text-7xl font-arabic-serif font-bold text-foreground mb-4">404</h1>
        <h2 className="text-3xl font-arabic-serif font-bold text-foreground mb-6">هذه الصفحة غير موجودة</h2>
        <p className="text-muted-foreground font-arabic-serif mb-10 leading-relaxed">
          يبدو أنك وصلت إلى رابط غير صحيح، أو أن الصفحة التي تبحث عنها قد تم نقلها.
        </p>
        <Link 
          href="/" 
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-arabic-serif font-bold hover:bg-primary/90 transition-colors inline-block"
        >
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
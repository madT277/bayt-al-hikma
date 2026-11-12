"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Upload, Plus, X, Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Table as TableIcon, ImagePlus, Undo, Redo, Save, PenLine, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { value: "geopolitics", label: "السياسة الدولية" },
  { value: "economy", label: "الاقتصاد" },
  { value: "culture", label: "الثقافة" },
  { value: "science", label: "العلوم" },
  { value: "history", label: "التاريخ" },
  { value: "sports", label: "الرياضة" },
];

const slugify = (s: string) =>
  s.trim().replace(/\s+/g, "-").replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "").toLowerCase() || `article-${Date.now()}`;

export default function IssuesWorkspacePage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [issues, setIssues] = useState<any[]>([]);
  const [activeIssue, setActiveIssue] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);

  const [form, setForm] = useState({
    title_ar: "", theme_ar: "", issue_number: 1,
    publish_date: new Date().toISOString().split("T")[0],
    status: "draft" as "draft" | "published",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [savingIssue, setSavingIssue] = useState(false);

  const [artTitle, setArtTitle] = useState("");
  const [artSubtitle, setArtSubtitle] = useState("");
  const [artAuthor, setArtAuthor] = useState("فريق التحرير");
  const [artSection, setArtSection] = useState("geopolitics");
  const [artCoverFile, setArtCoverFile] = useState<File | null>(null);
  const [artCoverPreview, setArtCoverPreview] = useState<string | null>(null);
  const [savingArticle, setSavingArticle] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "rounded-xl my-4 mx-auto max-w-full" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-4 text-right" } }),
      TableRow, TableHeader, TableCell,
      Placeholder.configure({ placeholder: "اكتب المقال هنا…" }),
    ],
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "prose prose-lg max-w-none min-h-[400px] p-6 text-right leading-loose focus:outline-none " +
          "prose-headings:font-bold prose-blockquote:border-r-4 prose-blockquote:border-[#E5B95F] " +
          "prose-blockquote:pr-4 prose-blockquote:italic [&_table]:border [&_th]:border [&_td]:border " +
          "[&_th]:bg-[#003434]/5 [&_th]:p-2 [&_td]:p-2",
      },
    },
  });

  const loadIssues = useCallback(async () => {
    const { data } = await supabase.from("issues").select("*").order("issue_number", { ascending: false });
    setIssues(data || []);
  }, [supabase]);

  const loadArticles = useCallback(async (issueId: string) => {
    const { data } = await supabase.from("articles").select("*").eq("issue_id", issueId).order("created_at", { ascending: false });
    setArticles(data || []);
  }, [supabase]);

  useEffect(() => { loadIssues(); }, [loadIssues]);
  useEffect(() => { if (activeIssue) loadArticles(activeIssue.id); }, [activeIssue, loadArticles]);

  const selectIssue = (issue: any) => {
    setActiveIssue(issue);
    setForm({
      title_ar: issue.title_ar, theme_ar: issue.theme_ar || "",
      issue_number: issue.issue_number, publish_date: issue.publish_date,
      status: issue.status,
    });
    setCoverPreview(issue.cover_image);
    setCoverFile(null);
  };

  const newIssue = () => {
    setActiveIssue(null);
    setForm({ title_ar: "", theme_ar: "", issue_number: (Math.max(0, ...issues.map((issue) => Number(issue.issue_number) || 0)) + 1), publish_date: new Date().toISOString().split("T")[0], status: "draft" });
    setCoverPreview(null); setCoverFile(null); setArticles([]);
  };

  const saveIssue = async () => {
    if (!form.title_ar.trim()) return toast({ title: "عنوان العدد مطلوب", variant: "destructive" });
    setSavingIssue(true);

    let coverUrl = activeIssue?.cover_image || null;
    if (coverFile) {
      const path = `issue-covers/${Date.now()}-${coverFile.name}`;
      const { error } = await supabase.storage.from("article-images").upload(path, coverFile);
      if (!error) coverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
    }

    const payload = { ...form, cover_image: coverUrl };
    const { data, error } = activeIssue
      ? await supabase.from("issues").update(payload).eq("id", activeIssue.id).select().single()
      : await supabase.from("issues").insert(payload).select().single();

    setSavingIssue(false);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });

    toast({ title: "تم حفظ العدد بنجاح" });
    await loadIssues();
    setActiveIssue(data);
  };

  const openArticleModal = (article: any | null = null) => {
    setEditingArticle(article);
    if (article) {
      setArtTitle(article.title_ar); setArtSubtitle(article.subtitle_ar || "");
      setArtAuthor(article.author_name || "فريق التحرير"); setArtSection(article.section);
      setArtCoverPreview(article.cover_image); editor?.commands.setContent(article.body_ar || "");
    } else {
      setArtTitle(""); setArtSubtitle(""); setArtAuthor("فريق التحرير"); setArtSection("geopolitics");
      setArtCoverPreview(null); editor?.commands.setContent("");
    }
    setArtCoverFile(null);
    setModalOpen(true);
  };

  const saveArticle = async (status: "draft" | "published") => {
    if (!artTitle.trim()) return toast({ title: "عنوان المقال مطلوب", variant: "destructive" });
    if (!activeIssue?.id) return toast({ title: "اختر عدداً أولاً", variant: "destructive" });
    setSavingArticle(true);

    let coverUrl = editingArticle?.cover_image || null;
    if (artCoverFile) {
      const path = `covers/${Date.now()}-${artCoverFile.name}`;
      const { error } = await supabase.storage.from("article-images").upload(path, artCoverFile);
      if (!error) coverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      title_ar: artTitle, slug: slugify(artTitle), subtitle_ar: artSubtitle || null,
      body_ar: editor?.getHTML() || "", cover_image: coverUrl, section: artSection,
      issue_id: activeIssue.id, status, author_name: artAuthor,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { error } = editingArticle
      ? await supabase.from("articles").update(payload).eq("id", editingArticle.id)
      : await supabase.from("articles").insert(payload);

    setSavingArticle(false);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });

    toast({ title: "تم حفظ المقال بنجاح" });
    loadArticles(activeIssue.id);
    setModalOpen(false);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    await supabase.from("articles").delete().eq("id", id);
    loadArticles(activeIssue.id);
  };

  const insertImage = () => {
    const url = prompt("أدخل رابط الصورة:");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  };
  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const ToolbarBtn = ({ icon: Icon, onClick, active }: any) => (
    <button type="button" onClick={onClick} className={`p-2 rounded hover:bg-muted ${active ? "bg-muted text-accent" : "text-muted-foreground"}`}>
      <Icon size={18} />
    </button>
  );

  return <div className="flex min-h-screen bg-background" dir="rtl">

    <aside className="w-80 border-l border-border bg-card p-6 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <button onClick={newIssue} className="w-full flex items-center justify-center gap-2 bg-[#003434] text-white py-3 rounded-lg font-bold mb-6 font-arabic-serif">
        <Plus size={18} /> تأسيس عدد جديد
      </button>
      <div className="space-y-3">
        {issues.map(i => (
          <button key={i.id} onClick={() => selectIssue(i)} className={`w-full text-right p-4 rounded-xl border transition-all ${activeIssue?.id === i.id ? "border-[#E5B95F] bg-[#E5B95F]/10 shadow-sm" : "border-border hover:bg-muted/50"}`}>
            <div className="text-sm font-bold text-[#003434] font-arabic-serif mb-1">العدد {i.issue_number}</div>
            <div className="text-lg text-foreground font-arabic-serif truncate">{i.title_ar}</div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-muted-foreground">{i.publish_date}</span>
              <span className={`text-[10px] px-2 py-1 rounded-full ${i.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {i.status === "published" ? "منشور" : "مسودة"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>

    <main className="flex-1 p-8 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">

        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-[#003434] font-arabic-serif mb-6 border-b border-border pb-4">
            {activeIssue ? "تعديل العدد" : "إعدادات العدد الجديد"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">عنوان العدد</label>
                <input value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} className="w-full h-12 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-arabic-serif" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">موضوع العدد (اختياري)</label>
                <input value={form.theme_ar} onChange={e => setForm({ ...form, theme_ar: e.target.value })} className="w-full h-12 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-arabic-serif" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">رقم العدد</label>
                  <input type="number" value={form.issue_number} onChange={e => setForm({ ...form, issue_number: Number(e.target.value) })} className="w-full h-12 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-arabic-serif" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">تاريخ النشر</label>
                  <input type="date" value={form.publish_date} onChange={e => setForm({ ...form, publish_date: e.target.value })} className="w-full h-12 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-arabic-serif" />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={() => setForm({ ...form, status: "draft" })} className={`flex-1 py-2 rounded-lg font-bold font-arabic-serif border ${form.status === "draft" ? "bg-muted text-foreground border-border" : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"}`}>مسودة</button>
                <button onClick={() => setForm({ ...form, status: "published" })} className={`flex-1 py-2 rounded-lg font-bold font-arabic-serif border ${form.status === "published" ? "bg-green-100 text-green-800 border-green-200" : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"}`}>نشر العدد</button>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">غلاف العدد</label>
              {coverPreview ? (
                <div className="relative flex-1 rounded-xl overflow-hidden border border-border min-h-[250px]">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <button onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500"><X size={16} /></button>
                </div>
              ) : (
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#E5B95F] bg-[#E5B95F]/5 rounded-xl cursor-pointer hover:bg-[#E5B95F]/10 transition-colors min-h-[250px]">
                  <Upload className="text-[#003434] mb-3" size={32} />
                  <span className="text-[#003434] font-bold font-arabic-serif">اضغط لرفع الغلاف</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setCoverFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])); } }} />
                </label>
              )}
            </div>
          </div>
          <button onClick={saveIssue} disabled={savingIssue} className="w-full mt-8 bg-[#003434] text-[#F7F5F0] h-14 rounded-lg font-bold font-arabic-serif text-lg hover:bg-[#003434]/90 transition-colors">
            {savingIssue ? "جاري الحفظ..." : "حفظ بيانات العدد"}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground font-arabic-serif">مقالات العدد {activeIssue ? `(${articles.length})` : ""}</h3>
          <button onClick={() => openArticleModal()} disabled={!activeIssue} className="bg-[#E5B95F] text-[#003434] px-6 py-2.5 rounded-lg font-bold font-arabic-serif hover:bg-[#E5B95F]/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            <Plus size={18} /> أضف مقالاً جديداً
          </button>
        </div>

        {!activeIssue ? (
          <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground font-arabic-serif">يرجى حفظ العدد أولاً لتتمكن من إضافة المقالات.</div>
        ) : articles.length === 0 ? (
          <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground font-arabic-serif">لا توجد مقالات في هذا العدد حتى الآن.</div>
        ) : (
          <div className="space-y-4">
            {articles.map(a => (
              <div key={a.id} className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow transition-shadow">
                {a.cover_image ? (
                  <img src={a.cover_image} alt={a.title_ar} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0"><span className="text-xs text-muted-foreground">صورة</span></div>
                )}
                <div className="flex-1 overflow-hidden">
                  <span className="text-xs font-bold text-[#E5B95F] font-arabic-serif mb-1 block">{SECTIONS.find(s => s.value === a.section)?.label || a.section}</span>
                  <h4 className="text-lg font-bold text-foreground font-arabic-serif truncate">{a.title_ar}</h4>
                  <p className="text-sm text-muted-foreground font-arabic-serif truncate">{a.author_name}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openArticleModal(a)} className="p-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-colors"><PenLine size={18} /></button>
                  <button onClick={() => deleteArticle(a.id)} className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>

    {modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8" dir="rtl">
        <div className="bg-background w-full max-w-6xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95">

          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <h2 className="text-2xl font-bold text-[#003434] font-arabic-serif">{editingArticle ? "تعديل المقال" : "مقال جديد ضمن العدد"}</h2>
            <div className="flex items-center gap-4">
              <button onClick={() => saveArticle("draft")} disabled={savingArticle} className="px-6 py-2.5 border border-border rounded-lg font-bold font-arabic-serif hover:bg-muted transition-colors">
                حفظ كمسودة
              </button>
              <button onClick={() => saveArticle("published")} disabled={savingArticle} className="px-6 py-2.5 bg-[#E5B95F] text-[#003434] rounded-lg font-bold font-arabic-serif hover:bg-[#E5B95F]/90 transition-colors">
                حفظ ونشر المقال
              </button>
              <button onClick={() => setModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full ml-4"><X size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="space-y-6 lg:col-span-1">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">القسم</label>
                <select value={artSection} onChange={e => setArtSection(e.target.value)} className="w-full h-12 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-arabic-serif bg-background">
                  {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">اسم الكاتب</label>
                <input value={artAuthor} onChange={e => setArtAuthor(e.target.value)} className="w-full h-12 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-arabic-serif" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2 font-arabic-serif">صورة المقال (اختياري)</label>
                {artCoverPreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
                    <img src={artCoverPreview} className="w-full h-full object-cover" alt="Article Cover" />
                    <button onClick={() => { setArtCoverFile(null); setArtCoverPreview(null) }} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500"><X size={16} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="text-muted-foreground mb-2" size={24} />
                    <span className="text-sm font-arabic-serif text-muted-foreground">ارفع صورة المقال</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setArtCoverFile(e.target.files[0]); setArtCoverPreview(URL.createObjectURL(e.target.files[0])); } }} />
                  </label>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <input value={artTitle} onChange={e => setArtTitle(e.target.value)} placeholder="عنوان المقال الرئيسي" className="w-full text-4xl font-bold border-0 bg-transparent focus:outline-none placeholder:text-muted font-arabic-serif" />
              <input value={artSubtitle} onChange={e => setArtSubtitle(e.target.value)} placeholder="عنوان فرعي أو ملخص (اختياري)" className="w-full text-xl text-muted-foreground border-0 bg-transparent focus:outline-none placeholder:text-muted font-arabic-serif mb-4" />

              <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-muted/80 backdrop-blur border border-border rounded-t-xl">
                <ToolbarBtn icon={TableIcon} onClick={insertTable} />
                <ToolbarBtn icon={ImagePlus} onClick={insertImage} />
                <div className="w-px h-6 bg-border mx-2" />
                <ToolbarBtn icon={Bold} onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} />
                <ToolbarBtn icon={Italic} onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} />
                <ToolbarBtn icon={Heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} />
                <ToolbarBtn icon={Heading3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} />
                <div className="w-px h-6 bg-border mx-2" />
                <ToolbarBtn icon={ListOrdered} onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} />
                <ToolbarBtn icon={List} onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} />
                <ToolbarBtn icon={Quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} />
                <div className="w-px h-6 bg-border mx-2" />
                <ToolbarBtn icon={Undo} onClick={() => editor?.chain().focus().undo().run()} />
                <ToolbarBtn icon={Redo} onClick={() => editor?.chain().focus().redo().run()} />
              </div>

              <div className="border border-t-0 border-border rounded-b-xl bg-card min-h-[400px]">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>;
}
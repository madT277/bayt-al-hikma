"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Upload, X, Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Table as TableIcon, ImagePlus, Undo, Redo
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

export default function StandaloneWritePage() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("فريق التحرير");
  const [section, setSection] = useState("culture");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "rounded-xl my-8 mx-auto max-w-full" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-8 text-right" } }),
      TableRow, TableHeader, TableCell,
      Placeholder.configure({ placeholder: "ابدأ كتابة المقال هنا..." }),
    ],
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "prose prose-xl max-w-[800px] mx-auto min-h-[60vh] py-8 text-right leading-loose focus:outline-none " +
               "prose-headings:font-bold prose-blockquote:border-r-4 prose-blockquote:border-[#E5B95F] " +
               "prose-blockquote:pr-4 prose-blockquote:italic [&_table]:border [&_th]:border [&_td]:border " +
               "[&_th]:bg-[#003434]/5 [&_th]:p-2 [&_td]:p-2",
      },
    },
  });

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertImage = useCallback(async () => {
    const url = prompt("أدخل رابط الصورة (URL):");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) return toast({ title: "العنوان مطلوب", variant: "destructive" });
    if (!editor) return;
    setSaving(true);

    let coverUrl: string | null = null;
    if (coverFile) {
      const path = `covers/${Date.now()}-${coverFile.name}`;
      const { error } = await supabase.storage.from("article-images").upload(path, coverFile);
      if (!error) coverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("articles").insert({
      title_ar: title,
      slug: slugify(title),
      subtitle_ar: subtitle || null,
      body_ar: editor.getHTML(),
      cover_image: coverUrl,
      section,
      issue_id: null,
      status,
      author_name: author,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    setSaving(false);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    
    toast({ title: status === "published" ? "تم نشر المقال!" : "تم الحفظ كمسودة!" });
    router.push("/admin");
  };

  const ToolbarBtn = ({ icon: Icon, onClick, active }: any) => (
    <button type="button" onClick={onClick} className={`p-2 rounded hover:bg-muted ${active ? "bg-muted text-accent" : "text-muted-foreground"}`}>
      <Icon size={20} />
    </button>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-40 bg-card border-b border-border py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-bold font-arabic-serif">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            مقال مستقل · يومي
          </div>
          <select value={section} onChange={e => setSection(e.target.value)} className="px-4 py-2 border border-input rounded-lg font-arabic-serif text-sm bg-background">
            {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave("draft")} disabled={saving} className="px-6 py-2 border border-border rounded-lg font-bold font-arabic-serif hover:bg-muted transition-colors">
            {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
          </button>
          <button onClick={() => handleSave("published")} disabled={saving} className="px-6 py-2 bg-[#E5B95F] text-[#003434] rounded-lg font-bold font-arabic-serif hover:bg-[#E5B95F]/90 transition-colors shadow-sm">
            نشر الآن
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-12">
          {coverPreview ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-md">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <button onClick={() => {setCoverFile(null); setCoverPreview(null);}} className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-red-500 transition-colors"><X size={20}/></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-2xl cursor-pointer hover:bg-muted/30 transition-colors group">
              <Upload className="text-muted-foreground mb-4 group-hover:text-accent transition-colors" size={40} />
              <span className="text-lg font-arabic-serif text-muted-foreground group-hover:text-foreground transition-colors">أضف صورة غلاف رئيسية للمقال</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => { if(e.target.files?.[0]) { setCoverFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])); } }} />
            </label>
          )}
        </div>

        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="العنوان الرئيسي للمقال..." className="w-full text-5xl md:text-6xl font-bold border-0 bg-transparent focus:outline-none placeholder:text-muted font-arabic-serif leading-tight mb-6" />
        <input value={subtitle} onChange={e=>setSubtitle(e.target.value)} placeholder="اكتب ملخصاً جذاباً أو عنواناً فرعياً (اختياري)..." className="w-full text-2xl text-muted-foreground border-0 bg-transparent focus:outline-none placeholder:text-muted/50 font-arabic-serif mb-8" />
        
        <div className="flex items-center gap-3 border-b border-border pb-8 mb-8">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold font-arabic-serif">{author.charAt(0)}</div>
          <input value={author} onChange={e=>setAuthor(e.target.value)} className="text-lg font-bold text-foreground border-0 bg-transparent focus:outline-none font-arabic-serif" />
        </div>

        {editor && (
          <div className="sticky top-20 z-30 flex flex-wrap items-center justify-center gap-1 p-2 bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-sm mb-8 w-fit mx-auto">
            <ToolbarBtn icon={TableIcon} onClick={insertTable} />
            <ToolbarBtn icon={ImagePlus} onClick={insertImage} />
            <div className="w-px h-6 bg-border mx-2" />
            <ToolbarBtn icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
            <ToolbarBtn icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
            <ToolbarBtn icon={Heading2} onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive("heading",{level:2})} />
            <ToolbarBtn icon={Heading3} onClick={() => editor.chain().focus().toggleHeading({level:3}).run()} active={editor.isActive("heading",{level:3})} />
            <div className="w-px h-6 bg-border mx-2" />
            <ToolbarBtn icon={ListOrdered} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
            <ToolbarBtn icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
            <ToolbarBtn icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
            <div className="w-px h-6 bg-border mx-2" />
            <ToolbarBtn icon={Undo} onClick={() => editor.chain().focus().undo().run()} />
            <ToolbarBtn icon={Redo} onClick={() => editor.chain().focus().redo().run()} />
          </div>
        )}

        <EditorContent editor={editor} />
      </main>
    </div>
  );
}
"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Table as TableIcon,
  Undo,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SECTIONS } from "@/lib/sections";
import { describeError } from "@/lib/errors";
import { arNumber, readingTimeLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";

const slugify = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .toLowerCase() || `article-${Date.now()}`;

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
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension.configure({ HTMLAttributes: { class: "rounded my-8 mx-auto max-w-full" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-8 text-right" } }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "ابدأ كتابة المقال هنا..." }),
    ],
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "article-body min-h-[55vh] py-6 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText().trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
    },
  });

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertImage = useCallback(() => {
    const url = prompt("أدخل رابط الصورة (https://...):");
    if (url?.trim()) editor?.chain().focus().setImage({ src: url.trim() }).run();
  }, [editor]);

  const generateUniqueSlug = async (rawTitle: string): Promise<string> => {
    const baseSlug = slugify(rawTitle);
    const { data: existing } = await supabase
      .from("articles")
      .select("slug")
      .like("slug", `${baseSlug}%`);

    const usedSlugs = new Set((existing ?? []).map((row) => row.slug));
    if (!usedSlugs.has(baseSlug)) return baseSlug;

    let suffix = 2;
    while (usedSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
    return `${baseSlug}-${suffix}`;
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      toast({
        title: "عنوان المقال مطلوب",
        description: "اكتب عنواناً رئيسياً قبل حفظ المقال أو نشره.",
        variant: "destructive",
      });
      return;
    }
    if (!editor) return;
    setSaving(true);

    let coverUrl: string | null = null;
    if (coverFile) {
      const path = `covers/${Date.now()}-${coverFile.name}`;
      const { error: uploadError } = await supabase.storage.from("article-images").upload(path, coverFile);
      if (uploadError) {
        setSaving(false);
        toast({ ...describeError(uploadError), variant: "destructive" });
        return;
      }
      coverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
    }

    const basePayload = {
      title_ar: title.trim(),
      subtitle_ar: subtitle.trim() || null,
      body_ar: editor.getHTML(),
      cover_image: coverUrl,
      section,
      issue_id: null,
      status,
      author_name: author.trim() || "فريق التحرير",
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const uniqueSlug = await generateUniqueSlug(title);
    let { error } = await supabase.from("articles").insert({
      ...basePayload,
      slug: uniqueSlug,
    });

    if (error && (error.code === "23505" || error.message.toLowerCase().includes("slug"))) {
      const fallbackSlug = `${slugify(title)}-${Date.now().toString(36).slice(-5)}`;
      const retry = await supabase.from("articles").insert({
        ...basePayload,
        slug: fallbackSlug,
      });
      error = retry.error;
    }

    setSaving(false);
    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }

    toast({
      title: status === "published" ? "تم نشر المقال بنجاح" : "تم حفظ المسودة",
      description: status === "published" ? "أصبح المقال متاحاً للقراء الآن." : "يمكنك متابعة تحريره لاحقاً.",
    });
    router.push("/admin");
  };

  const estMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sticky editor action bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
              <span>لوحة التحكم</span>
            </Link>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <select
              aria-label="قسم المقال"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-9 rounded border border-input bg-card px-3 font-sans text-xs font-medium text-foreground focus:border-accent focus:outline-none"
            >
              {SECTIONS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="meta hidden sm:inline">
              {arNumber(wordCount)} كلمة · {readingTimeLabel(estMinutes)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")} loading={saving}>
              حفظ كمسودة
            </Button>
            <Button variant="accent" size="sm" onClick={() => handleSave("published")} loading={saving}>
              نشر المقال
            </Button>
          </div>
        </div>
      </div>

      <main className="wrap-narrow py-12">
        {/* Cover upload */}
        <div className="mb-10">
          {coverPreview ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="معاينة الغلاف" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
                aria-label="إزالة صورة الغلاف"
                className="absolute right-3 top-3 rounded bg-foreground/80 p-2 text-background transition-colors hover:bg-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <label className="group flex aspect-[16/7] w-full cursor-pointer flex-col items-center justify-center rounded border border-dashed border-input bg-card transition-colors hover:border-accent">
              <Upload className="mb-2 size-6 text-muted-foreground transition-colors group-hover:text-accent" aria-hidden="true" />
              <span className="font-sans text-sm font-medium text-muted-foreground group-hover:text-foreground">
                أضف صورة غلاف للمقال (اختياري)
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setCoverFile(e.target.files[0]);
                    setCoverPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </label>
          )}
        </div>

        {/* Title, subtitle, author */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="العنوان الرئيسي للمقال..."
          className="mb-4 w-full border-0 bg-transparent font-serif text-4xl font-bold leading-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none md:text-5xl"
        />

        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="عنوان فرعي أو ملخص موجز (اختياري)..."
          className="mb-6 w-full border-0 bg-transparent font-serif text-xl text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />

        <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
          <label htmlFor="author-input" className="meta shrink-0">
            بقلم:
          </label>
          <input
            id="author-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border-0 bg-transparent font-sans text-sm font-semibold text-foreground focus:outline-none"
          />
        </div>

        {/* Formatting toolbar */}
        {editor && (
          <div className="sticky top-16 z-20 mb-6 flex flex-wrap items-center gap-1 rounded border border-border bg-card/95 p-1.5 backdrop-blur-sm">
            <ToolbarBtn label="جدول مقارنة" icon={TableIcon} onClick={insertTable} />
            <ToolbarBtn label="إدراج صورة" icon={ImagePlus} onClick={insertImage} />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <ToolbarBtn label="عريض" icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
            <ToolbarBtn label="مائل" icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
            <ToolbarBtn label="عنوان رئيسي" icon={Heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} />
            <ToolbarBtn label="عنوان فرعي" icon={Heading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <ToolbarBtn label="قائمة مرقمة" icon={ListOrdered} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
            <ToolbarBtn label="قائمة نقطية" icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
            <ToolbarBtn label="اقتباس" icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <ToolbarBtn label="تراجع" icon={Undo} onClick={() => editor.chain().focus().undo().run()} />
            <ToolbarBtn label="إعادة" icon={Redo} onClick={() => editor.chain().focus().redo().run()} />
          </div>
        )}

        <EditorContent editor={editor} />
      </main>
    </div>
  );
}

function ToolbarBtn({
  icon: Icon,
  onClick,
  active,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`rounded p-2 transition-colors ${
        active
          ? "bg-accent-soft text-accent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}

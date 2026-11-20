"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Link2,
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface IssueOption {
  id: string;
  issue_number: number;
  title_ar: string;
  status: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function slugify(input: string): string {
  const cleaned = input
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return cleaned || `article-${Date.now()}`;
}

/** Supabase Storage rejects Arabic characters and spaces in object keys. */
function safeStoragePath(folder: string, file: File): string {
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ext = /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${folder}/${Date.now()}-${rand}.${ext}`;
}

function WriteEditorInner() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();

  const [issues, setIssues] = useState<IssueOption[]>([]);
  const [loadingArticle, setLoadingArticle] = useState(Boolean(editId));
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("فريق التحرير");
  const [section, setSection] = useState("culture");
  const [issueId, setIssueId] = useState<string>("");

  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
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

  // Load issues for the Issue dropdown
  useEffect(() => {
    let active = true;
    supabase
      .from("issues")
      .select("id, issue_number, title_ar, status")
      .order("issue_number", { ascending: false })
      .then(({ data }) => {
        if (active && data) setIssues(data as IssueOption[]);
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  // If editing an existing article (?edit=<id>), load it into the form
  useEffect(() => {
    if (!editId || !editor) return;
    let active = true;
    setLoadingArticle(true);

    supabase
      .from("articles")
      .select("*")
      .eq("id", editId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        setLoadingArticle(false);
        if (error || !data) {
          toast({
            title: "تعذّر فتح المقال للتعديل",
            description: error ? describeError(error).description : "لم يُعثر على هذا المقال.",
            variant: "destructive",
          });
          return;
        }
        setTitle(data.title_ar || "");
        setSubtitle(data.subtitle_ar || "");
        setAuthor(data.author_name || "فريق التحرير");
        setSection(data.section || "culture");
        setIssueId(data.issue_id || "");
        setEditingSlug(data.slug || null);
        if (data.cover_image) {
          setCoverPreview(data.cover_image);
          setCoverUrlInput(data.cover_image);
        }
        editor.commands.setContent(data.body_ar || "");
        const text = editor.getText().trim();
        setWordCount(text ? text.split(/\s+/).length : 0);
      });

    return () => {
      active = false;
    };
  }, [editId, editor, supabase, toast]);

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertImage = useCallback(() => {
    const url = prompt("أدخل رابط الصورة (يبدأ بـ https://):");
    const trimmed = url?.trim();
    if (!trimmed) return;
    if (!/^https:\/\//i.test(trimmed)) {
      toast({
        title: "رابط الصورة غير صالح",
        description: "تأكّد من أن الرابط يبدأ بـ https:// ثم أعد المحاولة.",
        variant: "destructive",
      });
      return;
    }
    editor?.chain().focus().setImage({ src: trimmed }).run();
  }, [editor, toast]);

  const handleCoverFileChange = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "الملف ليس صورة",
        description: "اختر ملف صورة بصيغة JPG أو PNG أو WebP.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast({
        title: "حجم الصورة كبير جداً",
        description: "الحد الأقصى لحجم صورة الغلاف هو ٥ ميغابايت.",
        variant: "destructive",
      });
      return;
    }
    setCoverFile(file);
    setCoverUrlInput("");
    setCoverPreview(URL.createObjectURL(file));
  };

  const applyCoverUrl = () => {
    const trimmed = coverUrlInput.trim();
    if (!trimmed) return;
    if (!/^https:\/\//i.test(trimmed)) {
      toast({
        title: "رابط الصورة غير صالح",
        description: "يجب أن يبدأ رابط الصورة بـ https://",
        variant: "destructive",
      });
      return;
    }
    setCoverFile(null);
    setCoverPreview(trimmed);
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverUrlInput("");
    setCoverPreview(null);
  };

  const generateUniqueSlug = async (rawTitle: string, excludeId?: string | null): Promise<string> => {
    const baseSlug = slugify(rawTitle);
    const { data: existing } = await supabase
      .from("articles")
      .select("id, slug")
      .like("slug", `${baseSlug}%`);

    const usedSlugs = new Set(
      (existing ?? [])
        .filter((row) => row.id !== excludeId)
        .map((row) => row.slug),
    );
    if (!usedSlugs.has(baseSlug)) return baseSlug;

    let suffix = 2;
    while (usedSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
    return `${baseSlug}-${suffix}`;
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      toast({
        title: "عنوان المقال مطلوب",
        description: "اكتب عنواناً رئيسياً قبل الحفظ أو النشر.",
        variant: "destructive",
      });
      return;
    }
    if (!editor) return;

    const bodyHtml = editor.getHTML();
    if (status === "published" && !editor.getText().trim()) {
      toast({
        title: "نص المقال فارغ",
        description: "اكتب فقرة واحدة على الأقل قبل نشر المقال للقراء.",
        variant: "destructive",
      });
      return;
    }

    // Validate pasted URL if user typed one without clicking preview
    let finalCoverUrl: string | null = coverPreview && /^https:\/\//i.test(coverPreview) ? coverPreview : null;
    if (coverMode === "url" && coverUrlInput.trim() && !coverFile) {
      if (!/^https:\/\//i.test(coverUrlInput.trim())) {
        toast({
          title: "رابط صورة الغلاف غير صالح",
          description: "يجب أن يبدأ الرابط بـ https:// أو اتركه فارغاً.",
          variant: "destructive",
        });
        return;
      }
      finalCoverUrl = coverUrlInput.trim();
    }

    setSaving(true);

    if (coverFile) {
      const path = safeStoragePath("covers", coverFile);
      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(path, coverFile, { contentType: coverFile.type });

      if (uploadError) {
        setSaving(false);
        toast({ ...describeError(uploadError), variant: "destructive" });
        return;
      }
      finalCoverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
    }

    const basePayload = {
      title_ar: title.trim(),
      subtitle_ar: subtitle.trim() || null,
      body_ar: bodyHtml,
      cover_image: finalCoverUrl,
      section,
      issue_id: issueId || null,
      status,
      author_name: author.trim() || "فريق التحرير",
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    let finalSlug = editId && editingSlug ? editingSlug : await generateUniqueSlug(title, editId);

    const writeRow = (slugValue: string) =>
      editId
        ? supabase.from("articles").update({ ...basePayload, slug: slugValue }).eq("id", editId)
        : supabase.from("articles").insert({ ...basePayload, slug: slugValue });

    let { error } = await writeRow(finalSlug);

    if (error && (error.code === "23505" || error.message.toLowerCase().includes("slug"))) {
      finalSlug = `${slugify(title)}-${Date.now().toString(36).slice(-5)}`;
      const retry = await writeRow(finalSlug);
      error = retry.error;
    }

    setSaving(false);
    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }

    toast({
      title: status === "published" ? "تم نشر المقال بنجاح" : "تم حفظ المسودة",
      description:
        status === "published"
          ? "سيتم فتح المقال الآن كما يراه القراء."
          : "يمكنك العودة إليه لاحقاً من لوحة التحكم.",
    });

    if (status === "published") {
      router.push(`/article/${encodeURIComponent(finalSlug)}`);
    } else {
      router.push("/admin");
    }
    router.refresh();
  };

  const estMinutes = Math.max(1, Math.ceil(wordCount / 200));

  if (loadingArticle) {
    return (
      <main className="wrap-narrow space-y-6 py-14" dir="rtl" aria-busy="true">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="aspect-[16/7] w-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sticky editor action bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
              <span>لوحة التحكم</span>
            </Link>

            <span className="h-4 w-px bg-border" aria-hidden="true" />

            {/* Section selector */}
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
              <option value="editorial">كلمة التحرير</option>
            </select>

            {/* Issue selector */}
            <select
              aria-label="العدد المرتبط"
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              className="h-9 max-w-[210px] rounded border border-input bg-card px-3 font-sans text-xs font-medium text-foreground focus:border-accent focus:outline-none"
            >
              <option value="">مقال مستقل (بدون عدد)</option>
              {issues.map((iss) => (
                <option key={iss.id} value={iss.id}>
                  العدد {arNumber(iss.issue_number)} — {iss.title_ar}
                </option>
              ))}
            </select>

            <span className="meta hidden md:inline">
              {arNumber(wordCount)} كلمة · {readingTimeLabel(estMinutes)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")} loading={saving}>
              حفظ كمسودة
            </Button>
            <Button variant="accent" size="sm" onClick={() => handleSave("published")} loading={saving}>
              {editId ? "حفظ التعديلات ونشر" : "نشر المقال"}
            </Button>
          </div>
        </div>
      </div>

      <main className="wrap-narrow py-12">
        {/* Cover photo picker: upload OR paste link */}
        <div className="mb-10 space-y-3">
          {!coverPreview && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCoverMode("upload")}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
                  coverMode === "upload"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="size-3.5" aria-hidden="true" />
                <span>رفع صورة من جهازك</span>
              </button>
              <button
                type="button"
                onClick={() => setCoverMode("url")}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
                  coverMode === "url"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 className="size-3.5" aria-hidden="true" />
                <span>لصق رابط صورة</span>
              </button>
            </div>
          )}

          {coverPreview ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview}
                alt="معاينة صورة الغلاف"
                className="h-full w-full object-cover"
                onError={() => {
                  toast({
                    title: "لم نتمكن من عرض الصورة",
                    description: "تحقّق من أن الرابط يؤدي مباشرة إلى ملف صورة صالح.",
                    variant: "destructive",
                  });
                }}
              />
              <button
                type="button"
                onClick={clearCover}
                aria-label="إزالة صورة الغلاف"
                className="absolute right-3 top-3 rounded bg-foreground/80 p-2 text-background transition-colors hover:bg-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : coverMode === "upload" ? (
            <label className="group flex aspect-[16/6] w-full cursor-pointer flex-col items-center justify-center rounded border border-dashed border-input bg-card px-4 text-center transition-colors hover:border-accent">
              <Upload className="mb-2 size-6 text-muted-foreground transition-colors group-hover:text-accent" aria-hidden="true" />
              <span className="font-sans text-sm font-medium text-muted-foreground group-hover:text-foreground">
                اضغط لاختيار صورة الغلاف (JPG أو PNG — حتى ٥ ميغابايت)
              </span>
              <span className="meta mt-1">إن تركتها فارغة، سيُستخدم غلاف افتراضي مناسب للقسم.</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCoverFileChange(e.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-2 rounded border border-border bg-card p-4 sm:flex-row">
              <Input
                type="url"
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={applyCoverUrl} className="h-12 shrink-0">
                معاينة الصورة
              </Button>
            </div>
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
            <ToolbarBtn label="إدراج جدول مقارنة" icon={TableIcon} onClick={insertTable} />
            <ToolbarBtn label="إدراج صورة داخل المقال" icon={ImagePlus} onClick={insertImage} />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <ToolbarBtn label="نص عريض" icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
            <ToolbarBtn label="نص مائل" icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
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

export default function StandaloneWritePage() {
  return (
    <Suspense
      fallback={
        <main className="wrap-narrow space-y-6 py-14" dir="rtl">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="aspect-[16/7] w-full" />
          <Skeleton className="h-40 w-full" />
        </main>
      }
    >
      <WriteEditorInner />
    </Suspense>
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

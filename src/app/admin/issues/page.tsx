"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  BookOpen,
  ChartColumn,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Newspaper,
  PenLine,
  Plus,
  Quote,
  Redo,
  Table as TableIcon,
  Trash2,
  Undo,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SECTIONS, sectionLabel } from "@/lib/sections";
import { describeError } from "@/lib/errors";
import { arNumber, formatDate, parseDate } from "@/lib/format";
import { encodeBlockPayload, isValidChartData, type ChartBlockData } from "@/lib/editorial-blocks/types";
import {
  EditorialBlockExtension,
  createEditorialBlockNode,
} from "@/components/editorial-blocks/EditorialBlockExtension";
import { ChartBlockModal } from "@/components/editorial-blocks/ChartBlockModal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface IssueRecord {
  id: string;
  title_ar: string;
  theme_ar: string | null;
  issue_number: number;
  publish_date: string;
  cover_image: string | null;
  status: "draft" | "published";
}

interface ArticleRecord {
  id: string;
  title_ar: string;
  slug: string;
  subtitle_ar: string | null;
  body_ar: string;
  cover_image: string | null;
  section: string;
  author_name: string | null;
  status: "draft" | "published";
}

const slugify = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || `article-${Date.now()}`;

function safeStoragePath(folder: string, file: File): string {
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ext = /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${folder}/${Date.now()}-${rand}.${ext}`;
}

function toDateInputValue(raw: string | null | undefined): string {
  const parsed = parseDate(raw);
  if (!parsed) return new Date().toISOString().split("T")[0];
  return parsed.toISOString().split("T")[0];
}

export default function IssuesWorkspacePage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [activeIssue, setActiveIssue] = useState<IssueRecord | null>(null);
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleRecord | null>(null);

  const [form, setForm] = useState({
    title_ar: "",
    theme_ar: "",
    issue_number: 1,
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

  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [editingBlockPos, setEditingBlockPos] = useState<number | null>(null);
  const [editingChartData, setEditingChartData] = useState<ChartBlockData | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension.configure({ HTMLAttributes: { class: "rounded my-4 mx-auto max-w-full" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-4 text-right" } }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "اكتب المقال هنا..." }),
      EditorialBlockExtension.configure({
        onEditBlock: ({ pos, blockType, payload }) => {
          if (blockType === "chart" && isValidChartData(payload)) {
            setEditingBlockPos(pos);
            setEditingChartData(payload);
            setChartModalOpen(true);
          }
        },
      }),
    ],
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "article-body min-h-[380px] p-5 focus:outline-none",
      },
    },
  });

  const handleSaveChartBlock = (data: ChartBlockData) => {
    if (!editor) return;
    if (editingBlockPos !== null) {
      const { tr } = editor.state;
      tr.setNodeMarkup(editingBlockPos, undefined, {
        blockType: "chart",
        payload: encodeBlockPayload(data),
      });
      editor.view.dispatch(tr);
    } else {
      editor
        .chain()
        .focus()
        .insertContent([createEditorialBlockNode("chart", data), { type: "paragraph" }])
        .run();
    }
    setChartModalOpen(false);
    setEditingBlockPos(null);
    setEditingChartData(null);
  };

  const loadIssues = useCallback(async () => {
    setLoadingIssues(true);
    const { data, error } = await supabase.from("issues").select("*").order("issue_number", { ascending: false });
    setLoadingIssues(false);
    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }
    setIssues((data as IssueRecord[]) || []);
  }, [supabase, toast]);

  const loadArticles = useCallback(
    async (issueId: string) => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("issue_id", issueId)
        .order("created_at", { ascending: false });
      if (error) {
        toast({ ...describeError(error), variant: "destructive" });
        return;
      }
      setArticles((data as ArticleRecord[]) || []);
    },
    [supabase, toast],
  );

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    if (activeIssue) loadArticles(activeIssue.id);
  }, [activeIssue, loadArticles]);

  const selectIssue = (issue: IssueRecord) => {
    setActiveIssue(issue);
    setForm({
      title_ar: issue.title_ar,
      theme_ar: issue.theme_ar || "",
      issue_number: Number(issue.issue_number) || 1,
      publish_date: toDateInputValue(issue.publish_date),
      status: issue.status,
    });
    setCoverPreview(issue.cover_image);
    setCoverFile(null);
  };

  const newIssue = () => {
    setActiveIssue(null);
    const nextNum = Math.max(0, ...issues.map((i) => Number(i.issue_number) || 0)) + 1;
    setForm({
      title_ar: "",
      theme_ar: "",
      issue_number: nextNum,
      publish_date: new Date().toISOString().split("T")[0],
      status: "draft",
    });
    setCoverPreview(null);
    setCoverFile(null);
    setArticles([]);
  };

  const saveIssue = async () => {
    if (!form.title_ar.trim()) {
      toast({ title: "عنوان العدد مطلوب", variant: "destructive" });
      return;
    }
    setSavingIssue(true);

    let coverUrl = activeIssue?.cover_image || null;
    if (coverFile) {
      const path = safeStoragePath("issue-covers", coverFile);
      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(path, coverFile, { contentType: coverFile.type });
      if (uploadError) {
        setSavingIssue(false);
        toast({ ...describeError(uploadError), variant: "destructive" });
        return;
      }
      coverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
    }

    const payload = { ...form, title_ar: form.title_ar.trim(), theme_ar: form.theme_ar.trim() || null, cover_image: coverUrl };
    const { data, error } = activeIssue
      ? await supabase.from("issues").update(payload).eq("id", activeIssue.id).select().single()
      : await supabase.from("issues").insert(payload).select().single();

    setSavingIssue(false);
    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }

    toast({ title: "تم حفظ بيانات العدد" });
    await loadIssues();
    setActiveIssue(data as IssueRecord);
  };

  const openArticleModal = (article: ArticleRecord | null = null) => {
    setEditingArticle(article);
    if (article) {
      setArtTitle(article.title_ar);
      setArtSubtitle(article.subtitle_ar || "");
      setArtAuthor(article.author_name || "فريق التحرير");
      setArtSection(article.section);
      setArtCoverPreview(article.cover_image);
      editor?.commands.setContent(article.body_ar || "");
    } else {
      setArtTitle("");
      setArtSubtitle("");
      setArtAuthor("فريق التحرير");
      setArtSection("geopolitics");
      setArtCoverPreview(null);
      editor?.commands.setContent("");
    }
    setArtCoverFile(null);
    setModalOpen(true);
  };

  const generateUniqueSlug = async (rawTitle: string, currentArticleId?: string): Promise<string> => {
    const baseSlug = slugify(rawTitle);
    const { data: existing } = await supabase.from("articles").select("id, slug").like("slug", `${baseSlug}%`);

    const usedSlugs = new Set((existing ?? []).filter((row) => row.id !== currentArticleId).map((row) => row.slug));
    if (!usedSlugs.has(baseSlug)) return baseSlug;

    let suffix = 2;
    while (usedSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
    return `${baseSlug}-${suffix}`;
  };

  const saveArticle = async (status: "draft" | "published") => {
    if (!artTitle.trim()) {
      toast({ title: "عنوان المقال مطلوب", variant: "destructive" });
      return;
    }
    if (!activeIssue?.id) {
      toast({ title: "اختر أو احفظ عدداً أولاً", variant: "destructive" });
      return;
    }
    setSavingArticle(true);

    let coverUrl = editingArticle?.cover_image || null;
    if (artCoverFile) {
      const path = safeStoragePath("covers", artCoverFile);
      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(path, artCoverFile, { contentType: artCoverFile.type });
      if (uploadError) {
        setSavingArticle(false);
        toast({ ...describeError(uploadError), variant: "destructive" });
        return;
      }
      coverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
    }

    const uniqueSlug = await generateUniqueSlug(artTitle, editingArticle?.id);
    const payload = {
      title_ar: artTitle.trim(),
      slug: uniqueSlug,
      subtitle_ar: artSubtitle.trim() || null,
      body_ar: editor?.getHTML() || "",
      cover_image: coverUrl,
      section: artSection,
      issue_id: activeIssue.id,
      status,
      author_name: artAuthor.trim() || "فريق التحرير",
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    let { error } = editingArticle
      ? await supabase.from("articles").update(payload).eq("id", editingArticle.id)
      : await supabase.from("articles").insert(payload);

    if (error && (error.code === "23505" || error.message.toLowerCase().includes("slug"))) {
      const fallbackPayload = {
        ...payload,
        slug: `${slugify(artTitle)}-${Date.now().toString(36).slice(-5)}`,
      };
      const retry = editingArticle
        ? await supabase.from("articles").update(fallbackPayload).eq("id", editingArticle.id)
        : await supabase.from("articles").insert(fallbackPayload);
      error = retry.error;
    }

    setSavingArticle(false);
    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }

    toast({ title: "تم حفظ المقال بنجاح" });
    loadArticles(activeIssue.id);
    setModalOpen(false);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال نهائياً؟")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      toast({ ...describeError(error), variant: "destructive" });
      return;
    }
    toast({ title: "تم حذف المقال" });
    if (activeIssue) loadArticles(activeIssue.id);
  };

  const insertImage = () => {
    const url = prompt("أدخل رابط الصورة (https://...):");
    if (url?.trim()) editor?.chain().focus().setImage({ src: url.trim() }).run();
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="wrap grid grid-cols-1 gap-10 py-10 lg:grid-cols-12">
        {/* Sidebar: Issues list */}
        <aside className="space-y-5 lg:col-span-4 lg:border-l lg:border-border lg:pl-8">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
              <span>لوحة التحكم</span>
            </Link>
            <Button size="sm" onClick={newIssue}>
              <Plus className="size-4" aria-hidden="true" />
              <span>عدد جديد</span>
            </Button>
          </div>

          {loadingIssues ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="لا توجد أعداد بعد"
              description="أنشئ أول عدد باستخدام الزر أعلاه."
              compact
            />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {issues.map((issue) => {
                const selected = activeIssue?.id === issue.id;
                return (
                  <li key={issue.id}>
                    <button
                      type="button"
                      onClick={() => selectIssue(issue)}
                      className={`w-full px-3 py-4 text-right transition-colors ${
                        selected ? "border-r-2 border-accent bg-accent-soft/50" : "hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="kicker">العدد {arNumber(issue.issue_number)}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                            issue.status === "published"
                              ? "bg-success-soft text-success"
                              : "bg-warning-soft text-warning"
                          }`}
                        >
                          {issue.status === "published" ? "منشور" : "مسودة"}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-serif text-xl font-bold text-foreground">
                        {issue.title_ar}
                      </p>
                      <p className="meta mt-1">{formatDate(issue.publish_date)}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Main workspace */}
        <main className="space-y-12 lg:col-span-8">
          {/* Issue metadata form */}
          <section className="space-y-6 border-b border-border pb-10">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {activeIssue ? `تعديل العدد ${arNumber(activeIssue.issue_number)}` : "تأسيس عدد جديد"}
            </h1>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <Field label="عنوان العدد" htmlFor="issue-title">
                  <Input
                    id="issue-title"
                    value={form.title_ar}
                    onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                    placeholder="مثال: القوة الناعمة"
                  />
                </Field>

                <Field label="محور العدد (اختياري)" htmlFor="issue-theme">
                  <Input
                    id="issue-theme"
                    value={form.theme_ar}
                    onChange={(e) => setForm({ ...form, theme_ar: e.target.value })}
                    placeholder="جملة تعريفية بمحور العدد"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="رقم العدد" htmlFor="issue-number">
                    <Input
                      id="issue-number"
                      type="number"
                      min={1}
                      value={form.issue_number}
                      onChange={(e) => setForm({ ...form, issue_number: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="تاريخ النشر" htmlFor="issue-date">
                    <Input
                      id="issue-date"
                      type="date"
                      value={form.publish_date}
                      onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: "draft" })}
                    className={`flex-1 rounded border py-2.5 font-sans text-xs font-semibold transition-colors ${
                      form.status === "draft"
                        ? "border-warning bg-warning-soft text-warning"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    مسودة
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: "published" })}
                    className={`flex-1 rounded border py-2.5 font-sans text-xs font-semibold transition-colors ${
                      form.status === "published"
                        ? "border-success bg-success-soft text-success"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    منشور للقرّاء
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="mb-2 block font-sans text-sm font-semibold text-foreground">غلاف العدد</span>
                {coverPreview ? (
                  <div className="relative min-h-[240px] flex-1 overflow-hidden rounded border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverPreview} alt="غلاف العدد" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      aria-label="إزالة الغلاف"
                      className="absolute right-2 top-2 rounded bg-foreground/80 p-1.5 text-background hover:bg-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="group flex min-h-[240px] flex-1 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-input bg-card transition-colors hover:border-accent">
                    <Upload className="mb-2 size-6 text-muted-foreground group-hover:text-accent" aria-hidden="true" />
                    <span className="font-sans text-sm font-medium text-muted-foreground group-hover:text-foreground">
                      اضغط لرفع صورة الغلاف
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
            </div>

            <Button onClick={saveIssue} loading={savingIssue} size="lg">
              {savingIssue ? "جاري الحفظ..." : "حفظ بيانات العدد"}
            </Button>
          </section>

          {/* Articles inside selected issue */}
          <section>
            <div className="section-head">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                مقالات العدد {activeIssue ? `(${arNumber(articles.length)})` : ""}
              </h2>
              <Button variant="accent" size="sm" onClick={() => openArticleModal()} disabled={!activeIssue}>
                <Plus className="size-4" aria-hidden="true" />
                <span>أضف مقالاً</span>
              </Button>
            </div>

            {!activeIssue ? (
              <EmptyState
                icon={BookOpen}
                title="احفظ العدد أولاً"
                description="بعد حفظ بيانات العدد أو اختياره من القائمة، ستتمكن من إضافة مقالاته هنا."
                compact
              />
            ) : articles.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title="لا توجد مقالات في هذا العدد بعد"
                description="اضغط على «أضف مقالاً» لبدء بناء فهرس العدد."
                compact
              />
            ) : (
              <ul className="divide-y divide-border">
                {articles.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="kicker">{sectionLabel(a.section)}</span>
                        <span className="text-border" aria-hidden="true">•</span>
                        <span
                          className={
                            a.status === "published" ? "font-semibold text-success" : "font-semibold text-warning"
                          }
                        >
                          {a.status === "published" ? "منشور" : "مسودة"}
                        </span>
                      </div>
                      <h3 className="mt-1 truncate font-serif text-xl font-bold text-foreground">{a.title_ar}</h3>
                      <p className="meta">{a.author_name || "فريق التحرير"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openArticleModal(a)}
                        className="rounded border border-border p-2 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                        aria-label={`تعديل ${a.title_ar}`}
                      >
                        <PenLine className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteArticle(a.id)}
                        className="rounded border border-border p-2 text-muted-foreground transition-colors hover:border-destructive hover:bg-danger-soft hover:text-destructive"
                        aria-label={`حذف ${a.title_ar}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      {/* Article composer modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm md:p-8"
          dir="rtl"
        >
          <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded border border-border bg-background shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {editingArticle ? "تعديل المقال" : "مقال جديد ضمن العدد"}
              </h2>
              <div className="flex items-center gap-2.5">
                <Button variant="outline" size="sm" onClick={() => saveArticle("draft")} loading={savingArticle}>
                  حفظ كمسودة
                </Button>
                <Button variant="accent" size="sm" onClick={() => saveArticle("published")} loading={savingArticle}>
                  حفظ ونشر
                </Button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label="إغلاق"
                  className="mr-2 rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-8 overflow-y-auto p-6 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-1">
                <Field label="القسم" htmlFor="modal-section">
                  <select
                    id="modal-section"
                    value={artSection}
                    onChange={(e) => setArtSection(e.target.value)}
                    className="h-12 w-full rounded border border-input bg-card px-4 font-sans text-sm text-foreground focus:border-accent focus:outline-none"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="اسم الكاتب" htmlFor="modal-author">
                  <Input id="modal-author" value={artAuthor} onChange={(e) => setArtAuthor(e.target.value)} />
                </Field>

                <div>
                  <span className="mb-2 block font-sans text-sm font-semibold text-foreground">صورة المقال</span>
                  {artCoverPreview ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={artCoverPreview} className="h-full w-full object-cover" alt="صورة المقال" />
                      <button
                        type="button"
                        onClick={() => {
                          setArtCoverFile(null);
                          setArtCoverPreview(null);
                        }}
                        aria-label="إزالة الصورة"
                        className="absolute right-2 top-2 rounded bg-foreground/80 p-1.5 text-background hover:bg-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded border border-dashed border-input bg-card hover:border-accent">
                      <Upload className="mb-2 size-5 text-muted-foreground" aria-hidden="true" />
                      <span className="font-sans text-xs text-muted-foreground">ارفع صورة المقال</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setArtCoverFile(e.target.files[0]);
                            setArtCoverPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                <input
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="عنوان المقال الرئيسي"
                  className="w-full border-0 bg-transparent font-serif text-3xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <input
                  value={artSubtitle}
                  onChange={(e) => setArtSubtitle(e.target.value)}
                  placeholder="عنوان فرعي أو ملخص (اختياري)"
                  className="w-full border-0 bg-transparent font-serif text-lg text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />

                <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded border border-border bg-card p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlockPos(null);
                      setEditingChartData(null);
                      setChartModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded bg-accent-soft px-2.5 py-1.5 font-sans text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ChartColumn className="size-3.5" aria-hidden="true" />
                    <span>رسم بياني</span>
                  </button>
                  <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                  <ModalTool label="جدول" icon={TableIcon} onClick={insertTable} />
                  <ModalTool label="صورة" icon={ImagePlus} onClick={insertImage} />
                  <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                  <ModalTool label="عريض" icon={Bold} onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} />
                  <ModalTool label="مائل" icon={Italic} onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} />
                  <ModalTool label="عنوان ٢" icon={Heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} />
                  <ModalTool label="عنوان ٣" icon={Heading3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} />
                  <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                  <ModalTool label="مرقم" icon={ListOrdered} onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} />
                  <ModalTool label="نقطي" icon={List} onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} />
                  <ModalTool label="اقتباس" icon={Quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} />
                  <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                  <ModalTool label="تراجع" icon={Undo} onClick={() => editor?.chain().focus().undo().run()} />
                  <ModalTool label="إعادة" icon={Redo} onClick={() => editor?.chain().focus().redo().run()} />
                </div>

                <div className="min-h-[380px] rounded border border-border bg-card">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ChartBlockModal
        open={chartModalOpen}
        initialData={editingChartData}
        onClose={() => {
          setChartModalOpen(false);
          setEditingBlockPos(null);
          setEditingChartData(null);
        }}
        onSave={handleSaveChartBlock}
      />
    </div>
  );
}

function ModalTool({
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
      className={`rounded p-2 transition-colors ${
        active ? "bg-accent-soft text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}

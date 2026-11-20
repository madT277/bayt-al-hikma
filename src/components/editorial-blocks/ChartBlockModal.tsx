"use client";

import { useEffect, useState } from "react";
import { ChartBar, ChartLine, ChartPie, CircleAlert, Plus, Trash2, X } from "lucide-react";
import type { ChartBlockData, ChartType } from "@/lib/editorial-blocks/types";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

interface ChartBlockModalProps {
  open: boolean;
  initialData?: ChartBlockData | null;
  onClose: () => void;
  onSave: (data: ChartBlockData) => void;
}

interface DraftRow {
  id: string;
  label: string;
  value: string;
}

const CHART_TYPES: { type: ChartType; label: string; icon: typeof ChartBar }[] = [
  { type: "bar", label: "أعمدة", icon: ChartBar },
  { type: "line", label: "خطي", icon: ChartLine },
  { type: "pie", label: "دائري", icon: ChartPie },
];

function makeRow(label = "", value = ""): DraftRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    value,
  };
}

export function ChartBlockModal({ open, initialData, onClose, onSave }: ChartBlockModalProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [source, setSource] = useState("");
  const [rows, setRows] = useState<DraftRow[]>([makeRow(), makeRow()]);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorText(null);
    if (initialData) {
      setChartType(initialData.chartType);
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setUnit(initialData.unit || "");
      setSource(initialData.source || "");
      setRows(
        initialData.data.length > 0
          ? initialData.data.map((d) => makeRow(d.label, String(d.value)))
          : [makeRow(), makeRow()],
      );
    } else {
      setChartType("bar");
      setTitle("");
      setDescription("");
      setUnit("");
      setSource("");
      setRows([makeRow(), makeRow()]);
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const updateRow = (id: string, field: "label" | "value", val: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
    if (errorText) setErrorText(null);
  };

  const addRow = () => setRows((prev) => [...prev, makeRow()]);
  const removeRow = (id: string) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorText("أدخل عنواناً للرسم البياني.");
      return;
    }

    const parsed: { label: string; value: number }[] = [];
    for (const row of rows) {
      const label = row.label.trim();
      const rawVal = row.value.trim().replace(/٬/g, "").replace(/,/g, ".");
      if (!label && !rawVal) continue;
      const num = Number(rawVal);
      if (!label || rawVal === "" || !Number.isFinite(num)) {
        setErrorText("تحقّق من أن كل صف يحتوي على تسمية وقيمة رقمية صحيحة (مثل 74.9 أو -4.6).");
        return;
      }
      parsed.push({ label, value: num });
    }

    if (parsed.length < 2) {
      setErrorText("أدخل صفَّين من البيانات على الأقل للمقارنة.");
      return;
    }

    if (chartType === "pie" && parsed.some((p) => p.value < 0)) {
      setErrorText("الرسم الدائري لا يدعم القيم السالبة — اختر «أعمدة» أو «خطي» للأرقام السالبة.");
      return;
    }

    onSave({
      chartType,
      title: title.trim(),
      description: description.trim() || undefined,
      unit: unit.trim() || undefined,
      source: source.trim() || undefined,
      data: parsed,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={initialData ? "تعديل الرسم البياني" : "إدراج رسم بياني"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {initialData ? "تعديل الرسم البياني" : "إدراج رسم بياني"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          {errorText && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded border border-destructive/30 bg-danger-soft p-3.5 text-xs text-destructive"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>{errorText}</p>
            </div>
          )}

          {/* Chart Type */}
          <div className="space-y-2">
            <span className="block font-sans text-sm font-semibold text-foreground">نوع الرسم البياني</span>
            <div className="grid grid-cols-3 gap-3">
              {CHART_TYPES.map((item) => {
                const Icon = item.icon;
                const selected = chartType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setChartType(item.type);
                      if (errorText) setErrorText(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded border py-3 font-sans text-sm font-semibold transition-colors ${
                      selected
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="عنوان الرسم" htmlFor="chart-title">
            <Input
              id="chart-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ترتيب القوى الأربع الأولى في مؤشر القوة الناعمة 2026"
            />
          </Field>

          <Field label="وصف مختصر (اختياري)" htmlFor="chart-desc">
            <Input
              id="chart-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="جملة قصيرة توضّح ما يبرزه الرسم"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الوحدة (اختياري)" htmlFor="chart-unit" hint="مثال: نقطة، %، مليار دولار">
              <Input
                id="chart-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="نقطة"
              />
            </Field>
            <Field label="المصدر (اختياري)" htmlFor="chart-source">
              <Input
                id="chart-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="مثال: Brand Finance — يناير 2026"
              />
            </Field>
          </div>

          {/* Data rows */}
          <div className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-semibold text-foreground">
                البيانات (يدعم الأرقام الموجبة والسالبة)
              </span>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="size-3.5" aria-hidden="true" />
                <span>إضافة صف</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {rows.map((row, idx) => (
                <div key={row.id} className="flex items-center gap-2.5">
                  <Input
                    aria-label={`تسمية الصف ${idx + 1}`}
                    placeholder="التسمية (مثال: الولايات المتحدة)"
                    value={row.label}
                    onChange={(e) => updateRow(row.id, "label", e.target.value)}
                    className="h-10 flex-1 text-sm"
                  />
                  <Input
                    aria-label={`قيمة الصف ${idx + 1}`}
                    type="number"
                    step="any"
                    dir="ltr"
                    placeholder="74.9"
                    value={row.value}
                    onChange={(e) => updateRow(row.id, "value", e.target.value)}
                    className="h-10 w-32 text-left text-sm tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 2}
                    aria-label="حذف الصف"
                    className="rounded border border-border p-2.5 text-muted-foreground transition-colors hover:border-destructive hover:bg-danger-soft hover:text-destructive disabled:opacity-35"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" variant="accent">
              {initialData ? "حفظ التعديلات" : "إدراج في المقال"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

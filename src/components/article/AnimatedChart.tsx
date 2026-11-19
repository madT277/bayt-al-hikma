"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { arNumber, articlesLabel } from "@/lib/format";

export interface ComparisonPoint {
  label: string;
  value: number; // 0–100 percentage, or raw value if `unit` is set
  note?: string;
  /** Optional explicit palette slot (1..6). Defaults to index-based cycling. */
  colorIndex?: 1 | 2 | 3 | 4 | 5 | 6;
  href?: string;
}

const DATA_COLORS = [
  "hsl(var(--data-1))", // lapis
  "hsl(var(--data-2))", // terracotta
  "hsl(var(--data-3))", // ochre
  "hsl(var(--data-4))", // green-teal
  "hsl(var(--data-5))", // plum
  "hsl(var(--data-6))", // slate
] as const;

export function colorForIndex(index: number): string {
  return DATA_COLORS[index % DATA_COLORS.length];
}

interface AnimatedChartProps {
  title: string;
  subtitle?: string;
  data: ComparisonPoint[];
  unit?: string;
  maxValue?: number;
}

/**
 * Editorial comparison chart. Every series uses its own hue from the
 * 6-step categorical palette (`--data-1`..`--data-6`), never a single flat tone.
 */
export function AnimatedChart({
  title,
  subtitle,
  data,
  unit = "%",
  maxValue,
}: AnimatedChartProps) {
  const max = maxValue ?? Math.max(100, ...data.map((d) => d.value), 1);

  return (
    <figure className="my-12 border-y border-foreground/20 py-8" dir="rtl">
      <figcaption className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-serif text-2xl font-bold text-foreground">{title}</h3>
          {subtitle && <p className="mt-1 font-sans text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {data.slice(0, 6).map((item, i) => {
            const swatch = item.colorIndex ? DATA_COLORS[item.colorIndex - 1] : colorForIndex(i);
            return (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: swatch }} aria-hidden="true" />
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>
      </figcaption>

      <div className="space-y-5">
        {data.map((item, i) => {
          const swatch = item.colorIndex ? DATA_COLORS[item.colorIndex - 1] : colorForIndex(i);
          const pct = Math.max(0, Math.min(100, (item.value / max) * 100));

          const row = (
            <div className="group space-y-2">
              <div className="flex items-baseline justify-between gap-4 font-sans text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: swatch }} aria-hidden="true" />
                  <span className={item.href ? "link-underline group-hover:text-accent" : ""}>{item.label}</span>
                  {item.note && <span className="text-xs text-muted-foreground">({item.note})</span>}
                </span>
                <span className="shrink-0 font-semibold tabular-nums" style={{ color: swatch }}>
                  {arNumber(item.value)}
                  {unit}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded bg-muted">
                <motion.div
                  className="h-full rounded"
                  style={{ backgroundColor: swatch }}
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.75, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );

          return item.href ? (
            <Link key={item.label} href={item.href} className="block">
              {row}
            </Link>
          ) : (
            <div key={item.label}>{row}</div>
          );
        })}
      </div>
    </figure>
  );
}

export interface SectionCountItem {
  slug: string;
  label: string;
  count: number;
  color: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Multi-colour proportional comparison bar across magazine sections.
 * Shows relative editorial weight at a glance using 6 distinct hues.
 */
export function SectionComparison({
  items,
  title = "خارطة الأقسام",
  subtitle = "توزيع المقالات المنشورة حسب التخصص المعرفي",
}: {
  items: SectionCountItem[];
  title?: string;
  subtitle?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="meta font-semibold text-foreground">{articlesLabel(total)}</span>
      </div>

      {/* Stacked multi-colour proportional comparison bar */}
      <div
        className="flex h-3 w-full overflow-hidden rounded bg-muted"
        role="img"
        aria-label={`توزيع ${total} مقالات على ${items.length} أقسام`}
      >
        {total > 0 ? (
          items
            .filter((item) => item.count > 0)
            .map((item, idx) => {
              const widthPct = (item.count / total) * 100;
              return (
                <motion.div
                  key={item.slug}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.65, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: DATA_COLORS[item.color - 1],
                    transformOrigin: "right center",
                  }}
                  title={`${item.label}: ${articlesLabel(item.count)}`}
                  className="h-full border-l border-background last:border-l-0"
                />
              );
            })
        ) : (
          <div className="flex h-full w-full">
            {items.map((item) => (
              <div
                key={item.slug}
                style={{
                  width: `${100 / items.length}%`,
                  backgroundColor: DATA_COLORS[item.color - 1],
                  opacity: 0.25,
                }}
                className="h-full border-l border-background last:border-l-0"
              />
            ))}
          </div>
        )}
      </div>

      {/* Ruled multi-colour legend & links (no card clutter) */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const swatch = DATA_COLORS[item.color - 1];
          const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <Link
              key={item.slug}
              href={`/category/${item.slug}`}
              className="group border-t-2 pt-3 transition-colors"
              style={{ borderTopColor: swatch }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                  {item.label}
                </span>
                <span className="font-sans text-xs font-semibold tabular-nums" style={{ color: swatch }}>
                  {arNumber(item.count)}
                </span>
              </div>
              <p className="mt-1 font-sans text-xs text-muted-foreground">
                {total > 0 ? `${arNumber(share)}٪ من المنشور` : "تصفّح القسم"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

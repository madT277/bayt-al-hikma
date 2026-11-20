"use client";

import { motion } from "framer-motion";
import { arNumber } from "@/lib/format";
import type { ChartBlockData } from "@/lib/editorial-blocks/types";

const PALETTE = [
  "hsl(var(--data-1))", // lapis
  "hsl(var(--data-2))", // terracotta
  "hsl(var(--data-3))", // ochre
  "hsl(var(--data-4))", // green-teal
  "hsl(var(--data-5))", // plum
  "hsl(var(--data-6))", // slate
] as const;

function colorAt(index: number): string {
  return PALETTE[index % PALETTE.length];
}

function formatMetric(value: number, unit?: string, showPlus?: boolean): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(abs);
  const sign = value < 0 ? "−" : showPlus && value > 0 ? "+" : "";
  const unitSuffix = unit?.trim() ? ` ${unit.trim()}` : "";
  return `${sign}${formatted}${unitSuffix}`;
}

export function ArticleChartBlock({ data }: { data: ChartBlockData }) {
  const hasNegative = data.data.some((d) => d.value < 0);

  return (
    <figure
      className="my-10 rounded border border-border bg-card/70 px-5 py-6 sm:px-7 sm:py-7"
      dir="rtl"
    >
      {/* Header */}
      <figcaption className="border-b border-border pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-2xl font-bold leading-snug text-foreground">
            {data.title}
          </h3>
          {data.unit?.trim() && (
            <span className="font-sans text-xs font-medium text-muted-foreground">
              الوحدة: {data.unit.trim()}
            </span>
          )}
        </div>
        {data.description?.trim() && (
          <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted-foreground">
            {data.description.trim()}
          </p>
        )}
      </figcaption>

      {/* Chart body */}
      <div className="py-6">
        {data.chartType === "bar" && (
          hasNegative ? (
            <DivergingBarChart data={data} />
          ) : (
            <HorizontalBarChart data={data} />
          )
        )}
        {data.chartType === "line" && <EditorialLineChart data={data} />}
        {data.chartType === "pie" && <EditorialPieChart data={data} />}
      </div>

      {/* Footer / Source */}
      {data.source?.trim() && (
        <div className="border-t border-border/80 pt-3 font-sans text-xs text-muted-foreground">
          المصدر: {data.source.trim()}
        </div>
      )}
    </figure>
  );
}

/** Standard all-positive horizontal bar chart (grows RTL from right edge). */
function HorizontalBarChart({ data }: { data: ChartBlockData }) {
  const max = Math.max(...data.data.map((d) => Math.abs(d.value)), 1);

  return (
    <div className="space-y-4">
      {data.data.map((item, idx) => {
        const swatch = colorAt(idx);
        const pct = Math.max(2, (item.value / max) * 100);
        return (
          <div key={`${item.label}-${idx}`} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-4 font-sans text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: swatch }}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </span>
              <span
                className="shrink-0 font-semibold tabular-nums"
                style={{ color: swatch }}
              >
                {formatMetric(item.value, data.unit)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded bg-muted">
              <motion.div
                className="h-full rounded"
                style={{ backgroundColor: swatch }}
                initial={{ width: "0%" }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Diverging bar chart for series containing both positive and negative numbers
 * (e.g. +0.7 vs -4.6). Positive grows right from the zero axis in lapis/green-teal;
 * negative grows left from the zero axis in terracotta.
 */
function DivergingBarChart({ data }: { data: ChartBlockData }) {
  const maxAbs = Math.max(...data.data.map((d) => Math.abs(d.value)), 1);

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 font-sans text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--data-4))" }} aria-hidden="true" />
          <span>ارتفاع (موجب)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--data-2))" }} aria-hidden="true" />
          <span>تراجع (سالب)</span>
        </span>
      </div>

      <div className="space-y-4">
        {data.data.map((item, idx) => {
          const isNeg = item.value < 0;
          const swatch = isNeg ? "hsl(var(--data-2))" : "hsl(var(--data-4))";
          const halfPct = Math.max(3, (Math.abs(item.value) / maxAbs) * 100);

          return (
            <div key={`${item.label}-${idx}`} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-4 font-sans text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span
                  className="shrink-0 font-semibold tabular-nums"
                  style={{ color: swatch }}
                >
                  {formatMetric(item.value, data.unit, true)}
                </span>
              </div>

              {/* Two symmetric halves around a crisp 0-axis */}
              <div className="relative grid h-3.5 w-full grid-cols-2 items-center overflow-hidden rounded bg-muted">
                {/* Right half (in RTL, first column is on the right -> positive values) */}
                <div className="flex h-full justify-end border-l border-foreground/40">
                  {!isNeg && item.value !== 0 && (
                    <motion.div
                      className="h-full rounded-r"
                      style={{ backgroundColor: swatch }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${halfPct}%` }}
                      viewport={{ once: true, amount: "some" }}
                      transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </div>

                {/* Left half (in RTL, second column is on the left -> negative values) */}
                <div className="flex h-full justify-start">
                  {isNeg && (
                    <motion.div
                      className="h-full rounded-l"
                      style={{ backgroundColor: swatch }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${halfPct}%` }}
                      viewport={{ once: true, amount: "some" }}
                      transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis labels */}
      <div className="grid grid-cols-3 font-sans text-[11px] tabular-nums text-muted-foreground">
        <span className="text-right">{formatMetric(maxAbs, undefined, true)}</span>
        <span className="text-center font-semibold text-foreground">{arNumber(0)}</span>
        <span className="text-left">{formatMetric(-maxAbs)}</span>
      </div>
    </div>
  );
}

/** Responsive SVG editorial line chart supporting positive & negative values. */
function EditorialLineChart({ data }: { data: ChartBlockData }) {
  const points = data.data;
  const values = points.map((p) => p.value);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(0, ...values);
  const span = rawMax - rawMin || 1;
  const padMin = rawMin - span * 0.12;
  const padMax = rawMax + span * 0.15;
  const range = padMax - padMin || 1;

  const W = 600;
  const H = 240;
  const padL = 44;
  const padR = 24;
  const padT = 26;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const yFor = (val: number) => padT + ((padMax - val) / range) * innerH;
  const xFor = (i: number) =>
    points.length === 1
      ? padL + innerW / 2
      : padL + (i / (points.length - 1)) * innerW;

  const coords = points.map((p, i) => ({
    ...p,
    x: xFor(i),
    y: yFor(p.value),
    color: colorAt(i),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const zeroY = yFor(0);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[320px] font-sans"
        role="img"
        aria-label={data.title}
      >
        {/* Horizontal hairlines */}
        {[0, 0.5, 1].map((t) => {
          const y = padT + t * innerH;
          return (
            <line
              key={t}
              x1={padL}
              x2={W - padR}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
          );
        })}

        {/* Zero baseline when values cross zero */}
        {rawMin < 0 && rawMax > 0 && (
          <line
            x1={padL}
            x2={W - padR}
            y1={zeroY}
            y2={zeroY}
            stroke="hsl(var(--foreground) / 0.45)"
            strokeDasharray="4 4"
            strokeWidth={1.2}
          />
        )}

        {/* Animated line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="hsl(var(--data-1))"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.4 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Data points & labels */}
        {coords.map((c, i) => (
          <g key={`${c.label}-${i}`}>
            <motion.circle
              cx={c.x}
              cy={c.y}
              r={5}
              fill={c.color}
              stroke="hsl(var(--card))"
              strokeWidth={2}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.08 }}
            />
            <text
              x={c.x}
              y={c.y - 11}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill={c.color}
            >
              {formatMetric(c.value, undefined, rawMin < 0)}
            </text>
            <text
              x={c.x}
              y={H - 12}
              textAnchor="middle"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Responsive SVG donut/pie chart with tabular Arabic legend. */
function EditorialPieChart({ data }: { data: ChartBlockData }) {
  const positiveItems = data.data.map((d) => ({ ...d, abs: Math.abs(d.value) }));
  const total = positiveItems.reduce((sum, d) => sum + d.abs, 0) || 1;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-12">
      <div className="flex justify-center sm:col-span-5">
        <svg viewBox="0 0 180 180" className="size-44 font-sans" role="img" aria-label={data.title}>
          <g transform="rotate(-90 90 90)">
            {positiveItems.map((item, idx) => {
              const fraction = item.abs / total;
              const dashLength = fraction * circumference;
              const dashOffset = -cumulative * circumference;
              cumulative += fraction;
              const swatch = colorAt(idx);

              return (
                <motion.circle
                  key={`${item.label}-${idx}`}
                  cx={90}
                  cy={90}
                  r={radius}
                  fill="none"
                  stroke={swatch}
                  strokeWidth={24}
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                />
              );
            })}
          </g>
          <text
            x={90}
            y={86}
            textAnchor="middle"
            fontSize={18}
            fontWeight={700}
            fill="hsl(var(--foreground))"
          >
            {arNumber(Number(total.toFixed(1)))}
          </text>
          <text
            x={90}
            y={105}
            textAnchor="middle"
            fontSize={11}
            fill="hsl(var(--muted-foreground))"
          >
            {data.unit?.trim() || "الإجمالي"}
          </text>
        </svg>
      </div>

      <ul className="divide-y divide-border sm:col-span-7">
        {positiveItems.map((item, idx) => {
          const swatch = colorAt(idx);
          const pct = Math.round((item.abs / total) * 100);
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center justify-between gap-4 py-2.5 font-sans text-sm">
              <span className="flex items-center gap-2.5 text-foreground">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: swatch }} aria-hidden="true" />
                <span>{item.label}</span>
              </span>
              <span className="flex items-center gap-3 tabular-nums">
                <span className="font-semibold" style={{ color: swatch }}>
                  {formatMetric(item.value, data.unit)}
                </span>
                <span className="text-xs text-muted-foreground">({arNumber(pct)}٪)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

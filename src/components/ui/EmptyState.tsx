import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  className?: string;
  compact?: boolean;
}

/**
 * Empty state: an icon in a hairline circle, a serif headline, one sentence of
 * explanation and at most two clear next steps. No boxes, no illustrations.
 */
export function EmptyState({ icon: Icon, title, description, action, secondaryAction, className, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "py-12" : "py-24", className)}>
      <span className="mb-6 flex size-14 items-center justify-center rounded-full border border-border text-muted-foreground">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className={cn("font-serif text-foreground", compact ? "text-xl" : "text-2xl")}>{title}</h2>
      {description && <p className="mt-3 max-w-md text-sm text-muted-foreground">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {action && (
            <Link
              href={action.href}
              className="inline-flex h-11 items-center rounded bg-primary px-5 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink-soft"
            >
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link href={secondaryAction.href} className="link-underline font-sans text-sm font-semibold text-accent">
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

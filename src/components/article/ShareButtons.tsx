"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const resolveUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const copyLink = async () => {
    const target = resolveUrl();
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API unavailable
    }
  };

  const nativeShare = async () => {
    const target = resolveUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: target });
        return;
      } catch {
        // User cancelled share sheet
      }
    }
    copyLink();
  };

  const shareUrl = resolveUrl();
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-3" dir="rtl">
      <span className="font-sans text-xs font-semibold text-muted-foreground">شارك المقال:</span>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 items-center gap-2 rounded border border-border bg-card px-3.5 font-sans text-xs font-semibold text-foreground transition-colors hover:border-foreground"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-success" aria-hidden="true" />
            <span>تم نسخ الرابط</span>
          </>
        ) : (
          <>
            <Link2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <span>نسخ الرابط</span>
          </>
        )}
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-2 rounded border border-border bg-card px-3.5 font-sans text-xs font-semibold text-foreground transition-colors hover:border-foreground"
      >
        <MessageCircle className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span>واتساب</span>
      </a>

      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex h-9 items-center gap-2 rounded border border-border bg-card px-3.5 font-sans text-xs font-semibold text-foreground transition-colors hover:border-foreground"
      >
        <Share2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span>مشاركة</span>
      </button>
    </div>
  );
}

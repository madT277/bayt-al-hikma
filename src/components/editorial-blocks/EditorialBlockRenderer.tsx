"use client";

import { isValidChartData } from "@/lib/editorial-blocks/types";
import { ArticleChartBlock } from "@/components/editorial-blocks/ArticleChartBlock";

interface EditorialBlockRendererProps {
  blockType: string;
  payload: unknown;
}

/**
 * Central block renderer used in ArticleReader and in the Tiptap editor preview.
 * Adding a new block type later (timeline, fact box, stat strip, quote card)
 * only requires adding a case here.
 */
export function EditorialBlockRenderer({ blockType, payload }: EditorialBlockRendererProps) {
  switch (blockType) {
    case "chart":
      if (!isValidChartData(payload)) return null;
      return <ArticleChartBlock data={payload} />;
    default:
      return null;
  }
}

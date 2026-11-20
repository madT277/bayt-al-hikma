"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { Pencil, Trash2 } from "lucide-react";
import { decodeBlockPayload, encodeBlockPayload, type EditorialBlockType } from "@/lib/editorial-blocks/types";
import { EditorialBlockRenderer } from "@/components/editorial-blocks/EditorialBlockRenderer";

export interface EditorialBlockExtensionOptions {
  onEditBlock?: (params: {
    pos: number;
    blockType: EditorialBlockType;
    payload: unknown;
  }) => void;
}

function EditorialBlockNodeView({ node, editor, getPos, deleteNode, extension }: NodeViewProps) {
  const blockType = (node.attrs.blockType as EditorialBlockType) || "chart";
  const payload = decodeBlockPayload(node.attrs.payload as string);
  const onEditBlock = (extension.options as EditorialBlockExtensionOptions).onEditBlock;

  const handleEdit = () => {
    if (!onEditBlock || typeof getPos !== "function") return;
    const pos = getPos();
    if (typeof pos === "number") {
      onEditBlock({ pos, blockType, payload });
    }
  };

  return (
    <NodeViewWrapper className="my-6 select-none" data-editorial-block-view={blockType}>
      <div className="relative rounded border border-dashed border-accent/40 bg-background/60 p-2 transition-colors hover:border-accent">
        {editor.isEditable && (
          <div className="mb-2 flex items-center justify-between border-b border-border/70 px-2 pb-2 font-sans text-xs">
            <span className="font-semibold text-accent">عنصر تفاعلي: رسم بياني</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1 font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                <span>تعديل</span>
              </button>
              <button
                type="button"
                onClick={deleteNode}
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1 font-medium text-muted-foreground transition-colors hover:border-destructive hover:bg-danger-soft hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        )}

        <div className="pointer-events-none">
          <EditorialBlockRenderer blockType={blockType} payload={payload} />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

/**
 * Reusable Tiptap node for all custom editorial blocks (charts today;
 * timelines, fact boxes, quote cards, stat strips tomorrow).
 */
export const EditorialBlockExtension = Node.create<EditorialBlockExtensionOptions>({
  name: "editorialBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      onEditBlock: undefined,
    };
  },

  addAttributes() {
    return {
      blockType: {
        default: "chart",
        parseHTML: (element) => element.getAttribute("data-editorial-block") || "chart",
        renderHTML: (attributes) => ({
          "data-editorial-block": attributes.blockType || "chart",
        }),
      },
      payload: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-block-payload") || "",
        renderHTML: (attributes) => ({
          "data-block-payload": attributes.payload || "",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-editorial-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EditorialBlockNodeView);
  },
});

export function createEditorialBlockNode(blockType: EditorialBlockType, data: unknown) {
  return {
    type: "editorialBlock",
    attrs: {
      blockType,
      payload: encodeBlockPayload(data),
    },
  };
}

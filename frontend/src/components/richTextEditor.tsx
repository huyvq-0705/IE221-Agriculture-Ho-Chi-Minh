"use client";

import * as React from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Link2Off,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImagePlus,
  Eye,
} from "lucide-react";

type Props = {
  name?: string;
  initialHtml?: string;
  onChangeHtml?: (html: string) => void;
};

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant={active ? "secondary" : "ghost"}
          className="h-8 w-8"
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function ImageNodeView(props: any) {
  const { node, updateAttributes } = props;
  const { src, alt } = node.attrs;
  return (
    <NodeViewWrapper className="not-prose">
      <div
        className="w-full rounded-md border bg-muted/40 px-3 py-2 text-xs font-mono leading-5"
        onDoubleClick={() => {
          const nextSrc = window.prompt("Image URL", src) || src;
          const nextAlt = window.prompt("Alt text (optional)", alt || "") || alt || "";
          updateAttributes({ src: nextSrc, alt: nextAlt });
        }}
      >
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">image</div>
        <div className="break-all"><span className="font-semibold">src:</span> {src}</div>
        <div className="break-all"><span className="font-semibold">alt:</span> {alt || "(empty)"}</div>
        <div className="mt-1 text-[10px] text-muted-foreground">double-click to edit</div>
      </div>
    </NodeViewWrapper>
  );
}

const ImageAsText = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export default function RichTextEditor({
  name = "content",
  initialHtml = "",
  onChangeHtml,
}: Props) {
  const [html, setHtml] = React.useState(initialHtml);
  const [preview, setPreview] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: "Write your article here..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageAsText.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: initialHtml || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[280px] px-3 py-2 rounded-md border bg-background focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.getHTML();
      setHtml(next);
      onChangeHtml?.(next);
    },
    immediatelyRender: false,
  });

  const applyLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      const alt = window.prompt("Alt text (optional)") || "";
      editor?.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  if (!editor) {
    return (
      <>
        <input type="hidden" name={name} value={html} />
        <div className="min-h-[280px] rounded-md border p-3 text-sm text-muted-foreground">
          Loading editor…
        </div>
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <input type="hidden" name={name} value={html} />
      <div className="mb-2 rounded-lg border bg-muted/50 p-1 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton
            label="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton
            label="Bullet List"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered List"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton
            label="Align Left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align Center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align Right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton label="Insert Image" onClick={insertImage}>
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton label="Insert Link" onClick={applyLink}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Remove Link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Link2Off className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton label={preview ? "Hide Preview" : "Preview"} onClick={() => setPreview((v) => !v)}>
            <Eye className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>
      {preview ? (
        <div className="prose prose-sm sm:prose-base max-w-none rounded-md border px-3 py-2">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </TooltipProvider>
  );
}

"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import RichTextEditor from "@/components/richTextEditor";

function normalizeHtmlLists(html: string): string {
  if (!html) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const isBulletP = (el: Element) => {
    if (el.tagName !== "P") return false;
    const text = el.textContent?.trim() ?? "";
    return /^[-*•]\s+/.test(text);
  };
  const children = Array.from(body.childNodes);
  for (let i = 0; i < children.length; i++) {
    const node = children[i] as Element;
    if (!(node instanceof Element)) continue;
    if (isBulletP(node)) {
      const ul = doc.createElement("ul");
      let j = i;
      while (j < children.length) {
        const n = children[j] as Element;
        if (!(n instanceof Element) || !isBulletP(n)) break;
        const li = doc.createElement("li");
        const inner = (n as HTMLElement).innerHTML.replace(/^\s*[-*•]\s+/, "");
        li.innerHTML = inner;
        ul.appendChild(li);
        j++;
      }
      for (let k = j - 1; k >= i; k--) body.removeChild(children[k]);
      body.insertBefore(ul, children[i] || null);
      i = Array.from(body.childNodes).indexOf(ul);
    }
  }
  return body.innerHTML;
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_MAX = 160;

type ActionResult = { ok: boolean; message?: string };

type SimpleProduct = {
  id: number;
  name: string;
};

type Props = {
  initial?: Partial<{
    title: string;
    slug: string;
    meta_description: string;
    excerpt: string;
    cover_image_url: string;
    cover_image_alt: string;
    content: string;
    related_product: { id: number; name: string } | null;
  }>;
  products?: SimpleProduct[];
  onSubmit: (prev: any, formData: FormData) => Promise<ActionResult>;
  submitText: string;
  redirectTo?: string;
};

const Counter = ({ value, max }: { value: number; max: number }) => (
  <span className={`text-xs ${value > max ? "text-destructive" : "text-muted-foreground"}`}>{value}/{max}</span>
);

export default function BlogForm({
  initial,
  products = [],
  onSubmit,
  submitText,
  redirectTo = "/agrihcmAdmin/blogs",
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(onSubmit, { ok: false, message: "" });
  
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [coverUrl, setCoverUrl] = React.useState(initial?.cover_image_url ?? "");
  
  const [selectedProductId, setSelectedProductId] = React.useState<string>(
    initial?.related_product?.id ? String(initial.related_product.id) : ""
  );

  React.useEffect(() => {
    if (state?.ok) router.push(redirectTo);
  }, [state, router, redirectTo]);

  const formRef = React.useRef<HTMLFormElement>(null);
  const handlePreSubmit = React.useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const hidden = form.querySelector<HTMLInputElement>('input[name="content"]');
    if (hidden && hidden.value) {
      hidden.value = normalizeHtmlLists(hidden.value);
    }
  }, []);

  return (
    <form ref={formRef} onSubmit={handlePreSubmit} action={formAction} className="grid gap-5">
      {initial?.slug && <input type="hidden" name="slug" defaultValue={initial.slug} />}

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Title</Label>
          <Counter value={title.length} max={TITLE_MAX} />
        </div>
        <Input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="related_product_id">Featured Product (Optional)</Label>
        <Select name="related_product_id" value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a product to feature..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">-- No Product --</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name} (ID: {p.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground">
          This product will appear as a clickable card at the bottom of the blog post.
        </div>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Counter value={(initial?.meta_description || "").length} max={META_MAX} />
        </div>
        <Input
          id="meta_description"
          name="meta_description"
          defaultValue={initial?.meta_description}
          placeholder="SEO description"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={initial?.excerpt}
          placeholder="Short preview"
        />
      </div>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="cover_image_url">Cover Image URL</Label>
          <Input
            id="cover_image_url"
            name="cover_image_url"
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        {coverUrl && (
           <div className="relative h-28 w-44 overflow-hidden rounded-sm ring-1 ring-border bg-muted">
              <img src={coverUrl} alt="Preview" className="h-full w-full object-cover" />
           </div>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="cover_image_alt">Cover Image Alt</Label>
        <Input
          id="cover_image_alt"
          name="cover_image_alt"
          defaultValue={initial?.cover_image_alt}
          placeholder="Describe image"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Content</Label>
        <RichTextEditor name="content" initialHtml={initial?.content || ""} />
      </div>

      {!state?.ok && state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" className="rounded-full">
          {submitText}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

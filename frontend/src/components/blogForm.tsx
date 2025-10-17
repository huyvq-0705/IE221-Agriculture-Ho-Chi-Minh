"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
  Array.from(body.querySelectorAll("li figure")).forEach((fig) => {
    const li = fig.closest("li");
    const ul = fig.closest("ul");
    if (li && ul) {
      ul.parentElement?.insertBefore(fig, ul.nextSibling);
      if (li.textContent?.trim() === "") li.remove();
    }
  });
  return body.innerHTML;
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_MIN = 50;
const META_MAX = 160;
const EXCERPT_MIN = 60;
const EXCERPT_MAX = 200;
const ALT_MIN = 10;
const ALT_MAX = 125;

type ActionResult = { ok: boolean; message?: string };

type Props = {
  initial?: Partial<{
    title: string;
    slug: string;
    meta_description: string;
    excerpt: string;
    cover_image_url: string;
    cover_image_alt: string;
    content: string;
  }>;
  onSubmit: (prev: any, formData: FormData) => Promise<ActionResult>;
  submitText: string;
  redirectTo?: string;
};

function getLengthHint(value: string, min: number, max: number) {
  const len = (value ?? "").trim().length;
  if (len === 0) return { cls: "text-muted-foreground", msg: "Empty — add some text." };
  if (len < min) return { cls: "text-destructive", msg: `${min - len} characters below the recommended minimum (${min}).` };
  if (len > max) return { cls: "text-destructive", msg: `${len - max} characters over the recommended maximum (${max}). Please shorten it.` };
  return { cls: "text-emerald-600", msg: `Looks good (within ${min}–${max} chars).` };
}

const Counter = ({ value, max }: { value: number; max: number }) => (
  <span className={`text-xs ${value > max ? "text-destructive" : "text-muted-foreground"}`}>{value}/{max}</span>
);

export default function BlogForm({
  initial,
  onSubmit,
  submitText,
  redirectTo = "/agrihcmAdmin/blogs",
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(onSubmit, { ok: false, message: "" });
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [meta, setMeta] = React.useState(initial?.meta_description ?? "");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = React.useState(initial?.cover_image_url ?? "");
  const [coverAlt, setCoverAlt] = React.useState(initial?.cover_image_alt ?? "");
  const [imgOk, setImgOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (state?.ok) router.push(redirectTo);
  }, [state, router, redirectTo]);

  const titleHint = getLengthHint(title, TITLE_MIN, TITLE_MAX);
  const metaHint = getLengthHint(meta, META_MIN, META_MAX);
  const excerptHint = getLengthHint(excerpt, EXCERPT_MIN, EXCERPT_MAX);
  const altHint = getLengthHint(coverAlt, ALT_MIN, ALT_MAX);

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
        <p className={`text-xs ${titleHint.cls}`}>{titleHint.msg}</p>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Counter value={meta.length} max={META_MAX} />
        </div>
        <Input
          id="meta_description"
          name="meta_description"
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="Short summary used by search and social"
        />
        <p className={`text-xs ${metaHint.cls}`}>{metaHint.msg}</p>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="excerpt">Excerpt</Label>
          <span className="text-xs text-muted-foreground">{excerpt.length} chars</span>
        </div>
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Shown on lists/cards. Keep it concise."
        />
        <p className={`text-xs ${excerptHint.cls}`}>{excerptHint.msg}</p>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="cover_image_url">Cover Image URL</Label>
          <Input
            id="cover_image_url"
            name="cover_image_url"
            type="url"
            value={coverUrl}
            onChange={(e) => {
              setCoverUrl(e.target.value);
              setImgOk(null);
            }}
            placeholder="https://…"
          />
          <div className="text-xs text-muted-foreground">
            Paste an image URL (Unsplash, CDN…). Preview appears below.
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-2">
          <div className="flex items-start gap-3">
            <div className="relative h-28 w-44 overflow-hidden rounded-sm ring-1 ring-border bg-muted">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={coverAlt || "Cover preview"}
                  className="h-full w-full object-cover"
                  onLoad={() => setImgOk(true)}
                  onError={() => setImgOk(false)}
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-xs text-muted-foreground">
                  No image URL
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-sm font-medium line-clamp-2" title={title || "Untitled"}>
                {title || "Untitled"}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-3">
                {meta || "Meta description preview will appear here."}
              </div>
              {imgOk === false && (
                <div className="text-xs text-destructive">Couldn’t load image from this URL.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="cover_image_alt">Cover Image Alt</Label>
          <Counter value={coverAlt.length} max={ALT_MAX} />
        </div>
        <Input
          id="cover_image_alt"
          name="cover_image_alt"
          value={coverAlt}
          onChange={(e) => setCoverAlt(e.target.value)}
          placeholder="Describe the image for accessibility & SEO"
        />
        <p className={`text-xs ${altHint.cls}`}>{altHint.msg}</p>
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

      <Card className="mt-1">
        <CardContent className="py-4">
          <div className="space-y-1">
            <div className="text-sm text-emerald-700">agrihcm.shop › blog</div>
            <div className={`text-base font-semibold leading-tight line-clamp-2 ${title.length > TITLE_MAX ? "text-destructive" : "text-blue-700"}`}>
              {title || "Your post title"}
            </div>
            <div className={`text-sm line-clamp-2 ${meta.length > META_MAX ? "text-destructive" : "text-muted-foreground"}`}>
              {meta || "A short, compelling description up to ~160 characters."}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

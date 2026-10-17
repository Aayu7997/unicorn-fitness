"use client";
import { useEffect, useState, useCallback } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { AnimatedSwitch } from "@/components/ui/animated-switch";
import { ImageUpload } from "@/components/image-upload";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl?: string;
  imagePublicId?: string;
  published: boolean;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverUrl: "",
  imagePublicId: "",
  published: false,
  author: "Unicorn Fitness Club",
  tags: [] as string[],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/blog");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setTagInput("");
    setError("");
    setView("editor");
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      coverUrl: p.coverUrl ?? "",
      imagePublicId: p.imagePublicId ?? "",
      published: p.published,
      author: p.author,
      tags: [...p.tags],
    });
    setTagInput("");
    setError("");
    setView("editor");
  };

  const save = async (publish?: boolean) => {
    setSaving(true);
    setError("");
    try {
      const data = {
        ...form,
        ...(publish !== undefined ? { published: publish } : {}),
      };
      const url = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Failed");
        return;
      }
      setView("list");
      load();
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    load();
  };

  const togglePublish = async (p: BlogPost) => {
    await fetch(`/api/admin/blog/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    load();
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  if (view === "editor")
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => setView("list")}
            className="pl-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            ← Back to posts
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => save(false)}
              disabled={saving}
            >
              Save Draft
            </Button>
            <AnimatedSaveButton onClick={() => save(true)}>
              Publish Post
            </AnimatedSaveButton>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        title: e.target.value,
                        slug: !editing ? slugify(e.target.value) : f.slug,
                      }))
                    }
                    placeholder="Post Title..."
                    className="w-full text-3xl font-bold text-foreground bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="border-t pt-4 flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/blog/</span>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="url-slug"
                    className="w-full text-sm text-primary bg-transparent border-0 focus:outline-none font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Label className="mb-2 block text-muted-foreground">
                  Excerpt (short description)
                </Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, excerpt: e.target.value }))
                  }
                  rows={3}
                  placeholder="Brief description of this post..."
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Label className="mb-2 block text-muted-foreground">
                  Content (HTML supported)
                </Label>
                <Textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  rows={20}
                  placeholder="Write your blog post content here. HTML is supported."
                  className="font-mono text-sm leading-relaxed"
                />
                <p className="text-muted-foreground text-xs mt-3">
                  Tip: HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;,
                  &lt;ul&gt; are supported
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={form.author}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, author: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="space-y-4">
                    <ImageUpload
                      value={(form as any).coverUrl}
                      onChange={(url, publicId) =>
                        setForm((f) => ({
                          ...f,
                          coverUrl: url,
                          imagePublicId: publicId,
                        }))
                      }
                    />
                    <div className="flex items-center gap-3">
                      <div className="h-px bg-border flex-1"></div>
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        OR
                      </span>
                      <div className="h-px bg-border flex-1"></div>
                    </div>
                    <Input
                      type="text"
                      placeholder="Paste Image URL..."
                      value={
                        (form as Record<string, unknown>)["coverUrl"] as string
                      }
                      onChange={(e) =>
                        setForm((p) => ({ ...p, coverUrl: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                      placeholder="Add a tag..."
                    />
                    <Button variant="secondary" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1.5"
                      >
                        <Tag className="w-3 h-3 mr-1" /> {tag}
                        <Button
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              tags: f.tags.filter((_, j) => j !== i),
                            }))
                          }
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Label className="text-base">Published Status</Label>
                  <AnimatedSwitch
                    checked={form.published as boolean}
                    onChange={(c: boolean) =>
                      setForm((f) => ({ ...f, published: c }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {posts.length} published or drafted articles
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No blog posts yet
            </div>
          ) : (
            posts.map((post, i) => (
              <div
                key={post.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="w-full sm:w-24 h-32 sm:h-16 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden border">
                  {post.coverUrl ? (
                    <img
                      src={post.coverUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-foreground truncate">
                      {post.title}
                    </h3>
                    {post.published ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 shrink-0"
                      >
                        <Eye className="w-3 h-3 mr-1" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">
                        <EyeOff className="w-3 h-3 mr-1" /> Draft
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {post.author}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 sm:ml-auto mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(post)}
                    className={
                      post.published
                        ? "text-muted-foreground"
                        : "text-emerald-500 hover:text-emerald-600"
                    }
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </Button>
                  <AnimatedEditButton onClick={() => openEdit(post)} />
                  <AnimatedDeleteButton onClick={() => del(post.id)} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

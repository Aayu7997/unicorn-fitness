"use client";

import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { AnimatedSwitch } from "@/components/ui/animated-switch";
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Check, Star } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location?: string;
  transformation?: string;
  content: string;
  imageUrl?: string;
  imagePublicId?: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}
const EMPTY = {
  name: "",
  role: "",
  location: "",
  transformation: "",
  content: "",
  imageUrl: "",
  imagePublicId: "",
  rating: 5,
  approved: true,
};

export function TestimonialsTab({ onUpdate }: { onUpdate?: () => void }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [modal, setModal] = useState({
    open: false,
    editing: null as Testimonial | null,
  });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/testimonials");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string, approved: boolean) => {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    load();
    onUpdate?.();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    load();
  };

  const openEdit = (t: Testimonial) => {
    setForm({
      name: t.name,
      role: t.role,
      location: t.location ?? "",
      transformation: t.transformation ?? "",
      content: t.content,
      imageUrl: t.imageUrl ?? "",
      imagePublicId: t.imagePublicId ?? "",
      rating: t.rating,
      approved: t.approved,
    });
    setError("");
    setModal({ open: true, editing: t });
  };

  const openCreate = () => {
    setForm(EMPTY);
    setError("");
    setModal({ open: true, editing: null });
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const url = modal.editing
        ? `/api/admin/testimonials/${modal.editing.id}`
        : "/api/admin/testimonials";
      const res = await fetch(url, {
        method: modal.editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Failed");
        return;
      }
      setModal({ open: false, editing: null });
      load();
      onUpdate?.();
    } finally {
      setSaving(false);
    }
  };

  const displayed = items.filter((t) =>
    filter === "all" ? true : filter === "pending" ? !t.approved : t.approved,
  );
  const pendingCount = items.filter((t) => !t.approved).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-foreground font-semibold text-lg">
            Testimonials
          </h2>
          <p className="text-muted-foreground text-sm">
            {pendingCount} pending approval
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["all", "pending", "approved"] as const).map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${filter === f ? "bg-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f}{" "}
                {f === "pending" && pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-foreground text-xs px-1 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <Button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-foreground text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> -
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))
        ) : displayed.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground py-12">
            No testimonials found
          </div>
        ) : (
          displayed.map((t, i) => (
            <div
              key={t.id}
              className={`bg-card border rounded-xl p-5 ${!t.approved ? "border-amber-500/30" : "border-border"}`}
            >
              {!t.approved && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-full mb-3">
                  Pending -
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                {t.imageUrl ? (
                  <img
                    src={t.imageUrl}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary/80 font-bold shrink-0">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {t.name}
                  </p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < t.rating ? "text-primary/80 fill-blue-400" : "text-foreground/20"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-3">
                {t.content}
              </p>
              {t.transformation && (
                <p className="text-emerald-500 text-xs font-medium mb-3">
                  ✓ {t.transformation}
                </p>
              )}
              <div className="flex items-center gap-2">
                {!t.approved ? (
                  <Button
                    onClick={() => approve(t.id, true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-green-500/20 rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> -
                  </Button>
                ) : (
                  <Button
                    onClick={() => approve(t.id, false)}
                    className="flex-1 py-2 text-xs bg-muted border border-border text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                  >
                    Unapprove
                  </Button>
                )}
                <AnimatedEditButton
                  onClick={() => openEdit(t)}
                  className="scale-75 origin-left"
                />
                <AnimatedDeleteButton onClick={() => del(t.id)} />
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={modal.open}
        onOpenChange={(open) =>
          !open && setModal({ open: false, editing: null })
        }
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal.editing ? "Edit Testimonial" : "New Testimonial"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Manage Testimonial
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}
            {[
              { l: "Name", k: "name" },
              { l: "Role / Profession", k: "role" },
              { l: "Location", k: "location" },
              {
                l: "Headline/Statistic (e.g. 140+ sprints)",
                k: "transformation",
              },
            ].map((f) => (
              <div key={f.k}>
                <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                  {f.l}
                </label>
                <Input
                  value={(form as Record<string, unknown>)[f.k] as string}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.k]: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            ))}
            <div>
              <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                User Photo
              </label>
              <div className="space-y-3">
                <ImageUpload
                  value={(form as any).imageUrl}
                  onChange={(url, publicId) =>
                    setForm((f) => ({
                      ...f,
                      imageUrl: url,
                      imagePublicId: publicId,
                    }))
                  }
                />
                <div className="flex items-center gap-3">
                  <div className="h-px bg-muted flex-1"></div>
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    OR
                  </span>
                  <div className="h-px bg-muted flex-1"></div>
                </div>
                <Input
                  type="text"
                  placeholder="Paste Image URL..."
                  value={
                    (form as Record<string, unknown>)["imageUrl"] as string
                  }
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                Quote
              </label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                rows={4}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-xs font-medium mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${form.rating >= n ? "bg-primary text-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-foreground/80 text-xs font-medium">
                Active Status
              </label>
              <AnimatedSwitch
                checked={form.approved as boolean}
                onChange={(c: boolean) =>
                  setForm((f) => ({ ...f, approved: c }))
                }
              />
            </div>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setModal({ open: false, editing: null })}
            >
              Cancel
            </Button>
            <AnimatedSaveButton onClick={save} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

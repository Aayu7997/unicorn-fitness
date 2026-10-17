"use client";

import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedSwitch } from "@/components/ui/animated-switch";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}
const EMPTY = { question: "", answer: "", sortOrder: 0, active: true };

export function FAQsTab() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    editing: null as FAQ | null,
  });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/faqs");
    if (res.ok) setFaqs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ ...EMPTY, sortOrder: faqs.length });
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (f: FAQ) => {
    setForm({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
      active: f.active,
    });
    setError("");
    setModal({ open: true, editing: f });
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const url = modal.editing
        ? `/api/admin/faqs/${modal.editing.id}`
        : "/api/admin/faqs";
      const res = await fetch(url, {
        method: modal.editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Failed");
        return;
      }
      setModal({ open: false, editing: null });
      load();
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this FAQ")) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    load();
  };

  const toggle = async (f: FAQ) => {
    await fetch(`/api/admin/faqs/${f.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !f.active }),
    });
    load();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {faqs.length} questions
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No FAQ yet. Add your first one!
            </div>
          ) : (
            faqs.map((faq, i) => (
              <div
                key={faq.id}
                className={`flex items-start gap-4 p-5 transition-colors hover:bg-muted/50 ${!faq.active ? "opacity-50" : ""}`}
              >
                <div className="shrink-0 mt-0.5 text-muted-foreground cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1 text-sm">{faq.question}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <AnimatedSwitch
                    checked={faq.active}
                    onChange={() => toggle(faq)}
                  />
                  <AnimatedEditButton onClick={() => openEdit(faq)} />
                  <AnimatedDeleteButton onClick={() => del(faq.id)} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog
        open={modal.open}
        onOpenChange={(open) =>
          !open && setModal({ open: false, editing: null })
        }
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{modal.editing ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            <DialogDescription>
              Add or modify a frequently asked question.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={form.question}
                onChange={(e) =>
                  setForm((f) => ({ ...f, question: e.target.value }))
                }
                placeholder="E.g. What are your opening hours?"
              />
            </div>

            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={form.answer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, answer: e.target.value }))
                }
                rows={5}
                placeholder="Provide a clear and helpful answer..."
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-muted-foreground">Active Status</Label>
              <AnimatedSwitch
                checked={form.active as boolean}
                onChange={(c) => setForm((f) => ({ ...f, active: c }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModal({ open: false, editing: null })}
            >
              Cancel
            </Button>
            <AnimatedSaveButton onClick={save} loading={saving} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

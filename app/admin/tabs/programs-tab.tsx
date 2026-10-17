"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Check, X, GripVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { AnimatedSwitch } from "@/components/ui/animated-switch";
import { ImageUpload } from "@/components/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface Program {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  level: string;
  trainer: string;
  price: number;
  imageUrl?: string;
  imagePublicId?: string;
  benefits: string[];
  active: boolean;
  sortOrder: number;
}

const EMPTY: Omit<Program, "id" | "sortOrder"> = {
  name: "",
  slug: "",
  description: "",
  duration: "",
  level: "Beginner",
  trainer: "",
  price: 0,
  imageUrl: "",
  imagePublicId: "",
  benefits: [],
  active: true,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProgramsTab() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/programs");
      if (res.ok) {
        setPrograms(await res.json());
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      console.error(err);
      setFetchError("Failed to load programs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setBenefitInput("");
    setError("");
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p: Program) => {
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      duration: p.duration,
      level: p.level,
      trainer: p.trainer,
      price: p.price,
      imageUrl: p.imageUrl ?? "",
      imagePublicId: p.imagePublicId ?? "",
      benefits: p.benefits,
      active: p.active,
    });
    setBenefitInput("");
    setError("");
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `/api/admin/programs/${editingId}`
        : "/api/admin/programs";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      const res = await fetch(`/api/admin/programs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) load();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (p: Program) => {
    try {
      await fetch(`/api/admin/programs/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setForm((f) => ({
        ...f,
        benefits: [...f.benefits, benefitInput.trim()],
      }));
      setBenefitInput("");
    }
  };

  const filtered = programs.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.trainer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
          <p className="text-muted-foreground mt-1">
            Manage training programs, courses, and pricing ({programs.length}{" "}
            total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programs..."
              className="pl-9 w-full sm:w-64 bg-background"
            />
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Program
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-75">Program</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center min-h-64 text-center p-8">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                      <GripVertical className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Failed to load programs
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                      {fetchError}
                    </p>
                    <Button onClick={load} className="gap-2" variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No programs found. Try a different search term or add a new
                  program.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {p.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.trainer}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.duration}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{p.price.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AnimatedSwitch
                        checked={p.active}
                        onChange={() => toggleActive(p)}
                        className="scale-75 origin-left"
                      />
                      <span
                        className={`text-xs font-medium ${p.active ? "text-emerald-500" : "text-muted-foreground"}`}
                      >
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <AnimatedEditButton onClick={() => openEdit(p)} />
                      <AnimatedDeleteButton
                        onClick={() => handleDelete(p.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Program" : "New Program"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this training program."
                : "Fill in the details to create a new program."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name: val,
                      ...(!editingId ? { slug: slugify(val) } : {}),
                    }));
                  }}
                  placeholder="e.g. 12-Week Transformation"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="e.g. 12-week-transformation"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  placeholder="e.g. 8 weeks"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trainer Name</label>
                <Input
                  value={form.trainer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trainer: e.target.value }))
                  }
                  placeholder="e.g. Coach Sarah"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <Select
                  value={form.level}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, level: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Beginner", "Intermediate", "Advanced", "All Levels"].map(
                      (l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Program Image</label>
              <div className="space-y-3">
                <ImageUpload
                  value={form.imageUrl || ""}
                  onChange={(url, publicId) =>
                    setForm((f) => ({
                      ...f,
                      imageUrl: url,
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
                  placeholder="Paste Image URL..."
                  value={form.imageUrl || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Benefits</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                  placeholder="- Add a benefit and press Enter"
                />
                <Button
                  onClick={addBenefit}
                  variant="secondary"
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                
                  {form.benefits.map((b, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                    >
                      <Check className="w-3 h-3" /> {b}
                      <Button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            benefits: f.benefits.filter((_, j) => j !== i),
                          }))
                        }
                        className="ml-0.5 hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </span>
                  ))}
                
              </div>
            </div>

            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border">
              <label className="text-sm font-medium flex-1">
                Active Status
              </label>
              <AnimatedSwitch
                checked={form.active}
                onChange={(c) => setForm((f) => ({ ...f, active: c }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

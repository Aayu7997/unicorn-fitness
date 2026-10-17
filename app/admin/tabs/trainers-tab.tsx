"use client";

import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
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
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { AnimatedSwitch } from "@/components/ui/animated-switch";
import { ImageUpload } from "@/components/image-upload";

interface Trainer {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  bio: string;
  imageUrl?: string;
  imagePublicId?: string;
  active: boolean;
  sortOrder: number;
}

const EMPTY = {
  name: "",
  role: "",
  specialty: "",
  experience: "",
  bio: "",
  imageUrl: "",
  imagePublicId: "",
  active: true,
};

export function TrainersTab() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/trainers");
      if (res.ok) {
        setTrainers(await res.json());
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      console.error(err);
      setFetchError("Failed to load trainers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setError("");
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (t: Trainer) => {
    setForm({
      name: t.name,
      role: t.role,
      specialty: t.specialty,
      experience: t.experience,
      bio: t.bio,
      imageUrl: t.imageUrl ?? "",
      imagePublicId: t.imagePublicId ?? "",
      active: t.active,
    });
    setError("");
    setEditingId(t.id);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `/api/admin/trainers/${editingId}`
        : "/api/admin/trainers";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Failed");
        return;
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      setError("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    try {
      await fetch(`/api/admin/trainers/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const toggle = async (t: Trainer) => {
    try {
      await fetch(`/api/admin/trainers/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !t.active }),
      });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = trainers.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.specialty.toLowerCase().includes(search.toLowerCase()),
  );

  const fields = [
    { label: "Full Name", key: "name" },
    { label: "Role / Title", key: "role" },
    { label: "Specialty", key: "specialty" },
    { label: "Experience (e.g. 8 Years)", key: "experience" },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trainers</h2>
          <p className="text-muted-foreground mt-1">
            Manage your coaching staff and their profiles ({trainers.length}{" "}
            total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainers..."
              className="pl-9 w-full sm:w-64 bg-background"
            />
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Trainer
          </Button>
        </div>
      </div>

      {/* Trainers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-100 border rounded-xl border-dashed bg-muted/10 text-center p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <Search className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Failed to load trainers
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {fetchError}
          </p>
          <Button onClick={load} className="gap-2" variant="outline">
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-100 border rounded-xl border-dashed bg-muted/10 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No Trainers Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We couldn't find any trainers matching your search criteria.
          </p>
        </div>
      ) : (
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((t, i) => (
              <div key={t.id}>
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {t.imageUrl ? (
                        <img
                          src={t.imageUrl}
                          alt={t.name}
                          className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-muted"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl shrink-0 border-2 border-muted">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                          {t.name}
                        </CardTitle>
                        <p className="text-sm text-primary font-medium truncate mt-0.5">
                          {t.role}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.specialty}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {t.bio || "No biography provided."}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <AnimatedSwitch
                          checked={t.active}
                          onChange={() => toggle(t)}
                          className="scale-75 origin-left"
                        />
                        <span
                          className={`text-xs font-medium ${t.active ? "text-emerald-500" : "text-muted-foreground"}`}
                        >
                          {t.active ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <AnimatedEditButton
                          onClick={() => openEdit(t)}
                          className="scale-90"
                        />
                        <AnimatedDeleteButton
                          onClick={() => del(t.id)}
                          className="scale-90"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Trainer" : "New Trainer"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this trainer profile."
                : "Add a new trainer to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <label className="text-sm font-medium">{f.label}</label>
                  <Input
                    value={(form as Record<string, unknown>)[f.key] as string}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trainer Photo</label>
              <div className="space-y-3">
                <ImageUpload
                  value={form.imageUrl}
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
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bio: e.target.value }))
                }
                rows={3}
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
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
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Trainer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

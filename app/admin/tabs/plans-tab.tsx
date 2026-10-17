"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Check, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
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

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  active: boolean;
  sortOrder: number;
}

const EMPTY = {
  name: "",
  price: 0,
  period: "month",
  description: "",
  features: [] as string[],
  popular: false,
  active: true,
  sortOrder: 0,
};

export function PlansTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        setPlans(await res.json());
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      console.error(err);
      setFetchError("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setFeatureInput("");
    setError("");
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p: Plan) => {
    setForm({
      name: p.name,
      price: p.price,
      period: p.period,
      description: p.description,
      features: [...p.features],
      popular: p.popular,
      active: p.active,
      sortOrder: p.sortOrder,
    });
    setFeatureInput("");
    setError("");
    setEditingId(p.id);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `/api/admin/plans/${editingId}`
        : "/api/admin/plans";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
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
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((f) => ({
        ...f,
        features: [...f.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pricing Plans</h2>
          <p className="text-muted-foreground mt-1">
            Manage your membership tiers, pricing, and features ({plans.length}{" "}
            total)
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-100 border rounded-xl border-dashed bg-muted/10 text-center p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <Star className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Failed to load plans
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {fetchError}
          </p>
          <Button onClick={load} className="gap-2" variant="outline">
            Retry
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-100 border rounded-xl border-dashed bg-muted/10 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No Plans Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            You haven't created any pricing plans yet.
          </p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Create First Plan
          </Button>
        </div>
      ) : (
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map((p, i) => (
              <div
                key={p.id}
                className={`relative ${!p.active ? "opacity-50 grayscale-[0.5]" : ""}`}
              >
                <Card
                  className={`h-full flex flex-col hover:border-primary/50 transition-colors group ${p.popular ? "border-primary shadow-sm" : ""}`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                        <Star className="w-3 h-3 mr-1 fill-current inline-block" />{" "}
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{p.name}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">
                        /{p.period}
                      </span>
                    </div>
                    <CardDescription className="pt-2">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <ul className="space-y-2.5">
                      {p.features.slice(0, 4).map((f, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {p.features.length > 4 && (
                        <li className="text-xs text-muted-foreground italic pl-6 mt-2">
                          + {p.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0 flex items-center justify-end gap-2 border-t p-4 bg-muted/20">
                    <AnimatedEditButton onClick={() => openEdit(p)} />
                    <AnimatedDeleteButton onClick={() => del(p.id)} />
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Plan" : "New Plan"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this pricing plan."
                : "Add a new pricing plan for your members."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Name</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Pro Membership"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: Number(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Period</label>
                <Input
                  value={form.period}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, period: e.target.value }))
                  }
                  placeholder="e.g. month"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief description of the plan"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Features</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Add feature and press Enter"
                />
                <Button
                  onClick={addFeature}
                  variant="secondary"
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1.5 max-h-37.5 overflow-y-auto pr-2">
                
                  {form.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-sm truncate">{feat}</span>
                      </div>
                      <Button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            features: f.features.filter((_, j) => j !== i),
                          }))
                        }
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                <label className="text-sm font-medium">Popular Plan</label>
                <AnimatedSwitch
                  checked={form.popular}
                  onChange={(c) => setForm((f) => ({ ...f, popular: c }))}
                />
              </div>
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                <label className="text-sm font-medium">Active Status</label>
                <AnimatedSwitch
                  checked={form.active}
                  onChange={(c) => setForm((f) => ({ ...f, active: c }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

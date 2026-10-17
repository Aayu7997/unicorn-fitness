"use client";

import { useState } from "react";
import useSWR from "swr";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import {
  Activity,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { useToast } from "@/hooks/use-toast";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MeasurementsTab() {
  const { toast } = useToast();
  const {
    data: measurements,
    mutate,
    isLoading,
  } = useSWR("/api/admin/measurements", fetcher, { refreshInterval: 5000 });
  const { data: usersData } = useSWR("/api/admin/members", fetcher);
  const users = usersData?.users || [];

  const [modal, setModal] = useState({ open: false, editing: null as any });
  const [form, setForm] = useState({
    userId: "",
    weight: "",
    bodyFat: "",
    muscleMass: "",
    goal: "Maintain",
    date: "",
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const openCreate = () => {
    setForm({
      userId: "",
      weight: "",
      bodyFat: "",
      muscleMass: "",
      goal: "Maintain",
      date: new Date().toISOString().split("T")[0],
    });
    setModal({ open: true, editing: null });
  };

  const openEdit = (m: any) => {
    setForm({
      userId: m.userId || "",
      weight: m.weight.replace("kg", ""),
      bodyFat: m.bodyFat !== "-" ? m.bodyFat.replace("%", "") : "",
      muscleMass: m.muscleMass !== "-" ? m.muscleMass.replace("kg", "") : "",
      goal: m.goal,
      date: m.date,
    });
    setModal({ open: true, editing: m });
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = modal.editing
        ? `/api/admin/measurements/${modal.editing.id}`
        : "/api/admin/measurements";
      const method = modal.editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        mutate();
        setModal({ open: false, editing: null });
        toast({
          title: "Success",
          description: "Measurement saved successfully.",
        });
      } else {
        const d = await res.json();
        toast({
          title: "Error",
          description: d.error || "Failed to save",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this measurement?")) return;
    await fetch(`/api/admin/measurements/${id}`, { method: "DELETE" });
    mutate();
    toast({ title: "Success", description: "Measurement deleted." });
  };

  const filtered = Array.isArray(measurements)
    ? measurements.filter((m: any) =>
        m.member.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Measurements</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track member physical progress & body metrics
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Record Measurement
        </Button>
      </div>

      <Card>
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
          <CardTitle className="text-lg">Recent Measurements</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search member..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-162.5">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Body Fat %</TableHead>
                  <TableHead>Muscle Mass</TableHead>
                  <TableHead className="text-right">Current Goal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !filtered.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No measurements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-muted-foreground">
                        {record.date}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{record.member}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.weight}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.bodyFat}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.muscleMass}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            record.goal === "Cut"
                              ? "border-orange-500/50 text-warning bg-warning/10"
                              : record.goal === "Bulk"
                                ? "border-purple-500/50 text-primary bg-primary/10"
                                : "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
                          }
                        >
                          {record.goal}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <AnimatedEditButton
                            onClick={() => openEdit(record)}
                          />
                          <AnimatedDeleteButton
                            onClick={() => del(record.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={modal.open}
        onOpenChange={(open) =>
          !open && setModal({ open: false, editing: null })
        }
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {modal.editing ? "Edit Measurement" : "Record Measurement"}
            </DialogTitle>
            <DialogDescription>
              Add a new body measurement entry for a member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <Select
                value={form.userId}
                onValueChange={(val) => setForm((f) => ({ ...f, userId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a member..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, weight: e.target.value }))
                  }
                  placeholder="e.g. 75"
                />
              </div>
              <div className="space-y-2">
                <Label>Body Fat (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.bodyFat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bodyFat: e.target.value }))
                  }
                  placeholder="e.g. 15"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Muscle Mass (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.muscleMass}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, muscleMass: e.target.value }))
                  }
                  placeholder="e.g. 35"
                />
              </div>
              <div className="space-y-2">
                <Label>Goal</Label>
                <Select
                  value={form.goal}
                  onValueChange={(val) => setForm((f) => ({ ...f, goal: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cut">Cut</SelectItem>
                    <SelectItem value="Bulk">Bulk</SelectItem>
                    <SelectItem value="Maintain">Maintain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
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

"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  HelpCircle,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  X,
  Users,
  Calendar,
} from "lucide-react";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AdvisoryTab() {
  const { toast } = useToast();
  const {
    data: sessions,
    mutate,
    isLoading,
  } = useSWR("/api/admin/advisory", fetcher, { refreshInterval: 5000 });
  const { data: usersData } = useSWR("/api/admin/members", fetcher);
  const users = usersData?.users || [];

  const [modal, setModal] = useState({ open: false, editing: null as any });
  const [form, setForm] = useState({
    userId: "",
    topic: "",
    advisor: "",
    status: "Upcoming",
    date: "",
  });
  const [saving, setSaving] = useState(false);

  const upcomingCount = Array.isArray(sessions)
    ? sessions.filter((s: any) => s.status === "Upcoming").length
    : 0;
  const completedCount = Array.isArray(sessions)
    ? sessions.filter((s: any) => s.status === "Completed").length
    : 0;

  const openCreate = () => {
    setForm({
      userId: "",
      topic: "",
      advisor: "",
      status: "Upcoming",
      date: new Date().toISOString().split("T")[0],
    });
    setModal({ open: true, editing: null });
  };

  const openEdit = (s: any) => {
    setForm({
      userId: s.userId || "",
      topic: s.topic,
      advisor: s.advisor,
      status: s.status,
      date: s.date,
    });
    setModal({ open: true, editing: s });
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = modal.editing
        ? `/api/admin/advisory/${modal.editing.id}`
        : "/api/admin/advisory";
      const method = modal.editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        mutate();
        setModal({ open: false, editing: null });
        toast({ title: "Success", description: "Session saved successfully." });
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
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/admin/advisory/${id}`, { method: "DELETE" });
    mutate();
    toast({ title: "Success", description: "Session deleted." });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advisory</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage consultation and advisory sessions.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Schedule Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sessions
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Advisory Sessions</CardTitle>
          <CardDescription>
            View and manage all upcoming and past consultation sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading sessions...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(sessions) || !sessions.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No sessions scheduled.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {session.date}
                      </TableCell>
                      <TableCell>{session.member}</TableCell>
                      <TableCell>{session.topic}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.advisor}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            session.status === "Completed"
                              ? "border-emerald-500 text-emerald-500"
                              : session.status === "Cancelled"
                                ? "border-destructive text-destructive"
                                : "border-primary text-primary"
                          }
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <AnimatedEditButton
                            onClick={() => openEdit(session)}
                          />
                          <AnimatedDeleteButton
                            onClick={() => del(session.id)}
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
        onOpenChange={(o) => !o && setModal({ open: false, editing: null })}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {modal.editing ? "Edit Session" : "Schedule Session"}
            </DialogTitle>
            <DialogDescription>
              {modal.editing
                ? "Update the details of the advisory session."
                : "Create a new consultation session for a member."}
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

            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                value={form.topic}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topic: e.target.value }))
                }
                placeholder="e.g. Diet Optimization"
              />
            </div>

            <div className="space-y-2">
              <Label>Advisor Name</Label>
              <Input
                value={form.advisor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, advisor: e.target.value }))
                }
                placeholder="e.g. Coach Greg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModal({ open: false, editing: null })}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

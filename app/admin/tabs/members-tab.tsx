"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Download,
  User,
  Users,
  Check,
  CreditCard,
  Activity,
  Calendar as CalendarIcon,
  Bell,
  Layers,
  AlertTriangle,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { ImageUpload } from "@/components/image-upload";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  memberId?: string;
  role: string;
  createdAt: string;
  age?: number;
  height?: number;
  programs?: { id: string }[];
  progressLogs?: { weight: number }[];
  membership: {
    plan: { id: string; name: string; price: number };
    status: string;
    endDate: string;
  } | null;
  assignedPlans?: { type: string; content: string }[];
  avatarUrl?: string;
  avatarPublicId?: string;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  memberId: "",
  role: "user" as "user" | "admin",
  password: "",
  membershipId: "",
  age: "" as number | "",
  height: "" as number | "",
  weight: "" as number | "",
  programIds: [] as string[],
  newPlanId: "",
  cancelMembership: false,
  workout: "",
  diet: "",
  avatarUrl: "",
  avatarPublicId: "",
};

export function MembersTab() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [billingPlans, setBillingPlans] = useState<
    { id: string; name: string; price: number; period?: string }[]
  >([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState({
    open: false,
    editing: null as Member | null,
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeModalTab, setActiveModalTab] = useState("general");
  const [promoMessage, setPromoMessage] = useState("");
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);
  const [isSendingPromo, setIsSendingPromo] = useState(false);

  const [memberClasses, setMemberClasses] = useState<any[]>([]);
  const [bookedClassIds, setBookedClassIds] = useState<string[]>([]);
  const [notifForm, setNotifForm] = useState({
    title: "",
    message: "",
    type: "info",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(search ? { search } : {}),
      });
      const [resMembers, resPrograms, resPlans] = await Promise.all([
        fetch(`/api/admin/members?${params}`),
        fetch(`/api/admin/programs`),
        fetch(`/api/admin/plans`),
      ]);
      if (!resMembers.ok) {
        throw new Error("Failed to load members");
      }
      if (resMembers.ok) {
        const d = await resMembers.json();
        setMembers(d.users);
        setTotal(d.total);
      }
      if (resPrograms.ok) {
        const d = await resPrograms.json();
        setPrograms(d);
      }
      if (resPlans.ok) {
        const d = await resPlans.json();
        setBillingPlans(d);
      }
    } catch (err) {
      setFetchError("Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError("");
    setActiveModalTab("general");
    setModal({ open: true, editing: null });
  };

  const openEdit = async (m: Member) => {
    const { id, update } = toast({
      title: "Loading member details...",
      description: "Please wait.",
    });
    try {
      const res = await fetch(`/api/admin/members/${m.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setForm({
          name: fullData.name,
          email: fullData.email,
          phone: fullData.phone ?? "",
          memberId: fullData.memberId ?? "",
          role: fullData.role as "user" | "admin",
          password: "",
          membershipId: "",
          age: fullData.age ?? "",
          height: fullData.height ?? "",
          weight: fullData.progressLogs?.[0]?.weight ?? "",
          programIds: fullData.programs?.map((p: any) => p.id) ?? [],
          newPlanId: "",
          cancelMembership: false,
          workout:
            fullData.assignedPlans?.find((p: any) => p.type === "workout")
              ?.content || "",
          diet:
            fullData.assignedPlans?.find((p: any) => p.type === "diet")
              ?.content || "",
          avatarUrl: fullData.avatarUrl ?? "",
          avatarPublicId: fullData.avatarPublicId ?? "",
        });
        setError("");
        setActiveModalTab("general");
        setModal({ open: true, editing: m });
        fetch(`/api/admin/members/${m.id}/classes`)
          .then((r) => r.json())
          .then((d) => {
            setMemberClasses(d.classes || []);
            setBookedClassIds(d.bookedIds || []);
          });
        update({
          id,
          title: "Loaded",
          description: "Member details loaded.",
          duration: 1000,
        });
      } else {
        update({
          id,
          title: "Error",
          description: "Failed to fetch member details.",
          variant: "destructive",
        });
      }
    } catch (e) {
      update({
        id,
        title: "Error",
        description: "Server error.",
        variant: "destructive",
      });
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const {
        password,
        weight,
        age,
        height,
        newPlanId,
        cancelMembership,
        ...rest
      } = form;
      const body: any = {
        ...rest,
        ...(password ? { password } : {}),
        ...(age !== "" ? { age: Number(age) } : { age: null }),
        ...(height !== "" ? { height: Number(height) } : { height: null }),
        ...(weight !== "" ? { weight: Number(weight) } : { weight: null }),
        ...(newPlanId ? { newPlanId } : {}),
        ...(cancelMembership ? { cancelMembership } : {}),
      };

      const url = modal.editing
        ? `/api/admin/members/${modal.editing.id}`
        : "/api/admin/members";
      const res = await fetch(url, {
        method: modal.editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Failed");
        return;
      }

      if (
        modal.editing &&
        (form.workout !== undefined || form.diet !== undefined)
      ) {
        await fetch(`/api/admin/members/${modal.editing.id}/assign-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workout: form.workout, diet: form.diet }),
        });
      }

      setModal({ open: false, editing: null });
      load();
      toast({ title: "Success", description: "Member saved successfully." });
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this member? This cannot be undone.")) return;
    await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    load();
    toast({ title: "Success", description: "Member deleted." });
  };

  const generatePromo = async (type: string) => {
    if (!modal.editing) return;
    setIsGeneratingPromo(true);
    setPromoMessage("Generating...");
    try {
      const res = await fetch(
        `/api/admin/members/${modal.editing.id}/ai-promo/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setPromoMessage(data.message);
      } else {
        setPromoMessage("Failed to generate.");
      }
    } catch (e) {
      setPromoMessage("Error generating message.");
    } finally {
      setIsGeneratingPromo(false);
    }
  };

  const sendPromo = async () => {
    if (
      !modal.editing ||
      !promoMessage ||
      promoMessage === "Generating..." ||
      promoMessage.startsWith("Failed") ||
      promoMessage.startsWith("Error")
    )
      return;
    setIsSendingPromo(true);
    try {
      const res = await fetch(
        `/api/admin/members/${modal.editing.id}/ai-promo/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: promoMessage, type: "Promo" }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast({ title: "Message sent successfully!" });
        setPromoMessage("");
      } else {
        toast({ title: "Failed to send message.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error sending message.", variant: "destructive" });
    } finally {
      setIsSendingPromo(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Status", "Joined Date"];
    const csvContent = [
      headers.join(","),
      ...members.map((m) =>
        [
          m.id,
          `"${m.name}"`,
          `"${m.email}"`,
          m.role,
          m.membership?.status || "inactive",
          m.createdAt,
        ].join(","),
      ),
    ].join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "members.csv");
    link.click();
  };

  const toggleProgram = (id: string) => {
    setForm((f) => ({
      ...f,
      programIds: f.programIds.includes(id)
        ? f.programIds.filter((pid) => pid !== id)
        : [...f.programIds, id],
    }));
  };

  const toggleClassBooking = async (classId: string, isBooked: boolean) => {
    if (!modal.editing) return;
    const action = isBooked ? "unbook" : "book";
    try {
      const res = await fetch(
        `/api/admin/members/${modal.editing.id}/classes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId, action }),
        },
      );
      if (res.ok) {
        setBookedClassIds((prev) =>
          action === "book"
            ? [...prev, classId]
            : prev.filter((id) => id !== classId),
        );
        setMemberClasses((prev) =>
          prev.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  bookedCount: c.bookedCount + (action === "book" ? 1 : -1),
                }
              : c,
          ),
        );
        toast({
          title: "Success",
          description: `Class ${action}ed successfully.`,
        });
      } else {
        const d = await res.json();
        toast({
          title: "Error",
          description: d.error || "Failed to update class",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Server error",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === "active")
      return (
        <Badge
          variant="default"
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Active
        </Badge>
      );
    if (status === "expiring")
      return (
        <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
          Expiring
        </Badge>
      );
    return <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <div className="space-y-6 pb-20 max-w-full animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" /> Manage {total} total members
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search members..."
              className="pl-9 w-full bg-background"
            />
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2 flex-1 sm:flex-initial">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={openCreate} className="gap-2 flex-1 sm:flex-initial">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium uppercase tracking-wider">
              Loading Members...
            </p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-foreground font-semibold text-lg mb-2">
              Failed to load members
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {fetchError}
            </p>
            <Button onClick={load} className="gap-2" variant="outline">
              Retry
            </Button>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-semibold text-lg mb-2">
              No members found
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              You haven't added any members yet, or none match your search
              criteria.
            </p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Add your first member
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-160">
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold shrink-0">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{m.name}</p>
                            {m.role === "admin" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] mt-1 h-4"
                              >
                                ADMIN
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.email}
                      </TableCell>
                      <TableCell>
                        {m.membership ? (
                          <Badge variant="outline">
                            {m.membership.plan.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">
                            No plan
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(m.membership?.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(m.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                          <AnimatedEditButton
                            onClick={() => openEdit(m)}
                            className="scale-75 origin-right"
                          />
                          <AnimatedDeleteButton onClick={() => del(m.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {total > 15 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <span className="text-muted-foreground text-sm">
                  Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)}{" "}
                  of {total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / 15)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* MEMBER MODAL */}
      <Dialog
        open={modal.open}
        onOpenChange={(open) =>
          !open && setModal({ open: false, editing: null })
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>
              {modal.editing ? `Manage ${modal.editing.name}` : "Add Member"}
            </DialogTitle>
            <DialogDescription>
              {modal.editing
                ? "View and update member details, plans, and progression."
                : "Create a new member profile."}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeModalTab}
            onValueChange={setActiveModalTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-2 border-b bg-muted/20">
              <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent p-0 gap-2">
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-background"
                >
                  <User className="w-4 h-4 mr-2" /> General
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="data-[state=active]:bg-background"
                >
                  <Activity className="w-4 h-4 mr-2" /> Stats
                </TabsTrigger>
                <TabsTrigger
                  value="programs"
                  className="data-[state=active]:bg-background"
                >
                  <Layers className="w-4 h-4 mr-2" /> Programs
                </TabsTrigger>
                <TabsTrigger
                  value="plans"
                  className="data-[state=active]:bg-background"
                >
                  <Bell className="w-4 h-4 mr-2" /> Plans
                </TabsTrigger>
                <TabsTrigger
                  value="membership"
                  className="data-[state=active]:bg-background"
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Billing
                </TabsTrigger>
                <TabsTrigger
                  value="classes"
                  className="data-[state=active]:bg-background"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" /> Classes
                </TabsTrigger>
                {modal.editing && (
                  <TabsTrigger
                    value="notifications"
                    className="data-[state=active]:bg-background"
                  >
                    <Bell className="w-4 h-4 mr-2" /> AI Promo
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="p-3 mb-4 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              <TabsContent value="general" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      disabled={!!modal.editing}
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Member ID</label>
                    <Input
                      value={form.memberId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, memberId: e.target.value }))
                      }
                      placeholder="e.g. UFC-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select
                      value={form.role}
                      onValueChange={(val: "user" | "admin") =>
                        setForm((f) => ({ ...f, role: val }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Profile Photo</label>
                    <ImageUpload
                      value={form.avatarUrl}
                      onChange={(url, publicId) =>
                        setForm((p) => ({
                          ...p,
                          avatarUrl: url,
                          avatarPublicId: publicId,
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">
                      {modal.editing ? "New Password (Optional)" : "Password"}
                    </label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      placeholder={
                        modal.editing
                          ? "Leave blank to keep"
                          : "Min 8 characters"
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-0 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age</label>
                    <Input
                      type="number"
                      value={form.age}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          age: e.target.value ? Number(e.target.value) : "",
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height (cm)</label>
                    <Input
                      type="number"
                      value={form.height}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          height: e.target.value ? Number(e.target.value) : "",
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Current Weight (kg)
                    </label>
                    <Input
                      type="number"
                      value={form.weight}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          weight: e.target.value ? Number(e.target.value) : "",
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <strong>Note:</strong> Updating the weight will automatically
                  log a new entry in the user's progress tracker for today's
                  date.
                </div>
              </TabsContent>

              <TabsContent value="programs" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Assign workout programs (templates) to this user's dashboard.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {programs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No programs available.
                    </p>
                  ) : (
                    programs.map((p) => {
                      const isSelected = form.programIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProgram(p.id)}
                          className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border-primary text-primary" : "bg-background hover:bg-muted"}`}
                        >
                          <span className="text-sm font-medium">{p.name}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="plans" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Write personalized text/markdown plans for this user.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workout Plan</label>
                  <Textarea
                    value={form.workout}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, workout: e.target.value }))
                    }
                    className="min-h-30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diet Plan</label>
                  <Textarea
                    value={form.diet}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, diet: e.target.value }))
                    }
                    className="min-h-30"
                  />
                </div>
              </TabsContent>

              <TabsContent value="membership" className="mt-0 space-y-6">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="text-sm font-medium uppercase tracking-wide mb-3">
                    Current Membership
                  </h4>
                  {modal.editing?.membership ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold">
                          {modal.editing.membership.plan.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(modal.editing.membership.status)}
                          <span className="text-sm text-muted-foreground">
                            Valid until:{" "}
                            {new Date(
                              modal.editing.membership.endDate,
                            ).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                      {modal.editing.membership.status === "active" &&
                      !form.cancelMembership ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              cancelMembership: true,
                              newPlanId: "",
                            }))
                          }
                        >
                          Discontinue
                        </Button>
                      ) : form.cancelMembership ? (
                        <div className="text-right">
                          <Badge variant="destructive">Will be Cancelled</Badge>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 ml-2"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                cancelMembership: false,
                              }))
                            }
                          >
                            Undo
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No active membership.
                    </p>
                  )}
                </div>

                {!form.cancelMembership && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium uppercase tracking-wide">
                      Assign New Plan
                    </h4>
                    <Select
                      value={form.newPlanId || undefined}
                      onValueChange={(val) =>
                        setForm((f) => ({
                          ...f,
                          newPlanId: val,
                          cancelMembership: false,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select a new plan to assign..." />
                      </SelectTrigger>
                      <SelectContent>
                        {billingPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - ₹{plan.price.toLocaleString("en-IN")}{" "}
                            {plan.period ? `(${plan.period})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.newPlanId && (
                      <p className="text-sm text-primary">
                        Assigning this plan will immediately activate it and
                        cancel any existing membership.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="classes" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Assign scheduled classes to this member.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {memberClasses.length === 0 ? (
                    <div className="col-span-2 p-8 border rounded-md border-dashed text-center">
                      <p className="text-sm text-muted-foreground">
                        No classes available. Create them in the schedule tab.
                      </p>
                    </div>
                  ) : (
                    memberClasses.map((cls) => {
                      const isBooked = bookedClassIds.includes(cls.id);
                      const isFull = cls.bookedCount >= cls.capacity;
                      return (
                        <div
                          key={cls.id}
                          onClick={() =>
                            (!isFull || isBooked) &&
                            toggleClassBooking(cls.id, isBooked)
                          }
                          className={`p-4 rounded-md border cursor-pointer transition-colors ${isBooked ? "bg-primary/10 border-primary" : "bg-background hover:bg-muted"} ${isFull && !isBooked ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm">
                              {cls.name}
                            </span>
                            {isBooked && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              {cls.dayOfWeek} at {cls.time}
                            </p>
                            <p>Trainer: {cls.trainer}</p>
                            <Badge
                              variant={isBooked ? "default" : "secondary"}
                              className="mt-2"
                            >
                              {cls.bookedCount} / {cls.capacity} Booked{" "}
                              {isFull && !isBooked && "(Full)"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {modal.editing && (
                <TabsContent value="notifications" className="mt-0 space-y-4">
                  <div className="p-4 rounded-lg border bg-primary/5">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" /> AI Promotion
                      Templates
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use AI to generate personalized promotional messages or
                      renewal reminders for {modal.editing.name}.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Button
                        variant="outline"
                        disabled={isGeneratingPromo}
                        onClick={() => generatePromo("Renewal Reminder")}
                        className="flex flex-col items-start h-auto p-3 py-2"
                      >
                        <span className="font-semibold">Renewal Reminder</span>
                        <span className="text-xs text-muted-foreground font-normal mt-1">
                          Friendly nudge to renew
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isGeneratingPromo}
                        onClick={() => generatePromo("Special Offer")}
                        className="flex flex-col items-start h-auto p-3 py-2"
                      >
                        <span className="font-semibold">Special Offer</span>
                        <span className="text-xs text-muted-foreground font-normal mt-1">
                          Personal trainer discount
                        </span>
                      </Button>
                    </div>
                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-medium">
                        Custom Message
                      </label>
                      <Textarea
                        value={promoMessage}
                        onChange={(e) => setPromoMessage(e.target.value)}
                        placeholder="Type your message here..."
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={sendPromo}
                        disabled={isSendingPromo || !promoMessage}
                      >
                        {isSendingPromo ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-muted/20">
            <Button
              variant="ghost"
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

"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  CreditCard,
  Filter,
  Plus,
  Pencil,
  Trash2,
  X,
  Download,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function InvoicesTab() {
  const { toast } = useToast();
  const {
    data: invoices,
    mutate,
    isLoading,
    error: fetchError,
  } = useSWR("/api/admin/invoices", fetcher, { refreshInterval: 5000 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    userId: "",
    planName: "",
    amount: "",
    status: "Paid",
    date: "",
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const { data: usersData } = useSWR("/api/admin/members", fetcher);
  const users = usersData?.users || [];

  const collected30d = Array.isArray(invoices)
    ? invoices
        .filter((i: any) => i.status === "Paid")
        .reduce((sum: number, i: any) => sum + Number(i.amount), 0)
    : 0;
  const overdueTotal = Array.isArray(invoices)
    ? invoices
        .filter((i: any) => i.status === "Overdue")
        .reduce((sum: number, i: any) => sum + Number(i.amount), 0)
    : 0;
  const pendingTotal = Array.isArray(invoices)
    ? invoices
        .filter((i: any) => i.status === "Pending")
        .reduce((sum: number, i: any) => sum + Number(i.amount), 0)
    : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const openCreate = () => {
    setForm({
      userId: "",
      planName: "",
      amount: "",
      status: "Paid",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (inv: any) => {
    setForm({
      userId: inv.userId || "",
      planName: inv.plan || "",
      amount: inv.amount.toString(),
      status: inv.status,
      date: inv.date,
    });
    setEditingId(inv.id);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/invoices/${editingId}`
        : "/api/admin/invoices";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        mutate();
        setModalOpen(false);
        toast({ title: "Success", description: "Invoice saved successfully." });
      } else {
        const d = await res.json();
        toast({
          title: "Error",
          description: d.error || "Failed to save invoice",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "A network error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
      mutate();
      toast({ title: "Success", description: "Invoice deleted." });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
      });
    }
  };

  const filteredInvoices = Array.isArray(invoices)
    ? invoices.filter((inv) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          (inv.member && inv.member.toLowerCase().includes(searchLower)) ||
          (inv.plan && inv.plan.toLowerCase().includes(searchLower)) ||
          (inv.status && inv.status.toLowerCase().includes(searchLower))
        );
      })
    : [];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Invoices & Billing
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage payments, track collections, and issue new invoices
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button onClick={openCreate} className="gap-2 flex-1 sm:flex-initial">
            <Plus className="w-4 h-4" /> Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Collected (30d)
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <span className="text-3xl font-bold">
              {formatCurrency(collected30d)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Pending
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <span className="text-3xl font-bold">
              {formatCurrency(pendingTotal)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Overdue
              </span>
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-destructive" />
              </div>
            </div>
            <span className="text-3xl font-bold text-destructive">
              {formatCurrency(overdueTotal)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 gap-3">
          <h3 className="font-semibold">Recent Transactions</h3>
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 h-9"
          />
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-137.5">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center min-h-64 text-center p-8">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Failed to load invoices
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                      There was a problem retrieving the invoice data.
                    </p>
                    <Button onClick={() => mutate()} className="gap-2" variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No invoices found. Try a different search term or create a new
                  invoice.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv: any) => (
                <TableRow key={inv.id} className="group">
                  <TableCell className="text-muted-foreground">
                    {inv.date}
                  </TableCell>
                  <TableCell className="font-medium">{inv.member}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {inv.plan}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        inv.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : inv.status === "Overdue"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AnimatedEditButton onClick={() => openEdit(inv)} />
                      <AnimatedDeleteButton onClick={() => del(inv.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Invoice" : "Create Invoice"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this invoice."
                : "Generate a new invoice for a member."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Member</label>
              <Select
                value={form.userId}
                onValueChange={(val) => setForm((f) => ({ ...f, userId: val }))}
              >
                <SelectTrigger className="w-full">
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
              <label className="text-sm font-medium">
                Plan Name / Description
              </label>
              <Input
                value={form.planName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, planName: e.target.value }))
                }
                placeholder="e.g. Elite Plan - 1 Month"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (INR)</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, status: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

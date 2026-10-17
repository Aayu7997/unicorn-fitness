"use client";

import { useState } from "react";
import useSWR from "swr";
import { TrendingDown, Filter, Plus, Download, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AnimatedEditButton } from "@/components/ui/animated-edit-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ExpensesTab() {
  const { toast } = useToast();
  const {
    data: expenses,
    mutate,
    isLoading,
    error: fetchError,
  } = useSWR("/api/admin/expenses", fetcher, { refreshInterval: 5000 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "Equipment",
    description: "",
    amount: "",
    status: "Paid",
    date: "",
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const totalExpenses = Array.isArray(expenses)
    ? expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
    : 0;
  const pendingTotal = Array.isArray(expenses)
    ? expenses
        .filter((e: any) => e.status === "Pending")
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0)
    : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const openCreate = () => {
    setForm({
      category: "Equipment",
      description: "",
      amount: "",
      status: "Paid",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (exp: any) => {
    setForm({
      category: exp.category,
      description: exp.description,
      amount: exp.amount.toString(),
      status: exp.status,
      date: exp.date,
    });
    setEditingId(exp.id);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/expenses/${editingId}`
        : "/api/admin/expenses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        mutate();
        setModalOpen(false);
        toast({ title: "Success", description: "Expense saved successfully." });
      } else {
        const d = await res.json();
        toast({
          title: "Error",
          description: d.error || "Failed to save expense",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Server Error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
      mutate();
      toast({ title: "Success", description: "Expense deleted." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete expense.",
        variant: "destructive",
      });
    }
  };

  const filteredExpenses = Array.isArray(expenses)
    ? expenses.filter((exp: any) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          exp.description?.toLowerCase().includes(s) ||
          exp.category?.toLowerCase().includes(s)
        );
      })
    : [];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground mt-1">
            Track and manage gym expenditures and outgoing payments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button onClick={openCreate} className="gap-2 flex-1 sm:flex-initial">
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </span>
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
            </div>
            <span className="text-3xl font-bold text-destructive">
              {formatCurrency(totalExpenses)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Pending Payments
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <span className="text-3xl font-bold">
              {formatCurrency(pendingTotal)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 gap-3">
          <h3 className="font-semibold">Recent Expenses</h3>
          <Input
            placeholder="Search expenses..."
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
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
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
                      <Receipt className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Failed to load expenses
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                      There was a problem retrieving the expense data.
                    </p>
                    <Button onClick={() => mutate()} className="gap-2" variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((exp: any) => (
                <TableRow key={exp.id} className="group">
                  <TableCell className="text-muted-foreground">
                    {exp.date}
                  </TableCell>
                  <TableCell className="font-medium">{exp.category}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {exp.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        exp.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }
                    >
                      {exp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(exp.amount)}
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
                      <AnimatedEditButton onClick={() => openEdit(exp)} />
                      <AnimatedDeleteButton onClick={() => del(exp.id)} />
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
              {editingId ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this expense."
                : "Record a new expense for the gym."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.category}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, category: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="e.g. AC Repair"
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <AnimatedSaveButton onClick={save} disabled={saving} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Dumbbell,
  Coffee,
  Shirt,
  ArrowDownToLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "All",
  "Equipment",
  "Supplements",
  "Merchandise",
  "Maintenance",
];
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function InventoryTab() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: inventoryData,
    mutate,
    isLoading,
    error: fetchError,
  } = useSWR("/api/admin/inventory", fetcher, { refreshInterval: 5000 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Equipment",
    quantity: "",
    price: "",
    status: "In Stock",
  });
  const [saving, setSaving] = useState(false);

  const inventory = Array.isArray(inventoryData)
    ? inventoryData.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        stock: item.quantity,
        minStock: 5,
        status:
          item.status ||
          (item.quantity <= 0
            ? "Out of Stock"
            : item.quantity <= 5
              ? "Low Stock"
              : "In Stock"),
        price: item.price,
        icon:
          item.category === "Equipment"
            ? Dumbbell
            : item.category === "Merchandise"
              ? Shirt
              : Coffee,
      }))
    : [];

  const filteredItems = inventory
    .filter(
      (item) => activeCategory === "All" || item.category === activeCategory,
    )
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const openCreate = () => {
    setForm({
      name: "",
      category: "Equipment",
      quantity: "",
      price: "",
      status: "In Stock",
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.stock.toString(),
      price: item.price.toString(),
      status: item.status,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/inventory/${editingId}`
        : "/api/admin/inventory";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        mutate();
        setModalOpen(false);
        toast({ title: "Success", description: "Item saved successfully." });
      } else {
        const d = await res.json();
        toast({
          title: "Error",
          description: d.error || "Failed to save item",
          variant: "destructive",
        });
      }
    } catch (e) {
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
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
      mutate();
      toast({ title: "Success", description: "Item deleted." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Track equipment, supplements, and gym merchandise.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-initial">
            <ArrowDownToLine className="w-4 h-4" /> Export Log
          </Button>
          <Button onClick={openCreate} className="gap-2 flex-1 sm:flex-initial">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-warning">
              Low Stock Alert
            </h4>
            <p className="text-sm text-warning/80 mt-1">
              You have {lowStockCount} item(s) running low or completely out of
              stock. Please reorder soon to avoid disruption.
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      <Card>
        <CardContent className="p-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "bg-transparent text-muted-foreground border border-transparent hover:bg-muted"
              }`}
            >
              {cat}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center bg-muted/20 gap-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" /> Stock List
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 shrink-0"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-150">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Item Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price/Unit</TableHead>
              <TableHead>In Stock</TableHead>
              <TableHead>Status</TableHead>
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
                      <Package className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Failed to load inventory
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                      There was a problem retrieving the inventory data.
                    </p>
                    <Button onClick={() => mutate()} className="gap-2" variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No inventory items found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.category}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className={
                              item.stock <= item.minStock ? "text-warning" : ""
                            }
                          >
                            {item.stock}
                          </span>
                          <span className="text-muted-foreground font-normal text-xs">
                            / Min {item.minStock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "In Stock"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : item.status === "Low Stock"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <AnimatedEditButton onClick={() => openEdit(item)} />
                          <AnimatedDeleteButton onClick={() => del(item.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Item" : "Add Item"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this inventory item."
                : "Add a new item to your inventory."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Item Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Whey Protein Isolate"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Quantity (Stock)
                </label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Price (INR)
                </label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Status Override
              </label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={saving}
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

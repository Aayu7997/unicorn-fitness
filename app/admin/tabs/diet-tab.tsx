"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Search, Filter, Users, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
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

export function DietTab() {
  const [activeView, setActiveView] = useState<"templates" | "assignments">(
    "assignments",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const {
    data: assignments,
    mutate,
    isLoading,
  } = useSWR("/api/admin/assigned-plans?type=diet", fetcher);
  const { data: usersData } = useSWR("/api/admin/members", fetcher);
  const users = usersData?.users || [];

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    planName: "",
    calories: "",
    macros: "",
    imageUrl: "",
  });
  const [saving, setSaving] = useState(false);

  const filteredAssignments = Array.isArray(assignments)
    ? assignments.filter(
        (item) =>
          item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content?.planName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : [];

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/assigned-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          type: "diet",
          content: {
            planName: form.planName,
            calories: form.calories,
            macros: form.macros,
            imageUrl: form.imageUrl,
          },
        }),
      });
      if (res.ok) {
        mutate();
        setModal(false);
        setForm({ userId: "", planName: "", calories: "", macros: "", imageUrl: "" });
        toast({
          title: "Success",
          description: "Diet plan assigned successfully",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to assign plan",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Remove this assigned plan?")) return;
    try {
      await fetch(`/api/admin/assigned-plans/${id}`, { method: "DELETE" });
      mutate();
      toast({ title: "Success", description: "Plan removed." });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Diet & Nutrition Planning
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Create master diet templates and assign them to members.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button onClick={() => setModal(true)} className="flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 mr-2" /> Assign Plan
          </Button>
        </div>
      </div>

      <div className="flex bg-card border rounded-lg p-1 w-fit">
        <Button
          variant={activeView === "assignments" ? "secondary" : "ghost"}
          onClick={() => setActiveView("assignments")}
          size="sm"
          className="rounded-md"
        >
          <Users className="w-4 h-4 mr-2" /> Member Assignments
        </Button>
        {/* Placeholder for future templates view */}
        <Button
          variant={activeView === "templates" ? "secondary" : "ghost"}
          onClick={() => setActiveView("templates")}
          size="sm"
          className="rounded-md"
          disabled
        >
          <FileText className="w-4 h-4 mr-2" /> Templates (Soon)
        </Button>
      </div>

      
        {activeView === "assignments" && (
          <div key="assignments">
            <Card>
              <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" /> Client
                  Diet Tracking
                </CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search members or plans..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-125">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Assigned Plan</TableHead>
                        <TableHead>Calories & Macros</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredAssignments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No diet plans assigned yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAssignments.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.user?.name || "Unknown User"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.content?.planName || "Custom"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.content?.calories} kcal -{" "}
                              {item.content?.macros}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  item.active
                                    ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
                                    : "border-amber-500/50 text-amber-500 bg-amber-500/10"
                                }
                              >
                                {item.active ? "On Track" : "Needs Review"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <AnimatedDeleteButton
                                  onClick={() => del(item.id)}
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
          </div>
        )}
      

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Assign Diet Plan</DialogTitle>
            <DialogDescription>
              Assign a custom diet or template to a member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Member</Label>
              <Select
                value={form.userId}
                onValueChange={(val) => setForm({ ...form, userId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Member --" />
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
              <Label>Plan Name / Template</Label>
              <Input
                value={form.planName}
                onChange={(e) => setForm({ ...form, planName: e.target.value })}
                placeholder="e.g. Keto Cut"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Daily Calories</Label>
                <Input
                  type="number"
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                  placeholder="e.g. 2500"
                />
              </div>
              <div className="space-y-2">
                <Label>Macros (P/C/F)</Label>
                <Input
                  value={form.macros}
                  onChange={(e) => setForm({ ...form, macros: e.target.value })}
                  placeholder="e.g. 40/40/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Poster/Chart Image URL (Optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/poster.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => !saving && setModal(false)}
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

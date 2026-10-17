"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  Trash2,
  MapPin,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function ClassesTab() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("Monday");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    time: "",
    day: "Monday",
    capacity: 20,
    location: "",
  });
  const [fetchError, setFetchError] = useState("");

  const fetchClasses = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/classes");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((c: any) => ({
          id: c.id,
          title: c.name,
          instructor: c.trainer,
          time: c.time,
          day: c.dayOfWeek,
          capacity: c.capacity,
          enrolled: c.bookedCount || 0,
          location: c.room,
          status:
            c.capacity <= (c.bookedCount || 0)
              ? "Full"
              : c.active
                ? "Active"
                : "Inactive",
        }));
        setClasses(mapped);
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      console.error("Failed to fetch classes", err);
      setFetchError("Failed to load classes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async () => {
    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({
          title: "",
          instructor: "",
          time: "",
          day: "Monday",
          capacity: 20,
          location: "",
        });
        fetchClasses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchClasses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClasses = classes
    .filter((c) => c.day === activeDay)
    .filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Class Schedule</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Manage weekly classes and
            instructor assignments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-initial w-full sm:w-64 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes..."
              className="pl-9 w-full bg-background"
            />
          </div>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button onClick={() => setModalOpen(true)} className="gap-2 flex-1 sm:flex-initial">
            <Plus className="w-4 h-4" /> Add Class
          </Button>
        </div>
      </div>

      {/* Week Days Navigation */}
      <Card className="p-1 border bg-muted/20">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar p-1">
          {DAYS.map((day) => (
            <Button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeDay === day
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {day}
            </Button>
          ))}
        </div>
      </Card>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-100 border rounded-xl border-dashed bg-muted/10 text-center p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <CalendarDays className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Failed to load classes
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {fetchError}
          </p>
          <Button onClick={fetchClasses} className="gap-2" variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        <div className="w-full">
          {filteredClasses.length > 0 ? (
            <div
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredClasses.map((cls) => (
                <Card
                  key={cls.id}
                  className="group hover:border-primary/50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                      <div>
                        {cls.status === "Full" ? (
                          <Badge variant="destructive" className="mb-2">
                            FULL
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="mb-2 bg-emerald-500 hover:bg-emerald-600"
                          >
                            ACTIVE
                          </Badge>
                        )}
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {cls.title}
                        </CardTitle>
                        <CardDescription className="font-medium mt-1">
                          {cls.instructor}
                        </CardDescription>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <AnimatedDeleteButton
                          onClick={() => handleDelete(cls.id)}
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 pb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {cls.time}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {cls.location}
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between w-full text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-semibold">
                        {cls.enrolled} / {cls.capacity}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cls.enrolled >= cls.capacity
                            ? "bg-destructive"
                            : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min(100, (cls.enrolled / cls.capacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div
              key="empty"
              className="flex flex-col items-center justify-center min-h-100 border rounded-xl border-dashed bg-muted/10 text-center p-8"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No Classes Scheduled
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                There are no classes scheduled for {activeDay}. Add a new class
                to manage batches for this day.
              </p>
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Schedule Class
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Class Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Schedule a new class batch. This will instantly be available for
              members to book.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. HIIT Core"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instructor</label>
              <Input
                value={formData.instructor}
                onChange={(e) =>
                  setFormData({ ...formData, instructor: e.target.value })
                }
                placeholder="e.g. Coach Sarah"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Day</label>
                <Select
                  value={formData.day}
                  onValueChange={(val) =>
                    setFormData({ ...formData, day: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  placeholder="e.g. 06:00 AM"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location / Room</label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Studio 1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClass}>Save Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

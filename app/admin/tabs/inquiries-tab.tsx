"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import {
  Mail,
  Phone,
  Clock,
  Search,
  MessageSquare,
  User,
  Filter,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  {
    id: "new",
    label: "New Leads",
    color: "text-primary",
    border: "border-primary/20",
    bg: "bg-primary/10",
  },
  {
    id: "read",
    label: "Contacted",
    color: "text-warning",
    border: "border-orange-500/20",
    bg: "bg-warning/10",
  },
  {
    id: "replied",
    label: "In Progress",
    color: "text-emerald-500",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
  },
  {
    id: "closed",
    label: "Closed / Converted",
    color: "text-muted-foreground",
    border: "border-border",
    bg: "bg-muted",
  },
];

export function InquiriesTab({ onRead }: { onRead?: () => void }) {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries?limit=100`);
      if (res.ok) {
        const d = await res.json();
        setInquiries(d.inquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter(
        (inq) =>
          (statusFilter ? inq.status === statusFilter : true) &&
          (inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inq.subject.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [inquiries, searchQuery, statusFilter]);

  useEffect(() => {
    if (!selectedId && filteredInquiries.length > 0) {
      setSelectedId(filteredInquiries[0].id);
    }
  }, [filteredInquiries, selectedId]);

  const selectedInquiry = inquiries.find((i) => i.id === selectedId);

  useEffect(() => {
    if (selectedInquiry) setNotes(selectedInquiry.notes ?? "");
  }, [selectedInquiry]);

  const saveStatus = async (id: string, status: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)),
    );
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast({
        title: "Status Updated",
        description: "Lead status changed successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === selectedInquiry.id ? { ...inq, notes } : inq,
        ),
      );
      toast({
        title: "Notes Saved",
        description: "Internal notes updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lead Pipeline</h2>
        <p className="text-muted-foreground mt-1">
          Manage incoming leads and contact inquiries seamlessly.
        </p>
      </div>

      {/* Main App-like Interface */}
      <div className="flex-1 bg-card border rounded-xl shadow-sm flex flex-col lg:flex-row overflow-hidden min-h-137.5 max-h-[85vh]">
        {/* Left Sidebar - Inquiries List */}
        <div className="w-full lg:w-80 h-64 sm:h-72 lg:h-auto border-b lg:border-b-0 lg:border-r flex flex-col bg-muted/10 shrink-0">
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <Button
                onClick={() => setStatusFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!statusFilter ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-transparent hover:bg-muted/80"}`}
              >
                All
              </Button>
              {STATUS_OPTIONS.map((status) => (
                <Button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === status.id ? `${status.bg} ${status.color} border ${status.border}` : "bg-muted text-muted-foreground border border-transparent hover:bg-muted/80"}`}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No leads found.
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredInquiries.map((inq) => {
                  const statusOpt = STATUS_OPTIONS.find(
                    (s) => s.id === inq.status,
                  );
                  return (
                    <Button
                      key={inq.id}
                      onClick={() => setSelectedId(inq.id)}
                      className={`flex items-start gap-3 p-4 border-b text-left transition-all duration-200 hover:bg-muted/50 ${selectedId === inq.id ? "bg-muted border-l-2 border-l-primary" : "border-l-2 border-l-transparent"}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-background text-muted-foreground flex items-center justify-center font-bold shrink-0 relative border shadow-sm">
                        {inq.name.charAt(0).toUpperCase()}
                        {inq.status === "new" && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {inq.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(inq.createdAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {inq.subject}
                        </p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Detail */}
        <div className="flex-1 flex flex-col bg-background relative min-h-0 overflow-y-auto">
          {selectedInquiry ? (
            <>
              {/* Detail Header */}
              <div className="p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20">
                    {selectedInquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">
                      {selectedInquiry.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" /> {selectedInquiry.email}
                      </a>
                      {selectedInquiry.phone && (
                        <a
                          href={`tel:${selectedInquiry.phone}`}
                          className="hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />{" "}
                          {selectedInquiry.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={(val) => saveStatus(selectedInquiry.id, val)}
                  >
                    <SelectTrigger className="w-full md:w-auto h-10">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto hide-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* The Inquiry Message */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    <Clock className="w-4 h-4" /> Received{" "}
                    {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </div>

                  <Card className="border-l-4 border-l-primary overflow-hidden">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-3 tracking-tight">
                        {selectedInquiry.subject}
                      </h4>
                      <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedInquiry.message}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Admin Notes */}
                  <div className="space-y-4">
                    <h4 className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Internal Notes
                    </h4>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={6}
                      placeholder="Add private notes about this lead here..."
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <AnimatedSaveButton onClick={saveNotes} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <h4 className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                      Quick Actions
                    </h4>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-6">
                        <p className="text-sm text-foreground/80 mb-4">
                          Draft a follow-up email in your default email client
                          to reply to this lead quickly.
                        </p>
                        <a
                          href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}&body=Hi ${encodeURIComponent(selectedInquiry.name)},%0A%0A`}
                          className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all group shadow-sm"
                        >
                          <span className="flex items-center gap-2">
                            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />{" "}
                            Reply via Email
                          </span>
                          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </a>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <User className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a lead to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

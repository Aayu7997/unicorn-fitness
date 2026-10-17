"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Shield,
  Users,
  CreditCard,
  Percent,
  CalendarDays,
  Globe,
  Activity,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Monitor,
  Smartphone,
  History,
  Check,
  X,
  ShieldAlert,
  LayoutTemplate,
  AlertTriangle,
} from "lucide-react";
import { SiApple } from "react-icons/si";
import { FaAndroid, FaWindows } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardCard } from "../components/capitalio/shared";
import useSWR from "swr";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { PlansTab } from "./plans-tab";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ErrorState = ({ title, onRetry }: { title: string, onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5">
    <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
      There was a problem communicating with the server. Please check your connection and try again.
    </p>
    <Button variant="outline" onClick={onRetry} className="border-destructive/30 hover:bg-destructive/10 text-destructive">
      Retry Connection
    </Button>
  </div>
);

const masterMenus = [
  { id: "organisation", label: "Organisation Details", icon: Building2 },
  { id: "roles", label: "Manage Role", icon: Shield },
  { id: "users", label: "Manage User", icon: Users },
  { id: "plans", label: "Manage Plan", icon: CreditCard },
  { id: "taxes", label: "Manage Tax", icon: Percent },
  { id: "batches", label: "Manage Batch", icon: CalendarDays },
  { id: "timezones", label: "AI Timezones", icon: Globe },
  { id: "audit", label: "Audit Trail", icon: Activity },
  { id: "login_history", label: "Login History", icon: Clock },
];

const PERMISSION_MODULES = [
  { key: "members", label: "Member Management" },
  { key: "plans", label: "Plan & Master Config" },
  { key: "billing", label: "Billing & Invoicing" },
  { key: "settings", label: "System Settings" },
  { key: "attendance", label: "Attendance & Check-ins" },
  { key: "reports", label: "Financial Reports" },
  { key: "content", label: "CMS & Content" },
];

export function MasterTab() {
  const [activeMenu, setActiveMenu] = useState("audit");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Matrix Modal state
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // Staff Users
  const { toast } = useToast();

  const { data: auditLogs = [], error: auditError, mutate: mutateAudit } = useSWR("/api/admin/master/audit", fetcher);
  const { data: rolesData = [], error: rolesError, mutate: mutateRoles } = useSWR(
    "/api/admin/master/roles",
    fetcher,
  );
  const { data: staffData = [], error: staffError, mutate: mutateStaff } = useSWR(
    "/api/admin/staff",
    fetcher,
  );
  const { data: loginHistory = [], error: loginHistoryError, mutate: mutateLoginHistory } = useSWR(
    "/api/admin/master/logins",
    fetcher,
  );

  const [staffModal, setStaffModal] = useState({
    open: false,
    editing: null as any,
  });
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    role: "trainer",
    avatarUrl: "",
  });

  const [roleModal, setRoleModal] = useState({
    open: false,
    editing: null as any,
  });
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: {},
  });

  const handleStaffSave = async () => {
    try {
      const url = staffModal.editing
        ? `/api/admin/staff/${staffModal.editing.id}`
        : "/api/admin/staff";
      const method = staffModal.editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Staff member saved." });
        mutateStaff();
        setStaffModal({ open: false, editing: null });
      } else {
        toast({
          title: "Error",
          description: "Failed to save staff member",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleRoleSave = async () => {
    try {
      const res = await fetch("/api/admin/master/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Role created successfully." });
        mutateRoles();
        setRoleModal({ open: false, editing: null });
      } else {
        toast({
          title: "Error",
          description: "Failed to save role",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  // Master Config Save
  const { data: orgData, mutate: mutateOrg, error: orgError } = useSWR(
    "/api/admin/master/organisation",
    fetcher,
  );
  const { data: taxData, mutate: mutateTax, error: taxError } = useSWR(
    "/api/admin/master/taxes",
    fetcher,
  );
  const { data: timezoneData, mutate: mutateTimezone, error: timezoneError } = useSWR(
    "/api/admin/master/timezones",
    fetcher,
  );
  const { data: batchData, mutate: mutateBatch, error: batchError } = useSWR(
    "/api/admin/master/batches",
    fetcher,
  );

  const handleConfigSave = async (key: string, data: any, mutateFn: any) => {
    try {
      const res = await fetch(`/api/admin/master/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: data }),
      });
      if (res.ok) {
        toast({ title: "Success", description: `${key} settings saved.` });
        mutateFn();
      } else {
        toast({
          title: "Error",
          description: `Failed to save ${key}`,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const exportAuditCSV = () => {
    const headers = [
      "Log ID",
      "User",
      "Role",
      "Action",
      "Resource",
      "Details",
      "IP Address",
      "Device",
      "Timestamp",
      "Status",
    ];
    const rows = auditLogs.map((l: any) => [
      l.id,
      l.user,
      l.role,
      l.action,
      l.resource,
      `"${l.details}"`,
      l.ip,
      l.device,
      l.timestamp,
      l.status,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r: any[]) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deep-audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Helper for JSON formatting
  const syntaxHighlight = (json: any) => {
    if (!json) return "null";
    return JSON.stringify(json, null, 2);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-20 max-w-full">
      {/* Sidebar Navigation for Master Tab */}
      <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-1.5 sm:gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <h2 className="hidden md:block text-xl font-bold text-foreground mb-4 px-2 tracking-tight">
          Master Setup
        </h2>
        {masterMenus.map((menu) => {
          const Icon = menu.icon;
          const isActive = activeMenu === menu.id;
          return (
            <Button
              key={menu.id}
              variant="ghost"
              onClick={() => setActiveMenu(menu.id)}
              className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 border whitespace-nowrap shrink-0 md:shrink md:w-full justify-start ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                  : "bg-muted/40 md:bg-transparent text-muted-foreground border-border/30 md:border-transparent hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "opacity-70"}`}
              />
              <span className="text-left">{menu.label}</span>
              {isActive && (
                <ArrowRight className="hidden md:block w-4 h-4 ml-auto shrink-0 opacity-70" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        
          {/* DEEP AUDIT TRAIL VIEW */}
          {activeMenu === "audit" && (
            <div key="audit" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    Deep Audit Trail
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Comprehensive system audit log tracking exact state changes
                    (Before/After), devices, and security metrics.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search users, IPs, or resources..."
                      className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 border-border bg-card hover:bg-accent hover:text-accent-foreground"
                  >
                    <Filter className="w-4 h-4 mr-2" /> Advanced Filter
                  </Button>
                  <Button
                    onClick={exportAuditCSV}
                    className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground border-none"
                  >
                    <Download className="w-4 h-4 mr-2" /> Export Log
                  </Button>
                </div>
              </div>

              {auditError ? (
                <ErrorState title="Failed to load audit logs" onRetry={() => mutateAudit()} />
              ) : (
              <DashboardCard className="overflow-hidden p-0 border-border">
                <div className="overflow-x-auto">
                  <Table className="min-w-175">
                    <TableHeader>
                      <TableRow className="bg-muted border-b border-border">
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10"></TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Log ID & Time
                        </TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          User / Role
                        </TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Module / Action
                        </TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Device & IP
                        </TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log: any) => (
                        <React.Fragment key={log.id}>
                          <TableRow
                            onClick={() => toggleRow(log.id)}
                            className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                          >
                            <TableCell className="px-4 py-4 text-muted-foreground">
                              {expandedRow === log.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                  {log.id}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                                  {new Date(log.timestamp).toLocaleString(
                                    "en-IN",
                                    { dateStyle: "medium", timeStyle: "short" },
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">
                                  {log.user}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  {log.role}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">
                                  {log.resource}
                                </span>
                                <span className="text-xs text-muted-foreground tracking-wider font-mono mt-0.5">
                                  {log.action}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-foreground flex items-center gap-1.5">
                                  {log.device.includes("Windows") ? (
                                    <FaWindows className="w-3 h-3 text-primary/80" />
                                  ) : log.device.includes("macOS") ||
                                    log.device.includes("iOS") ? (
                                    <SiApple className="w-3 h-3" />
                                  ) : log.device.includes("Android") ? (
                                    <FaAndroid className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Monitor className="w-3 h-3" />
                                  )}
                                  {log.device}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono mt-0.5">
                                  {log.ip}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right">
                              {log.status === "Success" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                  Success
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                                  <XCircle className="w-3.5 h-3.5" /> Failed
                                </span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* EXPANDED DEEP AUDIT VIEW */}
                          {expandedRow === log.id && (
                            <TableRow className="bg-muted/50 border-b border-border">
                              <TableCell colSpan={6} className="p-0">
                                <div className="animate-in fade-in zoom-in-95 duration-300  overflow-hidden"
                                >
                                  <div className="p-6 border-l-2 border-primary ml-4 my-4 bg-card rounded-lg shadow-sm flex flex-col gap-4">
                                    <div>
                                      <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                        Action Details
                                      </h5>
                                      <p className="text-sm text-foreground">
                                        {log.details}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                                      {/* Before State */}
                                      <div className="rounded-md border border-border bg-muted/50 overflow-hidden">
                                        <div className="px-3 py-2 bg-muted border-b border-border flex items-center justify-between">
                                          <span className="text-xs font-semibold text-muted-foreground uppercase">
                                            State Before
                                          </span>
                                        </div>
                                        <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all overflow-x-auto">
                                          {syntaxHighlight(log.beforeState)}
                                        </pre>
                                      </div>

                                      {/* After State */}
                                      <div className="rounded-md border border-border bg-muted/50 overflow-hidden">
                                        <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                                          <span className="text-xs font-semibold text-primary uppercase">
                                            State After / Payload
                                          </span>
                                        </div>
                                        <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-all overflow-x-auto">
                                          {syntaxHighlight(log.afterState)}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DashboardCard>
              )}
            </div>
          )}

          {/* MANAGE ROLE VIEW */}
          {activeMenu === "roles" && (
            <div key="roles" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Manage Roles
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Configure system roles and module-level permissions.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setRoleForm({ name: "", description: "", permissions: {} });
                    setRoleModal({ open: true, editing: null });
                  }}
                  className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground border-none w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Role
                </Button>
              </div>

              {rolesError ? (
                <ErrorState title="Failed to load roles" onRetry={() => mutateRoles()} />
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {rolesData.map((role: any) => (
                  <DashboardCard
                    key={role.id}
                    className="p-6 flex flex-col justify-between hover:border-primary/30 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground text-lg">
                              {role.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {role.users} Active Users
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-transparent border-border text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                        {role.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span
                        className="text-xs font-medium text-primary cursor-pointer group-hover:underline"
                        onClick={() => {
                          setSelectedRole(role);
                          setMatrixModalOpen(true);
                        }}
                      >
                        View Permissions Matrix
                      </span>
                    </div>
                  </DashboardCard>
                ))}
              </div>
              )}
            </div>
          )}

          {/* MANAGE USERS VIEW */}
          {activeMenu === "users" && (
            <div key="users" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Manage Staff Members
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Manage admin, trainers, and other staff members.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setStaffForm({
                      name: "",
                      email: "",
                      role: "trainer",
                      avatarUrl: "",
                    });
                    setStaffModal({ open: true, editing: null });
                  }}
                  className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground border-none w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Staff
                </Button>
              </div>

              {staffError ? (
                <ErrorState title="Failed to load staff members" onRetry={() => mutateStaff()} />
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(staffData || []).map((user: any) => (
                  <DashboardCard
                    key={user.id}
                    className="p-6 flex flex-col hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {user.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          {user.email}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStaffForm(user);
                          setStaffModal({ open: true, editing: user });
                        }}
                        className="flex-1 h-8 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </DashboardCard>
                ))}
              </div>
              )}
            </div>
          )}

          {/* ORGANISATION VIEW */}
          {activeMenu === "organisation" && (
            <div key="organisation" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <h3 className="text-2xl font-semibold text-foreground">
                Organisation Details
              </h3>
              {orgError ? (
                <ErrorState title="Failed to load organisation details" onRetry={() => mutateOrg()} />
              ) : (
              <DashboardCard className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleConfigSave(
                      "organisation",
                      {
                        name: formData.get("name"),
                        email: formData.get("email"),
                        phone: formData.get("phone"),
                        address: formData.get("address"),
                      },
                      mutateOrg,
                    );
                  }}
                  className="space-y-4 max-w-xl"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Gym Name
                    </label>
                    <Input
                      name="name"
                      defaultValue={orgData?.value?.name || ""}
                      required
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={orgData?.value?.email || ""}
                      required
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <Input
                      name="phone"
                      defaultValue={orgData?.value?.phone || ""}
                      required
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <Textarea
                      name="address"
                      defaultValue={orgData?.value?.address || ""}
                      required
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save Details
                  </Button>
                </form>
              </DashboardCard>
              )}
            </div>
          )}

          {/* TAXES VIEW */}
          {activeMenu === "taxes" && (
            <div key="taxes" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <h3 className="text-2xl font-semibold text-foreground">
                Manage Taxes
              </h3>
              {taxError ? (
                <ErrorState title="Failed to load tax details" onRetry={() => mutateTax()} />
              ) : (
              <DashboardCard className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleConfigSave(
                      "taxes",
                      {
                        gstRate: parseFloat(formData.get("gstRate") as string),
                      },
                      mutateTax,
                    );
                  }}
                  className="space-y-4 max-w-xl"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Default GST Rate (%)
                    </label>
                    <Input
                      name="gstRate"
                      type="number"
                      step="0.01"
                      defaultValue={taxData?.value?.gstRate || 18}
                      required
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save Taxes
                  </Button>
                </form>
              </DashboardCard>
              )}
            </div>
          )}

          {/* TIMEZONES VIEW */}
          {activeMenu === "timezones" && (
            <div key="timezones" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <h3 className="text-2xl font-semibold text-foreground">
                AI Timezones
              </h3>
              {timezoneError ? (
                <ErrorState title="Failed to load timezones" onRetry={() => mutateTimezone()} />
              ) : (
              <DashboardCard className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleConfigSave(
                      "timezones",
                      {
                        defaultTimezone: formData.get("timezone"),
                      },
                      mutateTimezone,
                    );
                  }}
                  className="space-y-4 max-w-xl"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      System Timezone
                    </label>
                    <Select
                      name="timezone"
                      defaultValue={
                        timezoneData?.value?.defaultTimezone || "Asia/Kolkata"
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">
                          Asia/Kolkata (IST)
                        </SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London (GMT)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save Timezone
                  </Button>
                </form>
              </DashboardCard>
              )}
            </div>
          )}

          {/* BATCHES VIEW */}
          {activeMenu === "batches" && (
            <div key="batches" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <h3 className="text-2xl font-semibold text-foreground">
                Manage Batches
              </h3>
              {batchError ? (
                <ErrorState title="Failed to load batch settings" onRetry={() => mutateBatch()} />
              ) : (
              <DashboardCard className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleConfigSave(
                      "batches",
                      {
                        morningStart: formData.get("morningStart"),
                        eveningStart: formData.get("eveningStart"),
                      },
                      mutateBatch,
                    );
                  }}
                  className="space-y-4 max-w-xl"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Morning Batch Start Time
                    </label>
                    <Input
                      type="time"
                      name="morningStart"
                      defaultValue={batchData?.value?.morningStart || "06:00"}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Evening Batch Start Time
                    </label>
                    <Input
                      type="time"
                      name="eveningStart"
                      defaultValue={batchData?.value?.eveningStart || "17:00"}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save Batches
                  </Button>
                </form>
              </DashboardCard>
              )}
            </div>
          )}

          {/* FALLBACK VIEW FOR OTHER TABS */}
          {activeMenu !== "audit" &&
            activeMenu !== "roles" &&
            activeMenu !== "users" &&
            activeMenu !== "login_history" &&
            activeMenu !== "organisation" &&
            activeMenu !== "taxes" &&
            activeMenu !== "timezones" &&
            activeMenu !== "batches" &&
            activeMenu !== "plans" && (
              <div key="fallback" className="animate-in fade-in zoom-in-95 duration-300 
                 flex flex-col items-center justify-center min-h-96 text-center bg-card border border-border rounded-xl"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Module Under Development
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  The {masterMenus.find((m) => m.id === activeMenu)?.label}{" "}
                  settings will be integrated soon as part of the core ERP
                  update.
                </p>
              </div>
            )}

          {/* PLANS TAB RENDERED INLINE */}
          {activeMenu === "plans" && (
            <div className="animate-in fade-in zoom-in-95 duration-300"
              key="plans"
            >
              <PlansTab />
            </div>
          )}

          {/* LOGIN HISTORY VIEW */}
          {activeMenu === "login_history" && (
            <div key="login_history" className="animate-in fade-in zoom-in-95 duration-300 
               space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Login History
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Track staff and member session activities.
                  </p>
                </div>
              </div>

              {loginHistoryError ? (
                <ErrorState title="Failed to load login history" onRetry={() => mutateLoginHistory()} />
              ) : (
              <DashboardCard className="overflow-hidden p-0 border-border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted border-b border-border">
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Time
                        </TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          User / Role
                        </TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Device & IP
                        </TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginHistory.map((session: any) => (
                        <TableRow
                          key={session.id}
                          className="hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <TableCell className="px-4 py-4">
                            <span className="text-sm text-foreground">
                              {new Date(session.timestamp).toLocaleString(
                                "en-IN",
                                { dateStyle: "medium", timeStyle: "short" },
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground">
                                {session.user}
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                {session.role}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-foreground flex items-center gap-1.5">
                                {session.device.includes("Windows") ? (
                                  <FaWindows className="w-3 h-3 text-primary/80" />
                                ) : session.device.includes("macOS") ||
                                  session.device.includes("iOS") ? (
                                  <SiApple className="w-3 h-3" />
                                ) : session.device.includes("Android") ? (
                                  <FaAndroid className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Monitor className="w-3 h-3" />
                                )}
                                {session.device}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono mt-0.5">
                                {session.ip}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                              {session.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DashboardCard>
              )}
            </div>
          )}
        
      </div>

      {/* Permissions Matrix Modal */}

      <Dialog open={matrixModalOpen} onOpenChange={setMatrixModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Permissions: {selectedRole?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Permissions matrix
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="py-3 text-sm font-medium text-muted-foreground">
                    System Module
                  </TableHead>
                  <TableHead className="py-3 text-sm font-medium text-muted-foreground text-center">
                    Access Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_MODULES.map((mod) => {
                  const hasAccess = selectedRole?.permissions?.[mod.key];
                  return (
                    <TableRow
                      key={mod.key}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <TableCell className="py-4 text-sm font-medium text-foreground">
                        {mod.label}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {hasAccess ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive mx-auto">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setMatrixModalOpen(false)}
              className="border-border"
            >
              Close
            </Button>
            <Button className="bg-primary/90 hover:bg-primary text-primary-foreground">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Modal */}

      <Dialog
        open={staffModal.open}
        onOpenChange={(open) =>
          !open && setStaffModal({ open: false, editing: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {staffModal.editing ? "Edit Staff Profile" : "Add Staff Member"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Staff member details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <ImageUpload
                value={staffForm.avatarUrl}
                onChange={(url) =>
                  setStaffForm({ ...staffForm, avatarUrl: url })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                type="text"
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <Select
                value={staffForm.role}
                onValueChange={(val) =>
                  setStaffForm({ ...staffForm, role: val })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex gap-3 sm:justify-end mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStaffModal({ open: false, editing: null })}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleStaffSave}
              >
                Save Profile
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE ROLE MODAL */}

      {roleModal.open && (
        <Dialog
          open={roleModal.open}
          onOpenChange={(open) =>
            !open && setRoleModal({ open: false, editing: null })
          }
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Role</DialogTitle>
              <DialogDescription className="sr-only">
                Role details
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role Name
                </label>
                <Input
                  value={roleForm.name}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, name: e.target.value })
                  }
                  placeholder="e.g. Manager"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, description: e.target.value })
                  }
                  placeholder="Role responsibilities..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3 sm:justify-end mt-4">
              <Button
                variant="ghost"
                onClick={() => setRoleModal({ open: false, editing: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleSave}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

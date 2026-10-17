"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  UserMinus,
  AlertTriangle,
  IndianRupee,
  Download,
  Clock,
  Activity,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

import { useDashboardNavigation } from "../components/capitalio/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OverviewTab() {
  const { period, customRange, dateRange } = useDashboardNavigation();
  const periodQuery = period === 'custom' && customRange?.from
    ? `?period=custom&from=${encodeURIComponent(new Date(customRange.from).toISOString())}&to=${encodeURIComponent((customRange.to ? new Date(customRange.to) : new Date()).toISOString())}`
    : `?period=${encodeURIComponent(period)}`;

  const { data: stats, isLoading: isStatsLoading } = useSWR(
    `/api/admin/dashboard-stats${periodQuery}`,
    fetcher,
    { refreshInterval: 10000 },
  );

  if (isStatsLoading || !stats) {
    return (
      <div className="space-y-8 pb-20 animate-in fade-in duration-300 max-w-7xl">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 sm:w-96 rounded mt-2.5" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
        </div>

        {/* Top 4 Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50 shadow-sm bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-3 w-32 rounded mt-2.5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actionable Sections Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requires Attention Skeleton */}
          <Card className="border-border/50 shadow-sm bg-card flex flex-col">
            <CardHeader className="space-y-1.5">
              <Skeleton className="h-6 w-44 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36 rounded" />
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operations Summary Skeleton */}
          <Card className="border-border/50 shadow-sm bg-card flex flex-col">
            <CardHeader className="space-y-1.5">
              <Skeleton className="h-6 w-44 rounded" />
              <Skeleton className="h-4 w-56 rounded" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col p-4 bg-muted/20 rounded-lg border border-border/50">
                    <Skeleton className="h-3.5 w-24 rounded mb-2" />
                    <Skeleton className="h-7 w-14 rounded-md" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/50 mt-auto">
                <Skeleton className="h-3 w-3/4 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const m = stats.memberships;
  const t = stats.today;
  const e = stats.enquiries;
  const f = stats.financials;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const exportToCSV = () => {
    if (!stats) return;
    const headers = ["Metric", "Value"];
    const rows = [
      ["Active Members", m.activeMembers],
      ["Total Expired", m.totalExpired],
      ["Today Registration", t.registration],
      ["Today Expired", t.expired],
      ["Expected Collection", f.expectedCollection],
      ["Total Collection", f.totalCollection],
    ];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overview-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const pendingDues = Math.max(0, (f.expectedCollection || 0) - (f.totalCollection || 0));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{dateRange.label}</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Monitor your gym's performance, revenue, and member activity for {dateRange.label.toLowerCase()}.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2 shrink-0">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-border/50 shadow-sm bg-card hover:border-border transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Active Members
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{m.activeMembers}</div>
            <p className="text-xs mt-2 text-blue-500 font-medium flex items-center gap-1">
              Currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card hover:border-border transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {period === 'today' ? "Today's Signups" : `${dateRange.label} Signups`}
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <UserPlus className="w-4 h-4 text-emerald-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {period === 'today' ? t.registration : (stats.periodStats?.registration ?? t.registration)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" /> 
              {period === 'today' ? "New members joined today" : `New members in ${dateRange.label.toLowerCase()}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card hover:border-border transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Expiring Soon
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{m.activeExpiring}</div>
            <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground">
              <AlertTriangle className="w-3 h-3 text-amber-500" /> Requires attention in 15 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card hover:border-border transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {period === 'today' ? 'Pending Dues' : `${dateRange.label} Collections`}
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <IndianRupee className="w-4 h-4 text-amber-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {period === 'today' ? formatCurrency(pendingDues) : formatCurrency(stats.periodStats?.collection || f.activeCollection)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              {period === 'today' ? 'Outstanding this cycle' : `Total collected in ${dateRange.label.toLowerCase()}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Requires Attention */}
        <Card className="border-border/50 shadow-sm bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Requires Attention</CardTitle>
            <CardDescription>Operational items that need your review right now.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {e.new > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.new} New Inquiries</p>
                    <p className="text-xs text-muted-foreground">Pending initial response</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}

            {e.followup > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-full">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.followup} Inquiries need follow-up</p>
                    <p className="text-xs text-muted-foreground">Awaiting your reply</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  Follow Up <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}

            {m.activeExpiring > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.activeExpiring} Memberships Expiring</p>
                    <p className="text-xs text-muted-foreground">Expiring within 15 days</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  Remind <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}

            {t.expired > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <UserMinus className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.expired} Memberships Expired Today</p>
                    <p className="text-xs text-muted-foreground">Require renewal or archival</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  Review <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}

            {pendingDues > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <IndianRupee className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(pendingDues)} in Pending Dues</p>
                    <p className="text-xs text-muted-foreground">Unpaid invoices this cycle</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  Collect <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}

            {e.new === 0 && e.followup === 0 && m.activeExpiring === 0 && pendingDues === 0 && t.expired === 0 && (
              <div className="flex-1 flex items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground text-sm">You're all caught up! No operational warnings require immediate attention.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operations Summary */}
        <Card className="border-border/50 shadow-sm bg-card flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">
                {period === 'today' ? "Today's Operations" : `${dateRange.label} Operations`}
              </CardTitle>
              <CardDescription>
                {period === 'today' ? "Quick summary of activity today." : `Summary of activity for ${dateRange.label.toLowerCase()}.`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-muted/20 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  {period === 'today' ? "New Registrations" : "Total Signups"}
                </span>
                <span className="text-2xl font-bold">
                  {period === 'today' ? t.registration : (stats.periodStats?.registration ?? t.registration)}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-muted/20 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  {period === 'today' ? "Inquiry Follow-ups" : "Follow-ups Handled"}
                </span>
                <span className="text-2xl font-bold">
                  {period === 'today' ? t.followup : (stats.periodStats?.followup ?? t.followup)}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-muted/20 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  {period === 'today' ? "Expiring Today" : "Expiring in Period"}
                </span>
                <span className="text-2xl font-bold">
                  {period === 'today' ? t.expiring : (stats.periodStats?.expiring ?? t.expiring)}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-muted/20 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  {period === 'today' ? "Expired Today" : "Total Expired"}
                </span>
                <span className="text-2xl font-bold">
                  {period === 'today' ? t.expired : (stats.periodStats?.expired ?? t.expired)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 mt-auto">
              <p className="text-xs text-muted-foreground leading-relaxed">
                For detailed analytics, historical charts, and member distribution data, please navigate to the <strong>Analytics</strong> tab.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

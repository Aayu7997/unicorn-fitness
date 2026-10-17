"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Calendar, Download, ChevronDown } from "lucide-react";
import { DashboardChartTooltip } from "../components/capitalio/shared";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  portfolioPerformance: Array<{
    month: string;
    revenue: number;
    target: number;
    expenses: number;
  }>;
  metrics: {
    totalCollections: { value: number; label: string; sparkline: number[] };
    attrition: { value: number; label: string; sparkline: number[] };
    activeGrowth: { value: number; label: string; barData: number[] };
  };
  monthlyRegistrationsPerPlan: Array<{
    month: string;
    Elite: number;
    Pro: number;
    Basic: number;
    Trial: number;
  }>;
  revenueStreams: Array<{
    month: string;
    Memberships: number;
    PersonalTraining: number;
    Merchandise: number;
  }>;
  attendanceHeatmap: Array<{
    day: string;
    "6AM": number;
    "12PM": number;
    "6PM": number;
  }>;
  demographics: Array<{ name: string; value: number }>;
}

import { useDashboardNavigation } from "../components/capitalio/navigation";
import { dashboardPeriods, type PeriodValue } from "@/lib/admin-period";

export function AnalyticsTab() {
  const { period, setPeriod, dateRange, customRange } = useDashboardNavigation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [grouping, setGrouping] = useState("Monthly");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const periodQuery = period === 'custom' && customRange?.from
        ? `?period=custom&from=${encodeURIComponent(new Date(customRange.from).toISOString())}&to=${encodeURIComponent((customRange.to ? new Date(customRange.to) : new Date()).toISOString())}`
        : `?period=${encodeURIComponent(period)}`;

      const res = await fetch(`/api/admin/analytics${periodQuery}`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period, customRange]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-end mb-6 gap-3">
          <div className="h-9 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="h-100 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-72 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="text-muted-foreground p-8 text-center bg-card border rounded-xl">
        Failed to load analytics. Please try again.
      </div>
    );

  const exportToCSV = () => {
    if (!data) return;
    const headers = ["Month", "Revenue", "Target", "Expenses"];
    const rows = data.portfolioPerformance.map((d) => [
      d.month,
      d.revenue,
      d.target,
      d.expenses,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const formatINR = (val: number) => `₹${(val / 1000).toFixed(1)}K`;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Analytics & Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Key metrics and performance indicators
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {dateRange.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dashboardPeriods.map((range) => (
                <DropdownMenuItem
                  key={range.value}
                  onClick={() => setPeriod(range.value)}
                  className="cursor-pointer"
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {grouping}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Daily", "Weekly", "Monthly"].map((group) => (
                <DropdownMenuItem
                  key={group}
                  onClick={() => setGrouping(group)}
                >
                  {group}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={exportToCSV} className="gap-2">
            Export
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Performance Chart */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start justify-between pb-2 gap-4">
          <div>
            <CardTitle>Revenue Performance</CardTitle>
            <CardDescription>
              Revenue vs Target vs Expenses over 6 months
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            >
              Outperforming +3.3pp
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              vs Target
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-87.5 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data.portfolioPerformance}
                margin={{ top: 10, right: 16, left: 16, bottom: 16 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  dy={6}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  width={68}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatINR}
                />
                <Tooltip
                  content={<DashboardChartTooltip />}
                  cursor={{
                    stroke: "var(--muted-foreground)",
                    strokeWidth: 1,
                    strokeDasharray: "5 5",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Actual Revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                />

                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "20px" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Collections */}
        <Card className="flex flex-col justify-between h-36 relative overflow-hidden group">
          <CardContent className="p-5 relative z-10">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Total Collections
            </h4>
            <div className="mt-1 flex flex-col">
              <span className="text-3xl font-bold">
                ₹{(data.metrics.totalCollections.value / 1000).toFixed(1)}K
              </span>
              <span className="text-xs text-muted-foreground">
                {data.metrics.totalCollections.label}
              </span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.metrics.totalCollections.sparkline.map((v, i) => ({
                  value: v,
                  index: i,
                }))}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#sparkGreen)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attrition */}
        <Card className="flex flex-col justify-between h-36 relative overflow-hidden group">
          <CardContent className="p-5 relative z-10">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Attrition Rate
            </h4>
            <div className="mt-1 flex flex-col">
              <span className="text-3xl font-bold">
                {data.metrics.attrition.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {data.metrics.attrition.label}
              </span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.metrics.attrition.sparkline.map((v, i) => ({
                  value: v,
                  index: i,
                }))}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sparkRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#sparkRed)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Active Growth */}
        <Card className="flex flex-col justify-between h-36 relative overflow-hidden group">
          <CardContent className="p-5 relative z-10">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Active Growth
            </h4>
            <div className="mt-1 flex flex-col">
              <span className="text-3xl font-bold">
                {data.metrics.activeGrowth.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {data.metrics.activeGrowth.label}
              </span>
            </div>
          </CardContent>
          <div className="absolute bottom-2 left-0 right-2 h-12 opacity-50 group-hover:opacity-100 transition-opacity flex items-end justify-end gap-1 px-4">
            {data.metrics.activeGrowth.barData.map((val, i) => (
              <div
                key={i}
                className="w-6 sm:w-8 bg-amber-500 rounded-sm"
                style={{ height: `${(val / 10) * 100}%` }}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Monthly Registrations Grouped Bar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Monthly Registrations</CardTitle>
              <CardDescription>Per plan type for 2026</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hidden sm:inline-flex"
            >
              All positive
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-62.5 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyRegistrationsPerPlan}
                  margin={{ top: 10, right: 16, left: 4, bottom: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                    }}
                    dy={6}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                    }}
                    width={36}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<DashboardChartTooltip />}
                    cursor={{ fill: "color-mix(in srgb, var(--muted) 50%, transparent)" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />

                  <Bar
                    dataKey="Elite"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="Pro"
                    fill="#10b981"
                    radius={[2, 2, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="Basic"
                    fill="#f97316"
                    radius={[2, 2, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="Trial"
                    fill="#8b5cf6"
                    radius={[2, 2, 0, 0]}
                    barSize={8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Streams Stacked Bar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Revenue Streams</CardTitle>
              <CardDescription>Memberships & Add-ons - 2026</CardDescription>
            </div>
            <span className="text-emerald-600 text-sm font-semibold hidden sm:inline-block">
              ₹
              {((data.portfolioPerformance[0]?.revenue || 0) / 1000).toFixed(1)}
              K YTD
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-62.5 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.revenueStreams}
                  margin={{ top: 10, right: 16, left: 16, bottom: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                    }}
                    dy={6}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                    }}
                    width={68}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatINR}
                  />
                  <Tooltip
                    content={<DashboardChartTooltip />}
                    cursor={{ fill: "color-mix(in srgb, var(--muted) 50%, transparent)" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />

                  <Bar
                    dataKey="Memberships"
                    stackId="a"
                    fill="#3b82f6"
                    radius={[0, 0, 0, 0]}
                    barSize={32}
                  />
                  <Bar dataKey="PersonalTraining" stackId="a" fill="#10b981" />
                  <Bar
                    dataKey="Merchandise"
                    stackId="a"
                    fill="#8b5cf6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap & Demographics */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Attendance Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Attendance Heatmap</CardTitle>
              <CardDescription>Average check-ins by day & time</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              Peak: Tue 6PM
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 mt-4">
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="col-span-2"></div>
                <div className="col-span-2 text-center text-xs text-muted-foreground">
                  6:00 AM
                </div>
                <div className="col-span-2 text-center text-xs text-muted-foreground">
                  12:00 PM
                </div>
                <div className="col-span-2 text-center text-xs text-muted-foreground">
                  6:00 PM
                </div>
              </div>
              {data.attendanceHeatmap.map((row) => (
                <div
                  key={row.day}
                  className="grid grid-cols-8 gap-2 items-center"
                >
                  <div className="col-span-2 text-sm font-medium">
                    {row.day}
                  </div>
                  <div
                    className="col-span-2 h-10 rounded-md bg-primary transition-opacity hover:opacity-100"
                    style={{ opacity: Math.max(0.15, row["6AM"] / 100) }}
                  ></div>
                  <div
                    className="col-span-2 h-10 rounded-md bg-primary transition-opacity hover:opacity-100"
                    style={{ opacity: Math.max(0.15, row["12PM"] / 100) }}
                  ></div>
                  <div
                    className="col-span-2 h-10 rounded-md bg-primary transition-opacity hover:opacity-100"
                    style={{ opacity: Math.max(0.15, row["6PM"] / 100) }}
                  ></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics Doughnut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Member Demographics</CardTitle>
            <CardDescription>By Age Group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-70 relative mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.demographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    stroke="none"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.demographics.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["#3b82f6", "#10b981", "#f97316", "#8b5cf6"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DashboardChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-bold">25-34</span>
                <span className="text-muted-foreground text-xs uppercase tracking-wider mt-1">
                  Majority
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

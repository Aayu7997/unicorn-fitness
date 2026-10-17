"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDashboardNavigation } from "../components/capitalio/navigation";
import { dashboardPeriods } from "@/lib/admin-period";

export function ReportsTab() {
  const { period, setPeriod, dateRange, customRange } = useDashboardNavigation();
  const [data, setData] = useState<{ metrics: any; transactions: any[] }>({
    metrics: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      pendingDues: 0,
    },
    transactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const periodQuery = period === 'custom' && customRange?.from
          ? `?period=custom&from=${encodeURIComponent(new Date(customRange.from).toISOString())}&to=${encodeURIComponent((customRange.to ? new Date(customRange.to) : new Date()).toISOString())}`
          : `?period=${encodeURIComponent(period)}`;

        const res = await fetch(`/api/admin/reports${periodQuery}`);
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [period, customRange]);

  const displayMetrics = [
    {
      label: "Total Revenue",
      value: `₹${data.metrics.totalRevenue.toLocaleString("en-IN")}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Expenses",
      value: `₹${data.metrics.totalExpenses.toLocaleString("en-IN")}`,
      change: "-2.4%",
      trend: "down",
      icon: Wallet,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Net Profit",
      value: `₹${data.metrics.netProfit.toLocaleString("en-IN")}`,
      change: "+18.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Dues",
      value: `₹${data.metrics.pendingDues.toLocaleString("en-IN")}`,
      change: "+5.1%",
      trend: "up",
      icon: CreditCard,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Financial Reports
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Analyze your gym's revenue, expenses, and overall financial health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {dashboardPeriods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          const TrendIcon =
            metric.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={idx} className="relative overflow-hidden group">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.bg} ${metric.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div
                    className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                      metric.trend === "up"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {metric.change}
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.label}
                  </p>
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                </div>

                {/* Decorative background gradient */}
                <div
                  className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 ${metric.bg.replace("/10", "")} transition-opacity duration-300 group-hover:opacity-40`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transactions and Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder (Takes up 2 columns on large screens) */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Monthly cashflow overview</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div> Revenue
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Expenses
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center min-h-75 border border-dashed rounded-xl bg-muted/30 relative">
              <div className="absolute inset-0 flex items-end justify-between p-4 opacity-30 gap-2">
                {/* Simulated Chart Bars */}
                {[40, 70, 45, 90, 65, 85, 100, 75, 50, 80, 60, 95].map(
                  (h, i) => (
                    <div key={i} className="w-full flex gap-1 items-end h-full">
                      <div
                        style={{ height: `${h}%` }}
                        className="w-1/2 bg-primary rounded-t-sm"
                      />
                      <div
                        style={{ height: `${h * 0.7}%` }}
                        className="w-1/2 bg-red-500 rounded-t-sm"
                      />
                    </div>
                  ),
                )}
              </div>
              <div className="z-10 bg-background/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Chart Module Loading...
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" /> Recent
              Entries
            </CardTitle>
            <Button variant="link" className="h-auto p-0">
              View All
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-8 text-center flex justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : data.transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No transactions found.
              </div>
            ) : (
              data.transactions.map((tx, i) => (
                <div
                  key={tx.id || i}
                  className="p-3 hover:bg-muted/50 rounded-xl transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === "Income"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {tx.type === "Income" ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tx.date} • {tx.method}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-sm whitespace-nowrap ml-2 ${
                      tx.type === "Income" ? "text-emerald-500" : ""
                    }`}
                  >
                    {tx.type === "Income" ? "+" : "-"}
                    {tx.amount}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

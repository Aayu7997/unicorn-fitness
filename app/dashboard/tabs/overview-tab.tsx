'use client'


import { Award, Library, Activity, Flame, Clock, ChevronRight, Calendar as CalendarIcon, User as UserIcon, LayoutDashboard, Target, Info } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function OverviewTab({ user }: { user: any }) {
  const { data, error, isLoading } = useSWR('/api/dashboard/overview', fetcher)
  const { toast } = useToast()

  if (isLoading) {
    return <OverviewSkeleton user={user} />
  }

  const membership = data?.membership
  const stats = data?.stats || { workouts: 0, calories: 0, hours: 0, trophies: 0 }
  const upcomingClasses = data?.upcomingClasses || []
  const activePrograms = data?.activePrograms || []

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 border-b border-border/50 pb-5 sm:pb-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5 sm:gap-3">
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Here's your fitness overview and quick stats.</p>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        
        {/* Left Column (Membership & Action) */}
        <div className="flex-1 space-y-6 xl:space-y-8">
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/50 p-5 sm:p-8 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between min-h-64 sm:min-h-75">
             {/* Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary to-accent opacity-50" />
            
            <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10 gap-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1.5 sm:mb-2">Membership Status</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    {membership?.planName || 'Free Plan'}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {membership?.status || 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-muted/50 rounded-xl sm:rounded-2xl border border-border/50 shrink-0">
                <img src="/images/unicorn-logo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10 gap-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Valid Thru</p>
                <p className="text-sm sm:text-base font-bold text-foreground tracking-wider">
                  {membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Member ID</p>
                <p className="text-sm sm:text-base font-bold text-muted-foreground tracking-wider font-mono">
                  {membership?.memberId || user?.id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 bg-muted/50 border border-border/50 rounded-xl sm:rounded-2xl flex items-start gap-2.5 sm:gap-3 relative z-10">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                For payment related inquiries or upgrades, please visit the gym reception or call us directly.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions) */}
        <div className="xl:w-80 flex flex-col gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground">Quick Actions</h3>
            <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col gap-2 h-full">
              
              <Link href="/programs" className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border/50 transition-all group">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <Library className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Browse Programs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1 shrink-0" />
              </Link>
              
              <Link href="/membership" className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border/50 transition-all group">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Upgrade Plan</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1 shrink-0" />
              </Link>
              
              <button className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border/50 transition-all group w-full">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Book Class</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1 shrink-0" />
              </button>

            </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-foreground">Your Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-card border border-border/50 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{stats.workouts}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Workouts</p>
          </div>
          <div className="bg-card border border-border/50 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-destructive/10 flex items-center justify-center mb-3 sm:mb-4 border border-destructive/20 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {stats.calories >= 1000 ? (stats.calories / 1000).toFixed(1) + 'K' : stats.calories}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Calories</p>
          </div>
          <div className="bg-card border border-border/50 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-500/10 flex items-center justify-center mb-3 sm:mb-4 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{stats.hours}h</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Hours</p>
          </div>
          <div className="bg-card border border-border/50 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3 sm:mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{stats.trophies}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Trophies</p>
          </div>
        </div>
      </div>
      
      {/* Active Enrolled Programs */}
      {activePrograms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Enrolled Programs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {activePrograms.map((prog: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 bg-card border border-border/50 rounded-3xl items-center hover:border-primary/30 transition-all cursor-pointer shadow-sm group">
                  <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border/50">
                     {prog.imageUrl ? (
                        <img src={prog.imageUrl} alt={prog.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors"><Library className="w-6 h-6" /></div>
                     )}
                  </div>
                  <div>
                     <h4 className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{prog.name}</h4>
                     <p className="text-xs text-muted-foreground mt-1 font-medium">{prog.level} • {prog.duration}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function OverviewSkeleton({ user }: { user?: any }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-12 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 border-b border-border/50 pb-5 sm:pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Skeleton className="w-6 h-6 rounded-md" />
            <Skeleton className="h-7 w-56 sm:w-72 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-60 sm:w-80 rounded" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Left Column (Membership Card Skeleton) */}
        <div className="flex-1">
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/50 p-5 sm:p-8 shadow-sm flex flex-col justify-between min-h-64 sm:min-h-75 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2.5">
                <Skeleton className="h-3 w-28 rounded" />
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-44 rounded-lg" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            </div>

            <div className="flex justify-between items-end gap-4 pt-6 border-t border-border/30">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-5 w-32 rounded" />
              </div>
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions & Workout Streak Skeleton) */}
        <div className="w-full xl:w-96 space-y-4">
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/50 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-2.5">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md mt-2" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
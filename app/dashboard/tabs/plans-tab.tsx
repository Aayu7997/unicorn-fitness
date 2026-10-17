'use client'

import { useState } from 'react'

import { Activity, ClipboardList, Utensils } from 'lucide-react'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function PlansTab({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'workout' | 'diet'>('workout')
  const { data, error, isLoading } = useSWR('/api/user/plans', fetcher)

  if (isLoading) {
    return <PlansSkeleton />
  }

  const workoutPlan = data?.workout
  const dietPlan = data?.diet

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Assigned Plans</h2>
          <p className="text-sm text-muted-foreground">Personalized workout and diet plans assigned by your trainer.</p>
        </div>
      </div>

      <div className="flex p-1 bg-muted/50 border border-border/50 rounded-lg w-full max-w-md">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition-all ${
            activeTab === 'workout' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="w-4 h-4" />
          Workout Plan
        </button>
        <button
          onClick={() => setActiveTab('diet')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition-all ${
            activeTab === 'diet' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Diet Plan
        </button>
      </div>

      <div key={activeTab} className="animate-in fade-in zoom-in-95 duration-300 bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        {activeTab === 'workout' ? (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Current Routine</h3>
                <p className="text-sm text-muted-foreground">Your personalized training protocol</p>
              </div>
            </div>
            {workoutPlan ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{workoutPlan}</div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No workout plan assigned yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Diet Guidelines</h3>
                <p className="text-sm text-muted-foreground">Your personalized nutritional protocol</p>
              </div>
            </div>
            {dietPlan ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{dietPlan}</div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Utensils className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No diet plan assigned yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PlansSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Segmented Switch Skeleton */}
      <div className="p-1 bg-muted/50 border border-border/50 rounded-lg w-full max-w-md flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>

      {/* Plan Card Skeleton */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border/50">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-9/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Target, Zap, TrendingUp, Brain, Loader2, Info, Scale, ArrowRight, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function GoalsTab({ user }: { user: any }) {
  const { toast } = useToast()
  const [isLogging, setIsLogging] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogProgress = async () => {
    if (!newWeight) return;
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: newWeight })
      })
      if (!res.ok) throw new Error('Failed to log progress')
      
      toast({ title: 'Success', description: 'Progress logged successfully!' })
      setIsLogging(false)
      setNewWeight('')
      window.location.reload()
    } catch (err) {
      toast({ title: 'Error', description: 'Could not save progress.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }
  const latestWeight = user.progressLogs?.[0]?.weight || user.weight || 'N/A'
  
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [aiError, setAiError] = useState('')

  const fetchInsights = async () => {
    setIsLoadingInsights(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/health-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: user.age,
          weight: user.weight,
          height: user.height,
          goals: 'General Fitness'
        })
      })
      const data = await res.json()
      if (data.success) {
        setAiInsights(data.insights)
      } else {
        setAiError(data.error || 'Failed to analyze.')
      }
    } catch (err) {
      setAiError('Network error while reaching AI.')
    } finally {
      setIsLoadingInsights(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Goal Tracking</h2>
          <p className="text-sm text-muted-foreground">Monitor your progress and get AI-powered health insights.</p>
        </div>
        <Button
          onClick={fetchInsights}
          disabled={isLoadingInsights}
          className="shrink-0 relative overflow-hidden group bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        >
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500/0 via-white/20 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {isLoadingInsights ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
          {isLoadingInsights ? 'Analyzing...' : 'Generate AI Insights'}
        </Button>
      </div>

      {aiError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium flex items-center gap-2">
          <Info className="w-4 h-4" />
          {aiError}
        </div>
      )}

      {/* AI Insights Loading Skeleton */}
      {isLoadingInsights && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-card p-6 md:p-8 shadow-xs space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-6 w-44" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background/60 border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>

          <div className="bg-background/60 border border-border/50 rounded-xl p-6 space-y-4">
            <Skeleton className="h-4 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-background p-6 md:p-8 shadow-sm">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-indigo-500" />
                AI Health Analysis
              </h3>
              <p className="text-foreground/90 text-sm md:text-base leading-relaxed max-w-3xl">
                {aiInsights.summary}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Protein</p>
                <p className="text-2xl font-bold text-foreground">{aiInsights.macros.protein}g</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Carbohydrates</p>
                <p className="text-2xl font-bold text-foreground">{aiInsights.macros.carbs}g</p>
              </div>
              <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Fats</p>
                <p className="text-2xl font-bold text-foreground">{aiInsights.macros.fats}g</p>
              </div>
            </div>

            <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Key Recommendations</h4>
              <ul className="space-y-3">
                {aiInsights.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                    <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border/50">
              <Info className="w-4 h-4 shrink-0 text-indigo-500" />
              <p className="leading-relaxed">{aiInsights.warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Seamless Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/50 divide-x divide-border/50 [&>div]:border-b-0 md:[&>div:nth-child(1)]:border-b-0 md:[&>div:nth-child(2)]:border-b-0 md:[&>div:nth-child(3)]:border-b-0 md:[&>div:nth-child(4)]:border-b-0 [&>div:nth-child(1)]:border-b [&>div:nth-child(2)]:border-b md:[&>div]:border-b-0 border-collapse">
        <div className="p-3.5 sm:p-6 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Current Weight</span>
          </div>
          <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{latestWeight} <span className="text-sm sm:text-lg text-muted-foreground font-medium">kg</span></span>
        </div>
        <div className="p-3.5 sm:p-6 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Programs</span>
          </div>
          <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">0</span>
        </div>
        <div className="p-3.5 sm:p-6 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
          </div>
          <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">0 <span className="text-sm sm:text-lg text-muted-foreground font-medium">Days</span></span>
        </div>
        <div className="p-3.5 sm:p-6 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Rank</span>
          </div>
          <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Beginner</span>
        </div>
      </div>

      {/* Progress Logs */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Progress History</h3>
            <p className="text-sm text-muted-foreground">Track your weight and body metrics over time.</p>
          </div>
          {!isLogging && (
            <Button variant="outline" size="sm" onClick={() => setIsLogging(true)} className="flex self-start sm:self-auto">
              <Plus className="w-4 h-4 mr-2" />
              Log Entry
            </Button>
          )}
        </div>

        {isLogging && (
          <div className="p-4 bg-muted/30 border border-border/50 rounded-xl flex items-center gap-4">
            <input 
              type="number" 
              placeholder="Weight (kg)" 
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent w-32"
            />
            <Button size="sm" onClick={handleLogProgress} disabled={!newWeight || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsLogging(false)}>Cancel</Button>
          </div>
        )}

        {user.progressLogs && user.progressLogs.length > 0 ? (
          <div className="rounded-xl border border-border/50 overflow-hidden overflow-x-auto">
            <table className="w-full min-w-90 text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {user.progressLogs.map((log: any, idx: number) => (
                  <tr key={idx} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">
                      {new Date(log.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {log.weight} kg
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-muted-foreground">-</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/30 border border-border/50 border-dashed rounded-xl text-center">
            <Scale className="w-10 h-10 text-muted-foreground/50 mb-4" />
            <p className="text-foreground font-medium mb-1">No progress entries yet</p>
            <p className="text-sm text-muted-foreground mb-6">Start tracking your journey by logging your first measurement.</p>
            {!isLogging && (
              <Button onClick={() => setIsLogging(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log First Entry
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
'use client'

import { useState, useMemo, useEffect } from 'react'

import { Calculator, Info, Save, Loader2, Target } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function BmiTab() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [heightCm, setHeightCm] = useState<string>('')
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          if (data.user.age) setAge(data.user.age.toString())
          if (data.user.gender) setGender(data.user.gender)
          if (data.user.height) setHeightCm(data.user.height.toString())
          if (data.user.progressLogs?.length > 0) {
            setWeight(data.user.progressLogs[0].weight.toString())
          }
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const healthData = useMemo(() => {
    let w = parseFloat(weight)
    let h = parseFloat(heightCm) / 100 // cm to m

    if (!w || !h || h <= 0 || w <= 0) return null
    
    // Oxford "New BMI" (Trefethen Formula)
    const oxfordBmi = 1.3 * w / Math.pow(h, 2.5)

    let category = ''
    let color = ''
    let percentage = 0

    if (oxfordBmi < 18.5) {
      category = 'Underweight'
      color = 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]'
      percentage = (oxfordBmi / 18.5) * 33
    } else if (oxfordBmi < 25) {
      category = 'Healthy Weight'
      color = 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'
      percentage = 33 + ((oxfordBmi - 18.5) / 6.5) * 33
    } else if (oxfordBmi < 30) {
      category = 'Overweight'
      color = 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
      percentage = 66 + ((oxfordBmi - 25) / 5) * 16
    } else {
      category = 'Obese'
      color = 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]'
      percentage = Math.min(100, 82 + ((oxfordBmi - 30) / 10) * 18)
    }

    return { oxfordBmi: oxfordBmi.toFixed(1), category, color, percentage }
  }, [weight, heightCm])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, height: heightCm, gender, weight })
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      console.error(e)
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return <BmiSkeleton />
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">BMI Calculator</h2>
            <p className="text-sm text-muted-foreground">Powered by the Oxford "New BMI" Trefethen formula.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Input Panel - Glassmorphism */}
        <div className="rounded-xl border border-border bg-muted/50 backdrop-blur-2xl p-4 sm:p-6 shadow-sm">
          <div className="space-y-6">
            
            {/* Toggles */}
            <div className="flex justify-between gap-4">
              <div className="flex rounded-full bg-muted p-1 border border-border">
                <button
                  onClick={() => setGender('male')}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${gender === 'male' ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${gender === 'female' ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-lg font-medium text-foreground transition-all focus:border-primary/50 focus:bg-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Weight (KG)</label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-lg font-medium text-foreground transition-all focus:border-primary/50 focus:bg-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Height (CM)</label>
              <input
                type="number"
                placeholder="e.g. 175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-lg font-medium text-foreground transition-all focus:border-primary/50 focus:bg-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="group relative w-full overflow-hidden rounded-xl bg-primary p-px transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-all">
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : saveSuccess ? <Target className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                {isSaving ? 'Saving...' : saveSuccess ? 'Saved to Profile' : 'Save & Calculate'}
              </div>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50 backdrop-blur-2xl p-4 sm:p-8 shadow-sm">
          <div className="absolute inset-0  pointer-events-none" />
          
          <>
            {!healthData ? (
              <div key="empty" className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center text-muted-foreground"
              >
                <Calculator className="mb-4 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No Data</p>
                <p className="text-sm">Enter your stats to instantly generate a comprehensive clinical body profile.</p>
              </div>
            ) : (
              <div key="results" className="animate-in fade-in zoom-in-95 duration-300 w-full"
              >
                <div className="text-center mb-8">
                  <div className={`text-6xl font-black tracking-tighter ${healthData.color}`}>
                    {healthData.oxfordBmi}
                  </div>
                  <div className={`mt-2 text-xl font-bold tracking-wide uppercase ${healthData.color}`}>
                    {healthData.category}
                  </div>
                </div>

                {/* --style Gauge */}
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner">
                  <div 
                     className="animate-in fade-in zoom-in-95 duration-300 absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-blue-500 via-green-500 to-red-500"
                     style={{ width: `${healthData.percentage}%` }}
                  />
                  {/* Marker */}
                  <div 
                     className="animate-in fade-in zoom-in-95 duration-300 absolute inset-y-0 w-2 rounded-full bg-white shadow-sm" 
                     style={{ left: `calc(${healthData.percentage}% - 4px)` }}
                  />
                </div>
                
                <div className="mt-4 flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  <span>Under</span>
                  <span>Healthy</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  )
}

function BmiSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
      </div>

      {/* Grid: 2 Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Panel Wireframe */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-6">
          <div className="flex rounded-full bg-muted/60 p-1 border border-border w-fit gap-1">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Results Panel Wireframe */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-3 w-full flex flex-col items-center">
            <Skeleton className="h-16 w-32 rounded-lg" />
            <Skeleton className="h-5 w-40 rounded-full" />
          </div>

          <div className="w-full space-y-3 pt-4">
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
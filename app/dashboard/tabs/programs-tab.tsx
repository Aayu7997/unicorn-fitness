'use client'


import { Library, Clock, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ProgramsTab({ user }: { user: any }) {
  const { data, error, isLoading } = useSWR('/api/user/programs', fetcher)

  if (isLoading) {
    return <ProgramsSkeleton />
  }

  const enrolledPrograms = data?.programs || []

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Programs</h2>
          <p className="text-sm text-muted-foreground">Programs you are currently enrolled in.</p>
        </div>
        <Link href="/programs" className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors shrink-0">
          Browse More <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {enrolledPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledPrograms.map((prog: any, i: number) => (
            <div key={prog.id} className="animate-in fade-in zoom-in-95 duration-300 group relative bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
              <div className="flex flex-col h-full">
                <div className="relative h-48 bg-muted overflow-hidden">
                  {prog.imageUrl ? (
                    <img src={prog.imageUrl} alt={prog.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/10"><Library className="w-10 h-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                      {prog.level}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{prog.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">{prog.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                        <Clock className="w-4 h-4 text-primary" />
                        {prog.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                        <Users className="w-4 h-4 text-primary" />
                        {prog.trainer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-card border border-border/50 rounded-xl shadow-sm max-w-2xl mx-auto mt-12">
          <Library className="w-16 h-16 text-foreground/10 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-foreground mb-3">No Programs Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">You aren't enrolled in any programs right now. Discover a training plan tailored to your goals and start your journey today.</p>
          <Link href="/programs" className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all shadow-sm hover:shadow-md">
            Discover Programs
          </Link>
        </div>
      )}
    </div>
  )
}

function ProgramsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-4 w-28 shrink-0" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xs flex flex-col">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-2.5">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="pt-4 border-t border-border/50 flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
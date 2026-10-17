'use client'

import { useState } from 'react'

import { Calendar as CalendarIcon, Clock, MapPin, Users, Loader2, CheckCircle2 } from 'lucide-react'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ScheduleTab({ user }: { user: any }) {
  const { data, error, isLoading, mutate } = useSWR('/api/user/schedule', fetcher)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'booked'>('all')

  const handleBook = async (classId: string) => {
    setBookingId(classId)
    try {
      const res = await fetch('/api/user/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      })
      if (res.ok) {
        mutate() // Refetch schedule to update capacities and booked status
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to book')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setBookingId(null)
    }
  }

  if (isLoading) {
    return <ScheduleSkeleton />
  }

  const allClasses = data?.classes || []
  const bookedIds = data?.bookedIds || []

  // Group classes by day
  const groupedClasses = allClasses.reduce((acc: any, cls: any) => {
    if (filter === 'booked' && !bookedIds.includes(cls.id)) return acc;
    if (!acc[cls.dayOfWeek]) acc[cls.dayOfWeek] = []
    acc[cls.dayOfWeek].push(cls)
    return acc
  }, {})

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Class Schedule</h2>
          <p className="text-sm text-muted-foreground">Book your spot in our premium group classes.</p>
        </div>
        <div className="flex bg-muted/50 border border-border/50 p-1 rounded-lg w-full sm:w-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Available Classes
          </button>
          <button 
            onClick={() => setFilter('booked')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'booked' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            My Bookings
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {days.map((day, i) => {
          const classesForDay = groupedClasses[day]
          if (!classesForDay || classesForDay.length === 0) return null

          return (
            <div key={day} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 sm:px-6 py-4 bg-muted/30 border-b border-border/50 flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="text-foreground font-semibold tracking-wide">{day}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {classesForDay.map((cls: any, j: number) => {
                  const isBooked = bookedIds.includes(cls.id)
                  const isFull = cls.bookedCount >= cls.capacity
                  const spotsLeft = cls.capacity - cls.bookedCount
                  const isBooking = bookingId === cls.id

                  return (
                    <div key={cls.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted transition-colors group">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{cls.time}</span>
                          </div>
                          <p className="text-muted-foreground text-sm font-medium">{cls.name}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 text-primary/70" />
                            <span className="font-medium">Trainer: {cls.trainer}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary/70" />
                            <span className="font-medium">Room: {cls.room}</span>
                          </div>
                        </div>

                        <div className="flex items-center">
                           <div className="px-4 py-2 bg-card rounded-xl border border-border/50 w-full md:w-auto">
                              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Availability</p>
                              <p className={`text-sm font-semibold ${isFull ? 'text-destructive' : 'text-emerald-500'}`}>
                                {isFull ? 'Full' : `${spotsLeft} Spots Left`}
                              </p>
                           </div>
                        </div>
                      </div>

                      <div className="shrink-0 w-full md:w-auto">
                        {isBooked ? (
                          <div className="w-full md:w-32 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-medium text-sm flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Booked
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBook(cls.id)}
                            disabled={isFull || isBooking}
                            className={`w-full md:w-32 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center ${
                              isFull
                                ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border/50'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                          >
                            {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : isFull ? 'Waitlist' : 'Book Now'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {Object.keys(groupedClasses).length === 0 && (
          <div className="text-center py-16 px-4 bg-card border border-border/50 rounded-2xl shadow-sm max-w-2xl mx-auto mt-8">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Classes Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filter === 'booked' ? "You haven't booked any classes yet. Switch to 'Available Classes' to explore our schedule." : "Our schedule is currently empty. Please check back later!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex bg-muted/50 border border-border/50 p-1 rounded-lg w-full sm:w-auto gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Days & Class Rows Skeleton */}
      <div className="space-y-6">
        {[1, 2].map((dayIdx) => (
          <div key={dayIdx} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xs">
            {/* Day Header */}
            <div className="px-4 sm:px-6 py-4 bg-muted/30 border-b border-border/50 flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-5 w-24" />
            </div>

            {/* Class entries */}
            <div className="divide-y divide-border/50">
              {[1, 2].map((classIdx) => (
                <div key={classIdx} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div>
                      <Skeleton className="h-12 w-32 rounded-xl" />
                    </div>
                  </div>
                  <Skeleton className="w-full md:w-32 h-10 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
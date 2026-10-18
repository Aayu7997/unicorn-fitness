'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, CreditCard, Calculator, ChevronRight, Gift, MessageSquare, PanelLeftClose, PanelLeftOpen, LogOut, Share2, ClipboardList, Map, CalendarDays, Trophy, Wallet, Scale, Library, Users, LifeBuoy, UserCircle, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from "framer-motion"
import { NotificationBell } from '@/components/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { OverviewTab, OverviewSkeleton } from './tabs/overview-tab'
import { ProgramsTab } from './tabs/programs-tab'
import { ScheduleTab } from './tabs/schedule-tab'
import { GoalsTab } from './tabs/goals-tab'
import { BillingTab } from './tabs/billing-tab'
import { BmiTab } from './tabs/bmi-tab'
import { ReferralTab } from './tabs/referral-tab'
import { ProfileTab } from './tabs/profile-tab'
import { ExercisesTab } from './tabs/exercises-tab'
import { SupportTab } from './tabs/support-tab'
import { PlansTab } from './tabs/plans-tab'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
  authProvider?: string
  passwordLastChangedAt?: string
  twoFactorEnabled?: boolean
  googleFitConnected?: boolean
  samsungHealthConnected?: boolean
  fitnessDataSyncedAt?: string
  height?: number
  weight?: number
  membership?: {
    status: string
    endDate: string
    plan: {
      name: string
    }
  }
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'programs', label: 'My Programs', icon: ClipboardList },
  { id: 'plans', label: 'My Assigned Plans', icon: Map },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'goals', label: 'Goal Tracking', icon: Trophy },
  { id: 'billing', label: 'Billing & Invoices', icon: Wallet },
  { id: 'bmi', label: 'BMI Calculator', icon: Calculator },
  { id: 'exercises', label: 'Exercise Library', icon: Library },
  { id: 'support', label: 'Support & Chat', icon: LifeBuoy },
  { id: 'profile', label: 'Profile & Settings', icon: UserCircle },
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [open, setOpen] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/signin?redirect=/dashboard'); return }
      const data = await res.json()
      if (data.user) {
        if (data.user.role === 'admin') {
          router.replace('/admin')
          return
        }
        setUser(data.user)
      } else {
        router.push('/signin')
      }
    } catch {
      router.push('/signin')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="h-dvh w-full bg-background flex flex-col lg:flex-row font-sans overflow-hidden">
        {/* Mobile Top Header Wireframe */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </header>

        {/* Desktop Sidebar Wireframe */}
        <aside className="hidden lg:flex w-64 flex-col justify-between p-4 border-r border-border bg-card shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-2">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-border flex flex-col gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </aside>

        {/* Content Area Wireframe */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-background">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
            <OverviewSkeleton />
          </div>
        </main>
      </div>
    )
  }

  if (!user) return null

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab user={user} />
      case 'programs': return <ProgramsTab user={user} />
      case 'plans': return <PlansTab user={user} />
      case 'schedule': return <ScheduleTab user={user} />
      case 'goals': return <GoalsTab user={user} />
      case 'billing': return <BillingTab user={user} />
      case 'bmi': return <BmiTab />
      case 'exercises': return <ExercisesTab />
      case 'support': return <SupportTab user={user} />
      case 'profile': return (
        <ProfileTab 
          user={user} 
          onUpdateUser={(updated: any) => {
            setUser(prev => prev ? ({ ...prev, ...updated }) : null)
          }} 
        />
      )
      default: return <OverviewTab user={user} />
    }
  }

  return (
    <div className="h-dvh w-full bg-background flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-foreground -ml-2" 
            onClick={() => setOpen(!open)} 
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-foreground text-sm tracking-tight">Member Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </header>

      {/* Docked Left Corner Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6 px-3 py-4">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* User Profile Header */}
            <div className={cn("flex min-w-0 items-center justify-between mb-6 transition-all duration-200", !open ? "flex-col justify-center px-0 gap-3" : "px-2")}>
              <div className={cn("flex items-center gap-3 min-w-0", !open && "justify-center")}>
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <AnimatePresence>
                  {open && (
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex flex-col min-w-0 flex-1 overflow-hidden whitespace-nowrap"
                    >
                      <span className="font-semibold text-foreground text-sm truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={open ? "Collapse sidebar" : "Expand sidebar"}
              >
                {open ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item, idx) => {
                const isActive = activeTab === item.id
                return (
                  <SidebarLink
                    key={idx}
                    link={{
                      label: item.label,
                      href: "#",
                      icon: (
                        <item.icon 
                          className={cn(
                            "h-5 w-5 shrink-0 transition-opacity",
                            isActive ? "opacity-100" : "opacity-60"
                          )} 
                        />
                      )
                    }}
                    onClick={() => {
                      setActiveTab(item.id)
                      if (window.innerWidth < 1024) setOpen(false)
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-2 transition-colors",
                      isActive 
                        ? "bg-muted text-foreground font-semibold" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  />
                )
              })}
            </nav>
          </div>
          
          {/* Bottom actions: Theme Toggle + Logout */}
          <div className="flex flex-col gap-2 pt-3 border-t border-border mt-auto">
            <div className={cn("flex items-center", !open ? "justify-center" : "px-2.5")}>
              <ThemeToggle />
            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size={open ? "default" : "icon"}
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                !open && "justify-center px-0"
              )}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {open && <span className="ml-2.5 text-sm font-medium">Logout</span>}
            </Button>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-background">
        <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="min-h-full pb-8"
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
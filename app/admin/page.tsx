'use client'

import { useEffect, useState, useCallback } from 'react'
import { NotificationBell } from '@/components/notification-bell'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Dumbbell, Star, HelpCircle, Image, FileText,
  MessageSquare, BarChart3, Settings, LogOut, ChevronRight, Menu, X,
  TrendingUp, Globe, CreditCard, UserCheck, Bell, Shield, Zap, Search, Megaphone,
  Sparkles, TrendingDown, Activity, Layers, LayoutGrid, Package, CalendarDays, Utensils, Ruler, Receipt, BadgeIndianRupee, LayoutTemplate, Sliders, HeartPulse, Target, Bot
} from 'lucide-react'
import DashboardLayout from './components/capitalio/dashboard-layout'
import OverviewTab from './tabs/overview-tab'
import { MembersTab } from './tabs/members-tab'
import { InquiriesTab } from './tabs/inquiries-tab'
import { AnalyticsTab } from './tabs/analytics-tab'
import { SettingsTab } from './tabs/settings-tab'
import { ExpensesTab } from './tabs/expenses-tab'
import { InvoicesTab } from './tabs/invoices-tab'
import { MeasurementsTab } from './tabs/measurements-tab'
import { AiTab } from './tabs/ai-tab'
import { MasterTab } from './tabs/master-tab'
import { ClassesTab } from './tabs/classes-tab'

import { InventoryTab } from './tabs/inventory-tab'
import { ReportsTab } from './tabs/reports-tab'
import { DietTab } from './tabs/diet-tab'
import { ExerciseTab } from './tabs/exercise-tab'
import { CommunicationTab } from './tabs/communication-tab'

// Old tabs added back
import { PlansTab } from './tabs/plans-tab'
import { ProgramsTab } from './tabs/programs-tab'
import { TrainersTab } from './tabs/trainers-tab'
import { GalleryTab } from './tabs/gallery-tab'
import { TestimonialsTab } from './tabs/testimonials-tab'
import { BlogTab } from './tabs/blog-tab'
import { FAQsTab } from './tabs/faqs-tab'
import { SeoTab } from './tabs/seo-tab'
import { AdsTab } from './tabs/ads-tab'
import { SupportTab } from './tabs/support-tab'
import { SiteContentTab } from './tabs/site-content-tab'

interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'members', label: 'Members', icon: Users },
      { id: 'trainers', label: 'Trainers', icon: Users },
      { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'classes', label: 'Classes', icon: CalendarDays },
      { id: 'inventory', label: 'Inventory', icon: Package },
      { id: 'master', label: 'Master Settings', icon: Settings },
    ],
  },
  {
    label: 'Financials',
    items: [
      { id: 'invoices', label: 'Invoices', icon: Receipt },
      { id: 'expenses', label: 'Expenses', icon: BadgeIndianRupee },
      { id: 'reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'Client Progress',
    items: [
      { id: 'diet', label: 'Diet Plans', icon: Utensils },
      { id: 'exercise', label: 'Exercise Plans', icon: HeartPulse },
      { id: 'measurements', label: 'Measurements', icon: Ruler },
    ],
  },
  {
    label: 'Website CMS',
    items: [
      { id: 'site_content', label: 'Site Content', icon: LayoutTemplate },
      { id: 'programs', label: 'Programs', icon: Target },
      { id: 'gallery', label: 'Gallery', icon: Image },
      { id: 'testimonials', label: 'Testimonials', icon: Star },
      { id: 'blog', label: 'Blog', icon: FileText },
      { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'ai', label: 'AI Assistant', icon: Bot },
      { id: 'communication', label: 'Communication', icon: Globe },
      { id: 'seo', label: 'SEO Config', icon: Search },
      { id: 'ads', label: 'Ads', icon: Megaphone },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  }
]

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newInquiries, setNewInquiries] = useState(0)
  const [pendingTestimonials, setPendingTestimonials] = useState(0)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/signin?redirect=/admin'); return }
      const data = await res.json()
      if (data.user?.role !== 'admin') { router.push('/'); return }
      setUser({ ...data.user, avatar: data.user.avatarUrl })
    } catch {
      router.push('/signin?redirect=/admin')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const fetchBadgeCounts = useCallback(async () => {
    try {
      const [inqRes, testRes] = await Promise.all([
        fetch('/api/admin/inquiries?limit=1'),
        fetch('/api/admin/testimonials?pending=true'),
      ])
      if (inqRes.ok) {
        const d = await inqRes.json()
        setNewInquiries(d.newCount ?? 0)
      }
      if (testRes.ok) {
        const d = await testRes.json()
        setPendingTestimonials(Array.isArray(d) ? d.length : 0)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (user) fetchBadgeCounts()
  }, [user, fetchBadgeCounts])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const getBadge = (id: string) => {
    if (id === 'inquiries' && newInquiries > 0) return newInquiries
    if (id === 'testimonials' && pendingTestimonials > 0) return pendingTestimonials
    return null
  }

  const tabComponents: Record<string, React.ReactNode> = {
    overview: <OverviewTab />,
    analytics: <AnalyticsTab />,
    ai: <AiTab />,
    master: <MasterTab />,
    members: <MembersTab />,
    classes: <ClassesTab />,
    invoices: <InvoicesTab />,

    inquiries: <InquiriesTab onRead={fetchBadgeCounts} />,
    expenses: <ExpensesTab />,
    inventory: <InventoryTab />,
    reports: <ReportsTab />,
    diet: <DietTab />,
    exercise: <ExerciseTab />,
    measurements: <MeasurementsTab />,

    communication: <CommunicationTab />,
    settings: (
      <SettingsTab 
        user={user} 
        onUpdateUser={(updated) => {
          setUser(prev => prev ? ({ ...prev, ...updated }) : null)
        }} 
      />
    ),

    // Old tabs
    programs: <ProgramsTab />,
    trainers: <TrainersTab />,
    gallery: <GalleryTab />,
    testimonials: <TestimonialsTab onUpdate={fetchBadgeCounts} />,
    blog: <BlogTab />,
    faqs: <FAQsTab />,
    seo: <SeoTab />,
    ads: <AdsTab />,
    support: <SupportTab />,
    site_content: <SiteContentTab />,
  }

  const currentTabLabel = navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label ?? 'Dashboard'

  return (
    <DashboardLayout
      user={user}
      navGroups={navGroups}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      getBadge={getBadge}
      onLogout={handleLogout}
      title={currentTabLabel}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full min-h-full flex flex-col"
        >
          {tabComponents[activeTab] ?? <div className="text-muted-foreground">Tab not found</div>}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  )
}

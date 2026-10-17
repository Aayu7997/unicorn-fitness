import type { CSSProperties, ReactNode } from 'react'
import { DashboardSidebar, type NavGroup } from './sidebar'
import { DashboardTopbar } from './topbar'
import { SidebarProvider } from '@/components/ui/aceternity-sidebar'
import { DashboardNavigationProvider } from './navigation'

type DashboardLayoutProps = {
    children: ReactNode
    user: { name: string; email: string; avatar?: string; role: string }
    navGroups: NavGroup[]
    activeTab: string
    setActiveTab: (id: string) => void
    getBadge?: (id: string) => number | null
    onLogout: () => void
    title: string
}

export default function DashboardLayout({ 
    children, 
    user, 
    navGroups, 
    activeTab, 
    setActiveTab, 
    getBadge, 
    onLogout, 
    title 
}: DashboardLayoutProps) {
    return (
        <DashboardNavigationProvider>
            <SidebarProvider>
                <div className="flex flex-col lg:flex-row capitalio-dashboard h-svh overflow-hidden bg-background w-full">
                    <DashboardSidebar 
                        user={user} 
                        navGroups={navGroups} 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        getBadge={getBadge} 
                        onLogout={onLogout} 
                    />

                    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
                        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background shadow-2xl overflow-hidden sm:rounded-tl-xl sm:border-t sm:border-l sm:border-border">
                            <DashboardTopbar title={title} />
                            <div className="min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-4 md:p-6 lg:p-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </DashboardNavigationProvider>
    )
}

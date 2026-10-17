import { Button } from '@/components/ui/button'
import { CapitalioLogo } from './logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from '@/components/ui/aceternity-sidebar'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react'

export type NavItem = {
    id: string
    label: string
    icon: any
}

export type NavGroup = {
    label: string
    items: NavItem[]
}

type DashboardSidebarProps = {
    user: { name: string; email: string; avatar?: string; role: string }
    navGroups: NavGroup[]
    activeTab: string
    setActiveTab: (id: string) => void
    getBadge?: (id: string) => number | null
    onLogout: () => void
}

function Brand({ isOpen, setOpen }: { isOpen: boolean, setOpen: (open: boolean) => void }) {
    return (
        <div className={cn("flex min-w-0 items-center justify-between mt-2 px-2 transition-all duration-300", !isOpen && "flex-col justify-center px-0 gap-4 mt-4")}>
            <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
                <div className="size-10 flex shrink-0 items-center justify-center">
                    <img src="/images/unicorn-logo.png" alt="Unicorn Fitness Club" className="size-10 shrink-0 object-contain drop-shadow-md" />
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8, width: 0 }}
                            animate={{ opacity: 1, scale: 1, width: "auto" }}
                            exit={{ opacity: 0, scale: 0.8, width: 0 }}
                            className="truncate text-[15px] font-semibold text-foreground tracking-tight whitespace-nowrap overflow-hidden"
                        >
                            Unicorn Fitness Club
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            
            <motion.button
                layout
                onClick={() => setOpen(!isOpen)}
                className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
                {isOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-5" />}
            </motion.button>
        </div>
    )
}

function SidebarContent({ navGroups, activeTab, setActiveTab, getBadge }: any) {
    const { open: isOpen, setOpen } = useSidebar();

    return (
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full">
            <Brand isOpen={isOpen} setOpen={setOpen} />
            
            <div className="mt-8 flex flex-col gap-6">
                {navGroups.map((group: NavGroup) => (
                    <div key={group.label} className="flex flex-col gap-2">
                        <AnimatePresence>
                            {group.label && isOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 whitespace-nowrap overflow-hidden"
                                >
                                    {group.label}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-1">
                            {group.items.map((item) => {
                                const Icon = item.icon
                                const isActive = activeTab === item.id
                                const badge = getBadge?.(item.id)

                                return (
                                    <SidebarLink
                                        key={item.id}
                                        link={{
                                            label: item.label,
                                            href: "#",
                                            icon: (
                                                <div className="relative flex items-center shrink-0">
                                                    <Icon className={cn("size-5 shrink-0 transition-opacity", isActive ? "opacity-100" : "opacity-60", isActive && !isOpen ? "text-foreground" : "")} />
                                                    {badge && !isOpen && (
                                                        <span className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-2 h-2" />
                                                    )}
                                                </div>
                                            )
                                        }}
                                        onClick={() => {
                                            setActiveTab(item.id)
                                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                                setOpen(false)
                                            }
                                        }}
                                        className={cn(
                                            "rounded-xl px-2 relative",
                                            isActive ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    />
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function DashboardSidebar({ user, navGroups, activeTab, setActiveTab, getBadge, onLogout }: DashboardSidebarProps) {
    const { open } = useSidebar();

    return (
        <SidebarBody className="justify-between gap-4 border-none shadow-none w-full bg-background!">
            <SidebarContent 
                navGroups={navGroups} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                getBadge={getBadge} 
            />

            <div className="flex flex-col gap-4 w-full">
                <div className="border-t border-border w-full" />
                
                {/* User Profile */}
                <div className={cn("flex min-w-0 items-center gap-3", !open && "justify-center")}>
                    <Avatar className="size-10 rounded-lg shrink-0 overflow-hidden">
                        <AvatarImage src={user.avatar} className="rounded-lg object-cover w-full h-full" />
                        <AvatarFallback className="rounded-lg uppercase text-xs font-bold bg-orange-500/20 text-orange-400">
                            {user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    
                    <AnimatePresence>
                        {open && (
                            <motion.div 
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden whitespace-nowrap"
                            >
                                <span className="truncate text-sm leading-none font-semibold text-foreground">
                                    {user.name}
                                </span>
                                <span className="premium-badge capitalize self-start text-[10px] mt-1">{user.role}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={cn("shrink-0", !open && "flex justify-center")}>
                    <Button 
                        onClick={onLogout} 
                        variant="ghost" 
                        size={open ? "default" : "icon"}
                        className={cn("w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10", !open && "justify-center px-0")}
                    >
                        <LogOut className="w-5 h-5" />
                        {open && <span className="ml-2 font-medium">Logout</span>}
                    </Button>
                </div>
            </div>
        </SidebarBody>
    )
}

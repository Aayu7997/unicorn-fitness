import { useState } from 'react'
import { TopbarCalendarIcon, TopbarExportIcon } from './icons'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notification-bell'
import { Globe, Menu, ChevronDown, Check, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSidebar } from '@/components/ui/aceternity-sidebar'
import { useDashboardNavigation } from './navigation'
import { dashboardPeriods, type PeriodValue } from './shared'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type DashboardTopbarProps = {
    title: string
}

export function DashboardTopbar({ title }: DashboardTopbarProps) {
    const { open, setOpen } = useSidebar()
    const { period, setPeriod, dateRange, customRange, setCustomRange } = useDashboardNavigation()

    const [customDialogOpen, setCustomDialogOpen] = useState(false)
    const [customFrom, setCustomFrom] = useState(
        customRange?.from ? new Date(customRange.from).toISOString().split('T')[0] : ''
    )
    const [customTo, setCustomTo] = useState(
        customRange?.to ? new Date(customRange.to).toISOString().split('T')[0] : ''
    )

    const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    const handleApplyCustom = () => {
        if (!customFrom) return
        setCustomRange({
            from: new Date(customFrom),
            to: customTo ? new Date(customTo) : new Date(),
        })
        setPeriod('custom')
        setCustomDialogOpen(false)
    }

    // Determine current display label
    const activePeriodObj = dashboardPeriods.find((p) => p.value === period)
    const currentLabel = period === 'custom' ? dateRange.label : (activePeriodObj?.label || 'Last 6 Months')

    return (
        <header className="flex shrink-0 flex-col gap-2.5 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8 border-b border-border bg-background">
            <div className="flex min-w-0 items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-foreground -ml-2 shrink-0" 
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle navigation"
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 md:flex-col md:items-start md:justify-center md:gap-1.5">
                    <h1 className="truncate font-section text-lg leading-none font-semibold text-foreground md:text-xl capitalize">
                        {title}
                    </h1>
                    <div className="hidden sm:flex shrink-0 items-center gap-1.5 font-section text-xs text-muted-foreground md:gap-2 md:text-sm">
                        <span className="whitespace-nowrap">
                            <span className="hidden md:inline">Last updated: </span>
                            {today}
                        </span>
                        <span className="size-2 shrink-0 rounded-full bg-border" />
                        <span className="shrink-0 font-medium">
                            <span className="hidden font-normal md:inline">All values in </span>
                            INR
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 md:shrink-0 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <NotificationBell />
                    <Button variant="outline" className="hidden sm:flex h-9 text-muted-foreground hover:text-foreground gap-2" asChild>
                        <Link href="/" target="_blank">
                            <Globe className="w-4 h-4" />
                            View Site
                        </Link>
                    </Button>
                </div>
                
                {/* Interactive Period Selector (Replacing static "Last 6 Months") */}
                <div className="flex min-w-0 items-center sm:border-l sm:border-border sm:pl-3 sm:ml-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex h-9 min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 md:px-3 cursor-pointer transition-all"
                            >
                                <TopbarCalendarIcon className="size-4 shrink-0 text-amber-500" />
                                <span className="truncate max-w-28 sm:max-w-50">{currentLabel}</span>
                                <ChevronDown className="size-3.5 shrink-0 opacity-60 ml-0.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
                            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                                Filter Date Range
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {dashboardPeriods.map((item) => (
                                <DropdownMenuItem
                                    key={item.value}
                                    onClick={() => setPeriod(item.value)}
                                    className="flex items-center justify-between text-sm py-2 px-2.5 cursor-pointer rounded-md focus:bg-accent focus:text-accent-foreground"
                                >
                                    <span>{item.label}</span>
                                    {period === item.value && (
                                        <Check className="size-4 text-amber-500 stroke-[2.5]" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setCustomDialogOpen(true)}
                                className="flex items-center justify-between text-sm py-2 px-2.5 cursor-pointer rounded-md focus:bg-accent focus:text-accent-foreground text-amber-500 dark:text-amber-400 font-medium"
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="size-4" />
                                    <span>Custom Range...</span>
                                </div>
                                {period === 'custom' && (
                                    <Check className="size-4 text-amber-500 stroke-[2.5]" />
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Button className="sm:shrink-0 h-9 hidden">
                    <span>Export</span>
                    <TopbarExportIcon className="size-3 rotate-180" />
                </Button>
            </div>

            {/* Custom Range Dialog */}
            <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarIcon className="size-5 text-amber-500" />
                            Select Custom Date Range
                        </DialogTitle>
                        <DialogDescription>
                            Pick the start and end dates to filter all analytics and overview data in the admin panel.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-3">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">Start Date</label>
                            <Input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">End Date</label>
                            <Input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="h-10"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApplyCustom}
                            disabled={!customFrom}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            Apply Filter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    )
}

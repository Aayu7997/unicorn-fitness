import {
    createContext,
    useContext,
    useMemo,
    useState,
    useEffect,
    type AnchorHTMLAttributes,
    type MouseEvent,
    type ReactNode,
} from 'react'
import { defaultDashboardPeriod, getPeriodDateRange, type PeriodValue } from './shared'

export type CustomDateRange = { from?: Date | string | null; to?: Date | string | null }

type DashboardNavigation = {
    pathname: string
    navigate: (pathname: string) => void
    period: PeriodValue
    setPeriod: (period: PeriodValue) => void
    customRange: CustomDateRange | null
    setCustomRange: (range: CustomDateRange | null) => void
    dateRange: { startDate: Date; endDate: Date; label: string }
}

const DashboardNavigationContext = createContext<DashboardNavigation | null>(
    null,
)

export function DashboardNavigationProvider({
    children,
}: {
    children: ReactNode
}) {
    const [pathname, setPathname] = useState('/')
    const [period, setPeriodState] = useState<PeriodValue>(defaultDashboardPeriod)
    const [customRange, setCustomRange] = useState<CustomDateRange | null>(null)

    // Load initial preference from localStorage if available
    useEffect(() => {
        try {
            const saved = localStorage.getItem('admin_dashboard_period') as PeriodValue | null
            if (saved && ['today', '7d', '30d', '90d', '6m', '12m', 'ytd', 'all', 'custom'].includes(saved)) {
                setPeriodState(saved)
            }
        } catch {}
    }, [])

    const setPeriod = (p: PeriodValue) => {
        setPeriodState(p)
        try {
            localStorage.setItem('admin_dashboard_period', p)
        } catch {}
    }

    const dateRange = useMemo(
        () => getPeriodDateRange(period, customRange),
        [period, customRange]
    )

    const value = useMemo(
        () => ({
            pathname,
            navigate: setPathname,
            period,
            setPeriod,
            customRange,
            setCustomRange,
            dateRange
        }),
        [pathname, period, customRange, dateRange],
    )

    return (
        <DashboardNavigationContext.Provider value={value}>
            {children}
        </DashboardNavigationContext.Provider>
    )
}

export function useDashboardNavigation() {
    const context = useContext(DashboardNavigationContext)

    if (!context) {
        throw new Error(
            'useDashboardNavigation must be used within DashboardNavigationProvider',
        )
    }

    return context
}

export function DashboardLink({
    href,
    onClick,
    ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    const { navigate } = useDashboardNavigation()

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        onClick?.(event)

        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return
        }

        event.preventDefault()
        navigate(href)
    }

    return <a href={href} onClick={handleClick} {...props} />
}

export type PeriodValue = 'today' | '7d' | '30d' | '90d' | '6m' | '12m' | 'ytd' | 'all' | 'custom'

export const dashboardPeriods: { label: string; value: PeriodValue }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 3 Months', value: '90d' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'This Year (YTD)', value: 'ytd' },
    { label: 'Last 12 Months', value: '12m' },
    { label: 'All Time', value: 'all' },
]

export const defaultDashboardPeriod: PeriodValue = '6m'

export function getPeriodDateRange(
    period: PeriodValue | string,
    customRange?: { from?: Date | string | null; to?: Date | string | null } | null
): { startDate: Date; endDate: Date; label: string } {
    const now = new Date()
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    if (period === 'custom' && customRange?.from) {
        const start = new Date(customRange.from)
        start.setHours(0, 0, 0, 0)
        const end = customRange.to ? new Date(customRange.to) : new Date(now)
        end.setHours(23, 59, 59, 999)
        const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        return { startDate: start, endDate: end, label }
    }

    switch (period) {
        case 'today': {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
            return { startDate: start, endDate, label: 'Today' }
        }
        case '7d': {
            const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            start.setHours(0, 0, 0, 0)
            return { startDate: start, endDate, label: 'Last 7 Days' }
        }
        case '30d': {
            const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            start.setHours(0, 0, 0, 0)
            return { startDate: start, endDate, label: 'Last 30 Days' }
        }
        case '90d': {
            const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate(), 0, 0, 0, 0)
            return { startDate: start, endDate, label: 'Last 3 Months' }
        }
        case '6m': {
            const start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate(), 0, 0, 0, 0)
            return { startDate: start, endDate, label: 'Last 6 Months' }
        }
        case 'ytd': {
            const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
            return { startDate: start, endDate, label: 'This Year (YTD)' }
        }
        case '12m': {
            const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0)
            return { startDate: start, endDate, label: 'Last 12 Months' }
        }
        case 'all':
        default: {
            const start = new Date(2020, 0, 1, 0, 0, 0, 0)
            return { startDate: start, endDate, label: 'All Time' }
        }
    }
}

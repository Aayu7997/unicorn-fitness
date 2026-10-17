import { useEffect } from 'react'

export function usePerformance() {
  useEffect(() => {
    // Disable animations on slow devices
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--animation-duration', '0ms')
    }

    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Log to analytics in production
            console.debug('Performance metric:', {
              name: entry.name,
              value: (entry as any).value,
            })
          }
        })

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
      } catch (e) {
        // Graceful fallback for unsupported browsers
      }
    }
  }, [])
}

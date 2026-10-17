'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative w-11 h-11 rounded-full bg-secondary/50 border border-border" />
    )
  }

  return (
    <AnimatedThemeToggler
      variant="circle"
      theme={resolvedTheme as "light" | "dark"}
      onThemeChange={(newTheme) => setTheme(newTheme)}
      className="relative w-10 h-10 rounded-full flex items-center justify-center bg-secondary/80 hover:bg-secondary transition-all duration-300 border border-border hover:border-[#d96638]/40 hover:scale-105 active:scale-95 overflow-hidden group shadow-xs"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <div className="relative flex items-center justify-center w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] rotate-0 dark:rotate-360">
        <Sun className="absolute w-5 h-5 text-amber-500 transition-opacity duration-700 dark:opacity-0 opacity-100 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" strokeWidth={2.2} />
        <Moon className="absolute w-5 h-5 text-orange-400 dark:text-amber-300 transition-opacity duration-700 dark:opacity-100 opacity-0 drop-shadow-[0_0_8px_rgba(217,102,56,0.4)]" strokeWidth={2.2} />
      </div>
    </AnimatedThemeToggler>
  )
}

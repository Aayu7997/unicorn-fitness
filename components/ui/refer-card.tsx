'use client'

import React from 'react'
import { Gift, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ReferCardProps {
  onPress: () => void
  className?: string
}

export function ReferCard({ onPress, className }: ReferCardProps) {
  return (
    <div 
      className={cn(
        "cursor-pointer group hover:border-[#007AFF]/30 transition-colors bg-card dark:bg-[#1c1c1e] rounded-3xl shadow-sm border border-black/5 dark:border-border/50", 
        className
      )} 
      onClick={onPress}
    >
      <div className="flex flex-row items-center p-5">
        <div className="p-3 bg-[#007AFF]/10 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
          <Gift className="w-8 h-8 text-[#007AFF]" />
        </div>
        <div className="flex-1">
          <h3 className="text-[17px] font-semibold tracking-tight text-foreground dark:text-foreground mb-1">
            Refer a Friend
          </h3>
          <p className="text-[13px] text-foreground/60 dark:text-foreground/60">
            Get 1 month free for every referral
          </p>
        </div>
        <div className="p-2 bg-background/5 dark:bg-card/5 rounded-full group-hover:bg-[#007AFF]/10 transition-colors">
          <ChevronRight className="w-5 h-5 text-foreground/40 dark:text-foreground/40 group-hover:text-[#007AFF] transition-colors" />
        </div>
      </div>
    </div>
  )
}

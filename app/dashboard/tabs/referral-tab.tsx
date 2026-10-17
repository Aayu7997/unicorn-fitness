'use client'
import { useState } from 'react'

import { Gift, Copy, Share2, Users, CheckCircle2 } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

export function ReferralTab({ user }: { user: any }) {
  const [copied, setCopied] = useState(false)
  const referralCode = `UNICORN-${user.name.split(' ')[0].toUpperCase()}-${user.id.substring(0, 4).toUpperCase()}`

  const handleCopy = async () => {
    await copyToClipboard(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Refer a Friend</h2>
        <p className="text-muted-foreground text-sm">Earn free months by inviting your friends to the club.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Referral Code Card */}
        <div className="animate-in fade-in zoom-in-95 duration-300 bg-card border border-orange-500/30 rounded-2xl p-5 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-6 border border-orange-500/30">
              <Gift className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Give a Month, Get a Month</h3>
            <p className="text-foreground/60 text-sm mb-6 sm:mb-8">
              Share your unique code. When a friend signs up for any Pro plan using your code, they get 20% off their first month, and you get a month for free!
            </p>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Unique Code</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted border border-border rounded-xl px-3 sm:px-4 py-3 flex items-center justify-between min-w-0">
                  <span className="font-mono text-sm sm:text-lg font-bold text-orange-400 tracking-wider break-all">{referralCode}</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="w-14 h-14 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-muted hover:bg-muted/50 border border-border rounded-xl text-foreground font-medium flex items-center justify-center gap-2 transition-all">
              <Share2 className="w-4 h-4" /> Share via WhatsApp
            </button>
          </div>
        </div>

        {/* Progress & Stats */}
        <div className="space-y-6">
          <div className="animate-in fade-in zoom-in-95 duration-300  bg-card border border-border/50 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Friends Joined</p>
                <p className="text-4xl font-bold text-foreground">2</p>
              </div>
              <Users className="w-8 h-8 text-foreground/10" />
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-6">
              <div className="h-full bg-green-400 w-[66%]" />
            </div>
            <p className="text-muted-foreground text-xs mt-3 text-center">1 more friend to unlock your next free month!</p>
          </div>

          <div className="animate-in fade-in zoom-in-95 duration-300  bg-card border border-border/50 rounded-2xl p-6">
            <h3 className="text-foreground font-semibold mb-4">Recent Referrals</h3>
            <div className="space-y-4">
              {[
                { name: 'Rahul Sharma', date: 'May 12, 2024', status: 'Completed', reward: '1 Month Free' },
                { name: 'Priya Patel', date: 'May 28, 2024', status: 'Completed', reward: '1 Month Free' },
              ].map((ref, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/50">
                  <div>
                    <p className="text-foreground text-sm font-semibold">{ref.name}</p>
                    <p className="text-foreground/40 text-xs">{ref.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20 mb-1">
                      <CheckCircle2 className="w-3 h-3" /> {ref.status}
                    </span>
                    <p className="text-orange-400 text-xs font-bold">{ref.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

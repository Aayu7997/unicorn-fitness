'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, BarChart, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Program {
  id: string
  name: string
  slug: string
  description: string
  duration: string
  level: string
  trainer: string
  imageUrl?: string | null
  benefits: string[]
}

export function ProgramsSection({ programs }: { programs: Program[] }) {
  if (!programs || programs.length === 0) return null

  return (
    <section className="py-32 px-6 sm:px-8 lg:px-12 bg-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
              Our Training Programs
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Find Your Perfect Fit
            </h2>
          </div>
          <Link
            href="/programs"
            className="group flex items-center gap-2 text-accent font-semibold hover:text-accent/80 transition-colors"
          >
            View All Programs
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, i) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-accent/50 transition-colors"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-accent/10">
                {program.imageUrl ? (
                  <img
                    src={program.imageUrl}
                    alt={program.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    💪
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-semibold text-foreground border border-border/50">
                    <Clock className="w-3 h-3 inline-block mr-1" />
                    {program.duration}
                  </span>
                  <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-semibold text-foreground border border-border/50">
                    <BarChart className="w-3 h-3 inline-block mr-1" />
                    {program.level}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                  {program.name}
                </h3>
                <p className="text-foreground/60 text-sm mb-6 line-clamp-2">
                  {program.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/50">Trainer</p>
                      <p className="text-sm font-semibold">{program.trainer}</p>
                    </div>
                  </div>
                  
                  <Link
                    href={`/programs#${program.slug}`}
                    className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center group-hover:bg-accent/90 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Mail, Linkedin, Instagram } from 'lucide-react'

interface Trainer {
  id: string
  name: string
  role: string
  imageUrl?: string | null
  specialty: string
  experience: string
  bio: string
}

export function TeamSection({ trainers }: { trainers: Trainer[] }) {
  if (!trainers || trainers.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.92 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as const },
    },
  }

  return (
    <section className="py-28 px-6 sm:px-8 lg:px-12 relative overflow-hidden section-contained">
      <div className="absolute inset-0 bg-linear-to-b from-background via-card/30 to-background" />
      <div className="max-w-6xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Expert Team</p>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">Meet Your Coaches</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">Certified professionals dedicated to your fitness success</p>
        </motion.div>
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {trainers.map((trainer, index) => (
            <TrainerCard key={trainer.id} trainer={trainer} index={index} itemVariants={itemVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TrainerCard({ trainer, index, itemVariants }: { trainer: any; index: number; itemVariants: any }) {
  return (
    <motion.div variants={itemVariants} className="group" style={{ perspective: '1000px' }}>
      {/* CSS-only flip card — replaces Framer Motion animate rotateY */}
      <div 
        className="relative h-[400px] w-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:[transform:rotateY(180deg)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
          <img src={trainer.imageUrl || "/placeholder.svg"} alt={trainer.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-xl font-bold text-foreground mb-1">{trainer.name}</h3>
            <p className="text-orange-400 text-sm font-semibold">{trainer.role}</p>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-card border border-accent/20 p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={trainer.imageUrl || "/placeholder.svg"} alt={trainer.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/30" loading="lazy" />
              <div>
                <h3 className="text-lg font-bold">{trainer.name}</h3>
                <p className="text-accent text-xs font-semibold">{trainer.role}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Specialty</p><p className="text-foreground/80">{trainer.specialty}</p></div>
              <div><p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Experience</p><p className="text-foreground/80">{trainer.experience}</p></div>
              <div><p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">-</p><p className="text-foreground/70 leading-relaxed">{trainer.bio}</p></div>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            {[Instagram, Mail, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="p-2.5 bg-accent/10 hover:bg-accent rounded-lg transition-all duration-200 hover:scale-110 active:scale-95">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

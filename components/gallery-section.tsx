'use client'

import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'

export interface GalleryImage {
  id: string
  title?: string | null
  category: string
  imageUrl: string
}

export function GallerySection({ images }: { images: GalleryImage[] }) {
  if (!images || images.length === 0) return null

  return (
    <section className="py-32 px-6 sm:px-8 lg:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Follow Us
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Gym Gallery
          </h2>
          <a
            href="https://instagram.com/unicornfitnessclub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors"
          >
            <Instagram className="w-5 h-5" />
            @unicornfitnessclub
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((image, i) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-card"
            >
              {image.imageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={image.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              ) : (
                <img
                  src={image.imageUrl}
                  alt={image.title || 'Gym Gallery Image'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Instagram className="w-8 h-8 text-foreground mx-auto mb-2" />
                  <p className="text-foreground font-semibold">{image.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}



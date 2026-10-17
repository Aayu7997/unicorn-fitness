'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollTiltedGrid } from '@/components/scroll-tilted-grid'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { X, PlayCircle } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string | null
  imageUrl: string
  category: string
}

export function GalleryClient({
  galleryItems,
  videoHighlights,
}: {
  galleryItems: GalleryItem[]
  videoHighlights: GalleryItem[]
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  }

  const isVideo = (url: string) => /\.(mp4|webm|mov)$/i.test(url)

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-foreground mb-4"
          >
            Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-foreground/70"
          >
            Explore our facilities, events, and member transformations
          </motion.p>
        </div>
      </section>

      {/* Gallery Grid */}
      <div className="w-full">
        <ScrollTiltedGrid
          items={galleryItems.map(item => ({
            id: item.id,
            src: item.imageUrl,
            alt: item.title || 'Gallery image',
            title: item.title || undefined,
            isVideo: isVideo(item.imageUrl),
            onClick: () => {
              if (isVideo(item.imageUrl)) setSelectedVideo(item.imageUrl)
              else setSelectedImage(item.imageUrl)
            }
          }))}
        />
      </div>

      {/* Video Highlights Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-foreground">
            Video Highlights
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {videoHighlights.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative group overflow-hidden rounded-lg aspect-video cursor-pointer bg-black/20"
                onClick={() => setSelectedVideo(video.imageUrl)}
              >
                {video.imageUrl ? (
                  isVideo(video.imageUrl) ? (
                    <video
                      src={video.imageUrl}
                      autoPlay loop muted playsInline
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <img src={video.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  )
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-2xl shadow-xl group-hover:scale-110 transition-transform"
                    whileHover={{ scale: 1.1 }}
                  >
                    <PlayCircle className="w-8 h-8" />
                  </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/90 to-transparent pointer-events-none">
                  <p className="text-white font-semibold text-lg">{video.title || 'Highlight'}</p>
                </div>
              </motion.div>
            ))}
            
            {videoHighlights.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center text-foreground/50 py-12 border-2 border-dashed border-border rounded-xl">
                No video highlights added yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            className="relative max-w-4xl w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img src={selectedImage} alt="Expanded gallery" className="w-full max-h-[80vh] object-contain rounded-lg" />
          </motion.div>
        </motion.div>
      )}

      {selectedVideo && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            className="relative max-w-5xl w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <video src={selectedVideo} controls autoPlay className="w-full max-h-[80vh] rounded-xl shadow-2xl bg-black" />
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}

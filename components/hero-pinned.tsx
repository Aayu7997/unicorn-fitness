'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface HeroProps {
  heroData?: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }
}

export function HeroPinned({ heroData }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      // Set initial states to prevent FOUC
      gsap.set('.hero-media-container', { scale: 1 })
      gsap.set('.hero-content', { opacity: 1 })
      gsap.set('.hero-char', { transformPerspective: 800 })

      // Scroll-driven Parallax and Cinematic Fade
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2, // Smooth follow-through
        },
      })

      // The media pushes down slightly (parallax) and blurs/fades
      tl.to('.hero-media-container', {
        y: '40vh',
        scale: 1.05,
        opacity: 0.2,
        filter: 'blur(8px)',
        ease: 'none',
        force3D: true,
      }, 0)
      
      // Text moves up faster than scroll (reverse parallax)
      .to('.hero-content', {
        y: '-30vh',
        opacity: 0,
        scale: 0.9,
        ease: 'none',
        force3D: true,
      }, 0)
      
      // Scroll indicator fades out immediately
      .to('.hero-scroll-indicator', {
        opacity: 0,
        y: 20,
        ease: 'none',
      }, 0)

      // Initial Entrance Animations
      // Cinematic zoom out of background media on load
      gsap.fromTo('.hero-media-inner',
        { scale: 1.15, filter: 'blur(10px)' },
        { scale: 1, filter: 'blur(0px)', duration: 2.5, ease: 'power3.out', force3D: true }
      )

      const titleChars = container.querySelectorAll('.hero-char')
      gsap.fromTo(titleChars,
        { y: 100, opacity: 0, rotateX: -90, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.03,
          ease: 'power4.out',
          delay: 0.2,
          force3D: true,
        }
      )

      gsap.from('.hero-sub', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.8,
        force3D: true,
      })

      gsap.from('.hero-buttons', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 1.1,
        force3D: true,
      })

      gsap.from('.hero-scroll-indicator', {
        opacity: 0,
        duration: 1,
        delay: 1.2,
      })

    }, container)

    return () => ctx.revert()
  }, [])

  const title = heroData?.headline || 'Unicorn Fitness Club'
  const subheadline = heroData?.subheadline || 'Premium fitness experience in Jaipur. Transform your body with elite training programs and world-class facilities.'
  const cta = heroData?.cta || 'Start Your Journey'
  const titleWords = title.split(' ')

  return (
    <div ref={containerRef} className="relative h-screen bg-background overflow-hidden">
      
      {/* Cinematic Media Container */}
      <div className="hero-media-container absolute inset-0 w-full h-full origin-center overflow-hidden bg-background" style={{ willChange: 'transform, opacity' }}>
        {heroData?.mediaType === 'video' ? (
          <video 
            src={heroData.mediaUrl}
            autoPlay 
            loop 
            muted 
            playsInline
            className="hero-media-inner absolute inset-0 w-full h-full object-cover scale-105" // slight scale to prevent edge bleed
            style={{ filter: 'brightness(0.7)' }}
          />
        ) : (
          <img
            src={heroData?.mediaUrl || "/images/hero-gym.jpg"}
            alt="Hero Background"
            fetchPriority="high"
            decoding="sync"
            className="hero-media-inner absolute inset-0 w-full h-full object-cover scale-105"
            style={{ filter: 'brightness(0.7)' }}
          />
        )}
        
        {/* Dynamic Vignette / Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.8) 100%), radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 h-full flex flex-col justify-center items-center text-center px-6" style={{ willChange: 'transform, opacity' }}>
        
        {/* --style typography */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-foreground tracking-tighter mb-6 leading-[0.95] max-w-6xl mx-auto flex flex-wrap justify-center gap-[0.2em]">
          {titleWords.map((word, wordIdx) => (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word.split('').map((char, charIdx) => (
                <span 
                  key={charIdx} 
                  className="hero-char inline-block"
                  style={{ transformOrigin: '50% 50% -50px' }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>
        
        <p className="hero-sub text-base sm:text-lg md:text-xl text-gray-300/90 max-w-2xl mx-auto mb-10 tracking-wide leading-relaxed font-light">
          {subheadline}
        </p>

        <div className="hero-buttons flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <Link
            href="/membership"
            className="group relative px-8 py-4 bg-card/10 backdrop-blur-md border border-white/20 rounded-full font-semibold text-foreground hover:bg-card/20 hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-2xl"
          >
            <span className="relative z-10">{cta}</span>
            <div className="w-8 h-8 rounded-full bg-card text-foreground flex items-center justify-center relative z-10 group-hover:bg-orange-500 group-hover:text-foreground transition-colors duration-300">
                <ChevronDown className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 font-medium">Scroll to explore</span>
        <ChevronDown className="w-5 h-5 text-foreground/50 animate-bounce" />
      </div>

    </div>
  )
}

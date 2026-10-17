'use client'

import React from 'react'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#f8f9fa] dark:bg-[#050302] -z-10 pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: `
        /* 
          Apple Music "Double Rotation" Mesh Gradient Technique 
          1. The wrapper orbits the entire blob around the screen
          2. The blob itself spins and liquid-morphs in the opposite direction
          This creates an incredibly heavy, unpredictable, high-viscosity physics effect.
        */

        @keyframes orbit-clockwise {
          0% { transform: rotate(0deg) translateX(10vw) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(10vw) rotate(-360deg); }
        }

        @keyframes orbit-counter {
          0% { transform: rotate(0deg) translateX(15vw) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(15vw) rotate(360deg); }
        }

        @keyframes liquid-morph-1 {
          0% { 
            transform: rotate(0deg) scale(1);
            border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%;
          }
          34% { 
            transform: rotate(120deg) scale(1.1);
            border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
          }
          67% { 
            transform: rotate(240deg) scale(0.9);
            border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%;
          }
          100% { 
            transform: rotate(360deg) scale(1);
            border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%;
          }
        }

        @keyframes liquid-morph-2 {
          0% { 
            transform: rotate(0deg) scale(1.2);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          34% { 
            transform: rotate(-120deg) scale(0.9);
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          67% { 
            transform: rotate(-240deg) scale(1.3);
            border-radius: 50% 40% 60% 50% / 40% 50% 60% 50%;
          }
          100% { 
            transform: rotate(-360deg) scale(1.2);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }

        .orb-wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        .liquid-orb {
          position: absolute;
          filter: blur(90px);
          opacity: 0.85;
          mix-blend-mode: screen;
          will-change: transform, border-radius;
        }
      `}} />

      {/* Deep Abyss Base Layer */}
      <div className="absolute inset-0 bg-[#f8f9fa] dark:bg-[#050302] z-0" />

      {/* --- ORB 1: Copper (Massive slow clockwise orbit) --- */}
      <div 
        className="orb-wrapper"
        style={{ animation: 'orbit-clockwise 45s infinite linear' }}
      >
        <div 
          className="liquid-orb mix-blend-normal dark:mix-blend-screen"
          style={{ 
            width: '80vw', height: '80vw',
            background: 'radial-gradient(circle at center, rgba(217,102,56,1) 0%, rgba(217,102,56,0) 70%)',
            animation: 'liquid-morph-1 25s infinite linear',
            transformOrigin: '40% 60%' // Eccentric spin center
          }}
        />
      </div>

      {/* --- ORB 2: Mauve/Crimson (Counter-clockwise mid-speed orbit) --- */}
      <div 
        className="orb-wrapper"
        style={{ animation: 'orbit-counter 35s infinite linear' }}
      >
        <div 
          className="liquid-orb mix-blend-normal dark:mix-blend-screen"
          style={{ 
            width: '90vw', height: '90vw',
            background: 'radial-gradient(circle at center, rgba(145,71,71,1) 0%, rgba(145,71,71,0) 70%)',
            animation: 'liquid-morph-2 30s infinite linear',
            transformOrigin: '60% 40%'
          }}
        />
      </div>

      {/* --- ORB 3: Apple Champagne (Fast offset clockwise orbit) --- */}
      <div 
        className="orb-wrapper"
        style={{ 
          transform: 'translate(-10vw, 20vh)', // Offset the center
          animation: 'orbit-clockwise 28s infinite linear' 
        }}
      >
        <div 
          className="liquid-orb mix-blend-normal dark:mix-blend-hard-light"
          style={{ 
            width: '70vw', height: '70vw',
            background: 'radial-gradient(circle at center, rgba(215,200,180,0.9) 0%, rgba(215,200,180,0) 70%)',
            animation: 'liquid-morph-1 22s infinite linear reverse',
            transformOrigin: '30% 70%'
          }}
        />
      </div>

      {/* --- ORB 4: Golden Sand (Counter-clockwise bottom anchor) --- */}
      <div 
        className="orb-wrapper"
        style={{ 
          transform: 'translate(15vw, -15vh)',
          animation: 'orbit-counter 40s infinite linear' 
        }}
      >
        <div 
          className="liquid-orb mix-blend-normal dark:mix-blend-screen"
          style={{ 
            width: '85vw', height: '85vw',
            background: 'radial-gradient(circle at center, rgba(235,187,137,0.85) 0%, rgba(235,187,137,0) 70%)',
            animation: 'liquid-morph-2 28s infinite linear',
            transformOrigin: '70% 30%'
          }}
        />
      </div>

      {/* 
        The Apple Music Secret: An extreme master blur layer on top 
        This merges the 4 heavy rotating orbs into a single unified wash of color.
      */}
      <div className="absolute inset-0 backdrop-blur-[100px] z-10 pointer-events-none" />

      {/* 
        Premium Elliptical Vignette 
        Using an ellipse instead of a circle ensures it stretches perfectly on ultra-wide desktop monitors 
        and tall mobile screens without looking like a spotlight.
      */}
      {/* Light Mode Vignette - Less aggressive so colors stay vibrant */}
      <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_60%,rgba(255,255,255,0.7)_100%)] pointer-events-none dark:hidden" />
      
      {/* Dark Mode Vignette */}
      <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_60%,rgba(0,0,0,0.95)_100%)] pointer-events-none hidden dark:block" />
      
      {/* 
        Cinematic Film Grain 
        Apple strictly uses heavy film grain to stop color banding in these deep gradients 
      */}
      <div className="absolute inset-0 z-30 opacity-[0.07] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  )
}

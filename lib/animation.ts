import { gsap, ScrollTrigger } from './gsap'

// Animation presets for GSAP — reusable across components
export const animations = {
  fadeInUp: {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: "power2.out",
    force3D: true,
  },
  staggerText: {
    opacity: 0,
    y: 80,
    duration: 1,
    ease: "power4.out",
    stagger: 0.12,
    force3D: true,
  },
  scaleIn: {
    scale: 0.95,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    force3D: true,
  },
}

export const animationPresets = {
  cinematic: {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
  },
  minimal: {
    y: 40,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
  },
  dynamic: {
    scale: 0.9,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.7)',
  },
  apple: {
    y: 80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  },
}

export const scrollConfig = {
  start: 'top 80%',
  end: 'bottom 20%',
  toggleActions: 'play none none reverse',
}

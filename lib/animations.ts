import { gsap, ScrollTrigger } from './gsap'

// ===== - PRESETS =====
export const animationConfig = {
  stagger: 0.1,
  duration: 0.8,
  ease: 'power3.out',
}

export const revealVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export const staggerContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// ===== TEXT SPLIT - =====
export const textSplitVariants = {
  container: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
      },
    },
  },
  char: {
    initial: { opacity: 0, y: 50, rotateZ: -10 },
    animate: {
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: { duration: 0.5, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    },
  },
}

// ===== M- BUTTON =====
export const magneticButtonVariants = {
  initial: { scale: 1 },
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 10 },
}

// ===== P- & SCROLL =====
export function setupScrollReveal(element: HTMLElement) {
  if (!element) return
  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      end: 'top 20%',
      scrub: 1,
    },
    opacity: 1,
    y: 0,
    duration: 1,
  })
}

export function setupParallax(element: HTMLElement, speed: number = -0.5) {
  if (!element) return
  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top center',
      scrub: 1,
    },
    y: window.innerHeight * speed,
    ease: 'none',
  })
}

// ===== VIDEO SCRUBBING ON SCROLL =====
export function setupVideoScrub(videoElement: HTMLVideoElement) {
  if (!videoElement) return

  gsap.to(videoElement, {
    scrollTrigger: {
      trigger: videoElement.parentElement,
      start: 'top center',
      end: 'bottom center',
      scrub: 0.5,
      onUpdate: (self) => {
        const frame = videoElement.duration * self.getVelocity()
        videoElement.currentTime = Math.min(frame, videoElement.duration)
      },
    },
  })
}

// ===== TEXT CH- REVE- (GS-) =====
export function setupTextReveal(element: HTMLElement) {
  if (!element) return
  const text = element.innerText
  const chars = text.split('')

  element.innerText = ''
  chars.forEach((char) => {
    const span = document.createElement('span')
    span.textContent = char === ' ' ? '\u00A0' : char
    span.style.display = 'inline-block'
    span.style.opacity = '0'
    element.appendChild(span)
  })

  gsap.to(element.querySelectorAll('span'), {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.03,
    ease: 'back.out(2)',
  })
}

// ===== M- CURSOR EFFECT =====
export function setupMagneticButton(
  buttonElement: HTMLElement,
  strength: number = 0.3
) {
  if (!buttonElement) return

  const xTo = gsap.quickTo(buttonElement, 'x', {
    duration: 0.8,
    ease: 'elastic.out(1, 0.3)',
  })
  const yTo = gsap.quickTo(buttonElement, 'y', {
    duration: 0.8,
    ease: 'elastic.out(1, 0.3)',
  })

  buttonElement.addEventListener('mousemove', (e: MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = buttonElement.getBoundingClientRect()
    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)

    xTo(x * strength)
    yTo(y * strength)
  })

  buttonElement.addEventListener('mouseleave', () => {
    xTo(0)
    yTo(0)
  })
}

// ===== SCROLL-TRIGGERED TEXT - =====
export function setupScrollTriggerText(element: HTMLElement) {
  if (!element) return

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top 75%',
      toggleActions: 'play pause resume pause',
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
  })
}

// ===== PREMIUM SC- REVE- (-/Nike style) =====
export function setupScaleReveal(element: HTMLElement) {
  if (!element) return

  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    {
      scrollTrigger: {
        trigger: element,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
    }
  )
}

// ===== ST- REVE- (Items come in sequence) =====
export function setupStaggerReveal(container: HTMLElement) {
  if (!container) return

  const items = container.querySelectorAll('[data-stagger-item]')
  gsap.fromTo(
    items,
    { opacity: 0, y: 40 },
    {
      scrollTrigger: {
        trigger: container,
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      },
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'back.out(1.7)',
    }
  )
}

// ===== P- SC- (Background parallax with zoom) =====
export function setupParallaxScale(element: HTMLElement, intensity: number = 0.5) {
  if (!element) return

  gsap.to(element, {
    scrollTrigger: {
      trigger: element.parentElement,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
    scale: 1 + intensity * 0.1,
    y: window.innerHeight * intensity,
    ease: 'none',
  })
}

// ===== HORIZONT- SCROLL SECTION (--style) =====
export function setupHorizontalScroll(container: HTMLElement) {
  if (!container) return

  const items = container.querySelectorAll('[data-scroll-item]') as NodeListOf<HTMLElement>
  const totalScroll = items.length * window.innerWidth

  gsap.to(container, {
    scrollTrigger: {
      trigger: container,
      start: 'top center',
      end: `+=${totalScroll}`,
      scrub: 1,
      markers: false,
    },
    x: -totalScroll + window.innerWidth,
    ease: 'none',
  })
}

// ===== BLUR REVE- (Google-style smooth reveal) =====
export function setupBlurReveal(element: HTMLElement) {
  if (!element) return

  gsap.fromTo(
    element,
    { opacity: 0, filter: 'blur(20px)' },
    {
      scrollTrigger: {
        trigger: element,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power2.out',
    }
  )
}

// ===== PIN SECTION (Samsung-style sticky scroll) =====
export function setupPinSection(
  section: HTMLElement,
  duration: number = 3
) {
  if (!section) return

  gsap.to(section, {
    scrollTrigger: {
      trigger: section,
      start: 'top center',
      end: `+=${window.innerHeight * duration}`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
    },
  })
}

// ===== MORPHING - (Shape transforms) =====
export function setupMorphing(
  element: SVGPathElement,
  fromPath: string,
  toPath: string
) {
  if (!element) return

  gsap.fromTo(
    element,
    { attr: { d: fromPath } },
    {
      scrollTrigger: {
        trigger: element.closest('[data-morph-container]'),
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
      attr: { d: toPath },
      duration: 1.2,
      ease: 'back.inOut(1.7)',
    }
  )
}

// ===== NUMBER COUNTER WITH SCROLL =====
export function setupScrollCounter(
  element: HTMLElement,
  targetValue: number,
  duration: number = 2
) {
  if (!element) return

  const obj = { value: 0 }

  gsap.to(obj, {
    scrollTrigger: {
      trigger: element,
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
    value: targetValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value).toLocaleString()
    },
  })
}

// ===== GR- - =====
export function setupGradientScroll(element: HTMLElement) {
  if (!element) return

  let angle = 0
  gsap.to(
    { angle: 0 },
    {
      scrollTrigger: {
        trigger: element,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
      angle: 360,
      duration: 2,
      onUpdate: function () {
        element.style.backgroundImage = `conic-gradient(from ${this.targets()[0].angle}deg, #D4- #1a1a1a, #D4-)`
      },
    }
  )
}

// ===== TIMELINE SEQUENCE (- orchestration) =====
export function setupTimelineSequence(container: HTMLElement) {
  if (!container) return

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      markers: false,
    },
  })

  const items = container.querySelectorAll('[data-timeline-item]')
  
  items.forEach((item, index) => {
    tl.to(
      item,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      },
      index * 0.2 // Stagger timeline
    )
  })

  return tl
}

// ===== 3D C- TILT (Interactive depth) =====
export function setup3DCardTilt(element: HTMLElement) {
  if (!element) return

  element.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const rotateX = (e.clientY - centerY) * 0.05
    const rotateY = (e.clientX - centerX) * -0.05

    gsap.to(element, {
      rotationX: rotateX,
      rotationY: rotateY,
      transformPerspective: 1000,
      duration: 0.6,
      overwrite: 'auto',
    })
  })

  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
    })
  })
}

// ===== REVE- ON SCROLL WITH CLIP P- =====
export function setupClipPathReveal(element: HTMLElement) {
  if (!element) return

  gsap.fromTo(
    element,
    {
      clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
      opacity: 0,
    },
    {
      scrollTrigger: {
        trigger: element,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      opacity: 1,
      duration: 1,
      ease: 'power3.inOut',
    }
  )
}

// ===== PROGRESS B- - =====
export function setupProgressBar(element: HTMLElement, maxScroll: number = 3000) {
  if (!element) return

  gsap.fromTo(
    element,
    { scaleX: 0 },
    {
      scaleX: 1,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: `+=${maxScroll}`,
        scrub: 0.5,
        markers: false,
      },
      transformOrigin: '0% 50%',
      ease: 'none',
    }
  )
}

// ===== IM- ZOOM P- =====
export function setupImageZoomParallax(
  container: HTMLElement,
  zoomFactor: number = 1.5
) {
  if (!container) return

  const image = container.querySelector('img') as HTMLImageElement
  if (!image) return

  gsap.to(image, {
    scrollTrigger: {
      trigger: container,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
    },
    scale: zoomFactor,
    ease: 'none',
  })
}

// ===== ST- LIST - (Restaurant menu style) =====
export function setupStaggeredList(listContainer: HTMLElement) {
  if (!listContainer) return

  const items = listContainer.querySelectorAll('li, [data-list-item]')

  gsap.from(items, {
    scrollTrigger: {
      trigger: listContainer,
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: -50,
    duration: 0.8,
    stagger: {
      amount: 0.6,
      from: 'start',
    },
    ease: 'back.out(1.7)',
  })
}

// ===== COUNTER WITH - =====
export function setupCounter(
  element: HTMLElement,
  from: number = 0,
  to: number = 100,
  duration: number = 2
) {
  if (!element) return

  const obj = { value: from }

  gsap.to(obj, {
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
    value: to,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value).toLocaleString()
    },
  })
}

// ===== FLO- - (Continuous loop) =====
export function setupFloatingAnimation(element: HTMLElement, duration: number = 3) {
  if (!element) return

  gsap.to(element, {
    y: -20,
    duration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  })
}

// ===== ROT- ON SCROLL =====
export function setupRotateOnScroll(
  element: HTMLElement,
  maxRotation: number = 360
) {
  if (!element) return

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
    },
    rotation: maxRotation,
    ease: 'none',
  })
}

// ===== TEXT MORPHING EFFECT =====
export function setupTextMorphing(
  element: HTMLElement,
  texts: string[],
  duration: number = 2
) {
  if (!element) return

  let currentIndex = 0

  const animate = () => {
    gsap.to(element, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        currentIndex = (currentIndex + 1) % texts.length
        element.textContent = texts[currentIndex]
        gsap.to(element, { opacity: 1, duration: 0.3 })
      },
    })
  }

  gsap.to({}, { repeat: -1, repeatDelay: duration - 0.6, onRepeat: animate })
}

// ===== BOX SH- PULSE =====
export function setupShadowPulse(element: HTMLElement) {
  if (!element) return

  gsap.to(element, {
    boxShadow: '0 0 40px rgba(212, 175, 55, 0.5)',
    duration: 2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  })
}

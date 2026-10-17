"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ReactNode } from "react";

interface FadeSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeSection({ children, delay = 0, className = '' }: FadeSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Set initial state immediately to prevent FOUC
    gsap.set(ref.current, { opacity: 0, y: 18 });

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        delay,
        ease: "power2.out",
        force3D: true,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 95%",     // fires almost immediately on scroll into view
          toggleActions: "play none none none",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [delay]);

  return <section ref={ref} className={className}>{children}</section>;
}

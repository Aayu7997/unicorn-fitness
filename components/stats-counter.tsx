"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Users, TrendingUp, Clock } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}

const defaultStats: StatItem[] = [
  { label: "- Members", value: 15000, suffix: "+", icon: <Users className="w-6 h-6 text-accent" /> },
  { label: "Expert Trainers", value: 50, suffix: "+", icon: <Users className="w-6 h-6 text-accent" /> },
  { label: "Success Rate", value: 99, suffix: "%", icon: <TrendingUp className="w-6 h-6 text-accent" /> },
  { label: "Support", value: 24, suffix: "/7", icon: <Clock className="w-6 h-6 text-accent" /> },
];

export function StatsCounter({ stats = defaultStats }: { stats?: StatItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const countsRef = useRef<HTMLSpanElement[]>([]);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    let ctx: gsap.Context;

    // Delay initialization to allow React hydration and layout to settle
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // Unified GS--only entrance (replaces dual Framer Motion whileInView)
      const header = containerRef.current?.querySelector('.stats-header');
      if (header) {
        gsap.fromTo(header,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0,
            duration: 0.4,
            force3D: true,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 88%',
              once: true,
            },
          }
        );
      }

      // Card entrance with stagger
      if (cardsRef.current.length > 0) {
        gsap.fromTo(cardsRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.4,
            stagger: 0.07,
            force3D: true,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }

      // Counter animations
      countsRef.current.forEach((counter, index) => {
        const finalValue = stats[index].value;
        const counterObj = { value: 0 };
        
        gsap.to(counterObj, {
          value: finalValue,
          duration: 2.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            once: true,
          },
          onUpdate: function() {
            if (counter) {
              counter.textContent = Math.ceil(counterObj.value).toLocaleString('en-IN');
            }
          }
        });
      });

      // - progress rings
      const rings = document.querySelectorAll('.stat-ring-progress');
      rings.forEach((ring, i) => {
        gsap.fromTo(ring,
          { strokeDashoffset: 283 },
          {
            strokeDashoffset: 283 * (1 - (i === 2 ? stats[i].value / 100 : Math.min(stats[i].value / stats[0].value, 1))),
            duration: 2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              once: true,
            },
          }
        );
      });
      });
    });
    
    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, [stats]);

  return (
    <section
      ref={containerRef}
      className="py-24 px-6 md:px-12 relative overflow-hidden section-contained"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-accent/[0.03] to-background" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="stats-header text-center mb-16">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Our Impact
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">
            By The Numbers
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              ref={(el) => { if (el) cardsRef.current[index] = el; }}
              className="text-center relative group"
            >
              {/* Progress ring */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-border/50"
                  />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="url(#statGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset="283"
                    className="stat-ring-progress"
                  />
                  <defs>
                    <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="oklch(0.65 0.2 40)" />
                      <stop offset="100%" stopColor="oklch(0.55 0.15 60)" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {stat.icon}
                </div>
              </div>

              {/* Number */}
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                <span
                  ref={(el) => {
                    if (el) countsRef.current[index] = el;
                  }}
                >
                  0
                </span>
                <span className="text-accent">{stat.suffix}</span>
              </div>
              
              <p className="text-foreground/60 text-sm font-medium tracking-wide">{stat.label}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 bg-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

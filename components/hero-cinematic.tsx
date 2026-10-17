"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Link from "next/link";

export default function HeroCinematic() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.from(".hero-subtitle", {
        y: 60,
        opacity: 0,
        delay: 0.3,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".hero-buttons", {
        y: 40,
        opacity: 0,
        delay: 0.6,
        duration: 0.8,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center bg-linear-to-b from-background to-card/50 text-foreground overflow-hidden"
    >
      {/* Background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-5xl px-6">
        <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
          Elevate Your Potential
        </h1>

        <p className="hero-subtitle mt-6 text-lg md:text-xl text-foreground/70">
          World-class training. Elite performance. Real results.
        </p>

        <div className="hero-buttons mt-12 flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/membership">
            <button className="px-8 py-4 bg-accent text-background rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-accent/50 transition-all duration-300">
              Start Your Journey
            </button>
          </Link>
          <button className="px-8 py-4 border-2 border-accent/50 text-accent rounded-xl font-semibold hover:bg-accent/10 hover:border-accent transition-all duration-300">
            Schedule Tour
          </button>
        </div>
      </div>
    </section>
  );
}

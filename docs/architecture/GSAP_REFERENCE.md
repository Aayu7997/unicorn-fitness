STEP 1 — Install GSAP (Next.js)
npm install gsap

✅ STEP 2 — GSAP Setup (IMPORTANT)

Create a utility file:

/lib/gsap.ts
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

✅ STEP 3 — CINEMATIC HERO (APPLE-STYLE)
/components/Hero.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.from(".hero-subtitle", {
        y: 40,
        opacity: 0,
        delay: 0.3,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".hero-buttons", {
        y: 20,
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
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />

      <div className="relative z-10 text-center max-w-4xl px-6">
        <h1 className="hero-title text-6xl md:text-7xl font-bold tracking-tight">
          Elevate Your Potential
        </h1>

        <p className="hero-subtitle mt-6 text-lg text-gray-300">
          World-class training. Elite performance. Real results.
        </p>

        <div className="hero-buttons mt-10 flex justify-center gap-6">
          <button className="px-8 py-4 bg-orange-500 rounded-xl font-semibold hover:scale-105 transition">
            Start Your Journey
          </button>
          <button className="px-8 py-4 border border-white/40 rounded-xl hover:bg-white hover:text-black transition">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}

✅ STEP 4 — APPLE-STYLE SCROLL ANIMATIONS
/components/ScrollSection.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ScrollSection({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;

    gsap.fromTo(
      el,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
      }
    );
  }, []);

  return <div ref={ref}>{children}</div>;
}

✅ STEP 5 — PARALLAX IMAGE (APPLE FEEL)
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function ParallaxImage({ src }) {
  const imgRef = useRef(null);

  useEffect(() => {
    gsap.to(imgRef.current, {
      y: -80,
      scrollTrigger: {
        trigger: imgRef.current,
        start: "top bottom",
        scrub: true,
      },
    });
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      className="w-full rounded-xl"
      alt="parallax"
    />
  );
}

✅ STEP 6 — NUMBER COUNTER (GYM STATS)
useEffect(() => {
  gsap.from(".count", {
    innerText: 0,
    duration: 2,
    snap: { innerText: 1 },
    scrollTrigger: {
      trigger: ".count",
      start: "top 80%",
    },
  });
}, []);

<span className="count">15000</span>+

🎯 APPLE-STYLE ANIMATION RULES (VERY IMPORTANT)

✔ Use opacity + y-axis only
✔ Avoid scale spam
✔ Use power3.out
✔ Animate once, not repeat
✔ Use whitespace generously
✔ Keep transitions slow & smooth

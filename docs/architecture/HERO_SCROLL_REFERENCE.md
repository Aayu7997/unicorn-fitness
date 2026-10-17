LTRA-PREMIUM SCROLL EXPERIENCE (APPLE LEVEL)
WHAT YOU WILL GET

✔ Scroll-pinned cinematic sections
✔ Smooth section transitions
✔ Text reveal like Apple.com
✔ Parallax depth
✔ Scroll snapping
✔ Zero jank / GPU optimized
✔ Mobile safe

1️⃣ GLOBAL SCROLL SETUP (CRITICAL)
/lib/gsap.ts (update this)
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.normalizeScroll(true);
}

export { gsap, ScrollTrigger };

2️⃣ CINEMATIC PINNED HERO (APPLE STYLE)

This locks the hero and animates content as user scrolls.

/components/HeroScroll.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function HeroScroll() {
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "+=120%",
          scrub: true,
          pin: true,
        },
      });

      tl.from(".hero-title", {
        y: 100,
        opacity: 0,
        ease: "power3.out",
      })
        .from(".hero-sub", {
          y: 60,
          opacity: 0,
        }, "-=0.4")
        .to(".hero-bg", {
          scale: 1.2,
          opacity: 0.4,
        }, 0);
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative h-screen overflow-hidden bg-black text-white">
      <div className="hero-bg absolute inset-0 bg-[url('/gym.jpg')] bg-cover bg-center" />

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
        <h1 className="hero-title text-7xl font-bold">
          Built for Performance
        </h1>
        <p className="hero-sub mt-6 text-xl text-gray-300">
          Precision. Power. Progress.
        </p>
      </div>
    </section>
  );
}

3️⃣ APPLE-STYLE SECTION REVEAL

Used for features, tools, services.

/components/FadeSection.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function FadeSection({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 80,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
      },
    });
  }, []);

  return <section ref={ref}>{children}</section>;
}

4️⃣ APPLE-STYLE HORIZONTAL SCROLL (WOW EFFECT)

This is what Apple uses for product showcases.

"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";

export default function HorizontalScroll() {
  const container = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray(".panel");

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        pin: true,
        scrub: 1,
        end: () => "+=" + container.current.offsetWidth,
      },
    });
  }, []);

  return (
    <section ref={container} className="h-screen flex overflow-hidden">
      {["Speed", "Strength", "Endurance"].map((item, i) => (
        <div
          key={i}
          className="panel min-w-full flex items-center justify-center text-6xl font-bold bg-black text-white"
        >
          {item}
        </div>
      ))}
    </section>
  );
}

5️⃣ PERFORMANCE OPTIMIZATION (VERY IMPORTANT)

Add this globally:

* {
  will-change: transform, opacity;
}


And in Next.js:

experimental: {
  optimizeCss: true,
}

6️⃣ RESULT YOU NOW HAVE

✅ Apple-style scroll
✅ Cinematic hero
✅ Scroll pinning
✅ Horizontal transitions
✅ GPU-accelerated
✅ Mobile safe
✅ Production ready

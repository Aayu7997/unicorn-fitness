'use client';

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

let isInitialized = false;

function initializeGSAP() {
  if (isInitialized || typeof window === "undefined") return;
  
  try {
    gsap.registerPlugin(ScrollTrigger);
    isInitialized = true;
  } catch (e) {
    // Silently fail if initialization fails
  }
}

export { gsap, ScrollTrigger };

// Initialize on first import in browser environment
if (typeof window !== "undefined") {
  initializeGSAP();
}

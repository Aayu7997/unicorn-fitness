"use client";

import { CaseStudyFlipStack, type CaseStudyFlipItem } from "@/components/ui/case-study-flip-stack";

// Dynamic panels generator
const getItems = (attributes?: any): CaseStudyFlipItem[] => [
  { 
    eyebrow: "Program",
    title: attributes?.speed?.title || "Speed", 
    description: attributes?.speed?.description || "Quick, efficient workouts designed for maximum impact in minimum time",
    image: attributes?.speed?.mediaUrl || "/images/cardio-zone.jpg",
    imageAlt: "Speed Training",
    background: "#a94808", // Orange
    foreground: "#fff7ed",
  },
  { 
    eyebrow: "Program",
    title: attributes?.strength?.title || "Strength", 
    description: attributes?.strength?.description || "Build powerful muscles with our world-class equipment and expert guidance",
    image: attributes?.strength?.mediaUrl || "/images/training-area.jpg",
    imageAlt: "Strength Training",
    background: "#3322a8", // Blue
    foreground: "#f3f1ff",
  },
  { 
    eyebrow: "Program",
    title: attributes?.endurance?.title || "Endurance", 
    description: attributes?.endurance?.description || "Last longer, push harder — unlock your true potential",
    image: attributes?.endurance?.mediaUrl || "/images/yoga-studio.jpg",
    imageAlt: "Endurance Training",
    background: "#067b8f", // Teal
    foreground: "#ecfeff",
  },
];

export function HorizontalScroll({ attributes }: { attributes?: any }) {
  const items = getItems(attributes);
  
  return (
    <CaseStudyFlipStack 
      items={items} 
      heading="Our Core Focus." 
      hint={null} 
      endLabel="Join Us Today." 
    />
  );
}

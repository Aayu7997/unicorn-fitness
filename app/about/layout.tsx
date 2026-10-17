import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Our Story & Facilities',
  description: 'Learn about Unicorn Fitness Club. Founded by Lokesh Meena in Jaipur. Discover our world-class facilities, expert trainers, and our mission to transform lives.',
  alternates: {
    canonical: 'https://unicornfitnessclub.com/about',
  },
  openGraph: {
    title: 'About Unicorn Fitness Club — Best Gym in Jaipur',
    description: 'Discover the story behind Jaipur\'s top fitness club, our expert trainers, and premium facilities.',
    url: 'https://unicornfitnessclub.com/about',
    images: [{ url: '/images/training-area.jpg', width: 1200, height: 630, alt: 'Unicorn Fitness Club Facilities' }],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Unicorn Fitness Club",
    "description": "Information about Unicorn Fitness Club, its founders, and facilities in Jaipur.",
    "publisher": {
      "@type": "Organization",
      "name": "Unicorn Fitness Club"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}

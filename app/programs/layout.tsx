import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fitness Programs & Classes',
  description: 'Explore our diverse range of fitness programs including Weight Training, HIIT, Yoga, CrossFit, Zumba, and Personal Training at Unicorn Fitness Club.',
  alternates: {
    canonical: 'https://unicornfitnessclub.com/programs',
  },
  openGraph: {
    title: 'Fitness Programs at Unicorn Fitness Club',
    description: 'Transform your body with our specialized training programs and expert coaching.',
    url: 'https://unicornfitnessclub.com/programs',
    images: [{ url: '/images/program-strength.jpg', width: 1200, height: 630, alt: 'Strength Training Program' }],
  },
}

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Course",
          "name": "Weight Training",
          "description": "Build strength and muscle mass with scientifically designed weight training."
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Course",
          "name": "HIIT Cardio",
          "description": "High-intensity interval training for maximum calorie burn."
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Course",
          "name": "Yoga & Flexibility",
          "description": "Improve flexibility, balance, and mental clarity."
        }
      }
    ]
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

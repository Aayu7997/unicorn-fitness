import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Location & Hours',
  description: 'Get in touch with Unicorn Fitness Club. Located at Apex Tower, Mahal Road, Jaipur. Find our contact details, operating hours, and location map.',
  alternates: {
    canonical: 'https://unicornfitnessclub.com/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Unicorn Fitness Club",
    "mainEntity": {
      "@type": "ExerciseGym",
      "name": "Unicorn Fitness Club",
      "telephone": "+918764360662",
      "email": "Unicornfitness3111@gmail.com",
      "address": {
        "@type": "Postal-",
        "street-": "- Tower, Mahal Road, Near Jagatpura Flyover",
        "addressLocality": "Jaipur",
        "addressRegion": "Rajasthan",
        "postalCode": "302017",
        "addressCountry": "IN"
      }
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

import { indianFaqs, indianMembershipPlans, indianPrograms, indianTestimonials, indianTrainers } from './indian-data';


export interface SiteContent {
  brand: {
    name: string
    owner: string
    phone: string
    email: string
    address: string
  }
  home: {
    about: {
      eyebrow: string
      title: string
      description: string
      locationText: string
      image: string
      highlights: Array<{ title: string; description: string }>
    }
    whyChooseUs: {
      eyebrow: string
      title: string
      features: Array<{ title: string; description: string; image: string }>
    }
    facilities: {
      eyebrow: string
      title: string
      firstImage: string
      secondImage: string
      firstColumn: Array<{ title: string; description: string }>
      secondColumn: Array<{ title: string; description: string }>
    }
    cta: {
      image: string
      title: string
      description: string
      primaryButtonText: string
      secondaryButtonText: string
      ownerLine: string
    }
  }
  pricing: typeof indianMembershipPlans
  trainers: typeof indianTrainers
  faqs: typeof indianFaqs
  programs: typeof indianPrograms
  testimonials: typeof indianTestimonials
}

export const defaultSiteContent: SiteContent = {
  brand: {
    name: 'Unicorn Fitness Club',
    owner: 'Lokesh Meena',
    phone: '087643 60662',
    email: 'info@unicornfitness.com',
    address: '- Tower, Mahal Road, Near Jagatpura Flyover, Jaipur, Rajasthan 302017',
  },
  home: {
    about: {
      eyebrow: '- Unicorn Fitness Club',
      title: 'Premier Fitness Destination in Jaipur',
      description:
        "Owned by Lokesh Meena, Unicorn Fitness Club is Jaipur's premium fitness destination. We offer world-class facilities, certified trainers, and personalized programs designed to help you achieve your fitness goals.",
      locationText: 'Located at - Tower, Mahal Road, Near Jagatpura Flyover, Jaipur, Rajasthan 302017',
      image: '/images/training-area.jpg',
      highlights: [
        { title: 'Certified Trainers', description: 'Expert coaching team' },
        { title: 'Premium Equipment', description: 'Latest fitness gear' },
      ],
    },
    whyChooseUs: {
      eyebrow: 'Why Choose Us',
      title: 'Premium Features for Your Success',
      features: [
        {
          title: 'Group Classes',
          description: 'Join energizing group sessions led by expert instructors',
          image: '/images/group-class.jpg',
        },
        {
          title: 'Personal Training',
          description: 'One-on-one coaching tailored to your specific goals',
          image: '/images/trainer-1.jpg',
        },
        {
          title: 'Modern Facilities',
          description: 'State-of-the-art equipment and pristine workout spaces',
          image: '/images/cardio-zone.jpg',
        },
      ],
    },
    facilities: {
      eyebrow: 'Our Facilities',
      title: 'World-Class Training Environment',
      firstImage: '/images/yoga-studio.jpg',
      secondImage: '/images/cardio-zone.jpg',
      firstColumn: [
        { title: '24/7 -', description: 'Train on your schedule with round-the-clock gym access' },
        { title: 'Premium Equipment', description: 'Latest Technogym and Life Fitness equipment' },
        { title: 'Recovery Zone', description: 'Dedicated space for stretching and recovery' },
      ],
      secondColumn: [
        { title: 'Expert Coaching', description: 'Certified trainers with years of experience' },
        { title: 'Progress Tracking', description: '- metrics and performance analytics' },
        { title: 'Community', description: 'Join a supportive fitness community' },
      ],
    },
    cta: {
      image: '/images/whatsapp-image-2025-05-24-at-19.png',
      title: 'Ready to Transform Your Life?',
      description:
        'Join over 15,000 members at Unicorn Fitness Club and start your journey to a healthier, stronger you. Limited spots available.',
      primaryButtonText: 'Start Free Trial',
      secondaryButtonText: 'Call: 087643 60662',
      ownerLine: 'Owner: Lokesh Meena | - Tower, Mahal Road, Jaipur',
    },
  },
  pricing: indianMembershipPlans,
  trainers: indianTrainers,
  faqs: indianFaqs,
  programs: indianPrograms,
  testimonials: indianTestimonials,
}

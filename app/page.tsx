import { prisma } from '@/lib/prisma'
import { 
  indianPrograms, 
  indianTrainers, 
  indianTestimonials, 
  indianMembershipPlans, 
  indianFaqs, 
} from '@/lib/indian-data'
import { HeroPinned } from '@/components/hero-pinned'
import { StatsCounter } from '@/components/stats-counter'
import { FadeSection } from '@/components/fade-section'
import { HorizontalScroll } from '@/components/horizontal-scroll'
import { DepthSection } from '@/components/depth-section'
import { ParallaxImage } from '@/components/parallax-image'
import { PricingSection } from '@/components/pricing-section'
import { TeamSection } from '@/components/team-section'
import { FAQSection } from '@/components/faq-section'
import { TextMarquee } from '@/components/text-marquee'
import { ProgramsSection } from '@/components/programs-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { GallerySection } from '@/components/gallery-section'
import { Dumbbell, Users, Clock, Zap, Target, Heart, TrendingUp , Award, Trophy } from 'lucide-react'

export default async function HomePage() {
  // Fetch data from Prisma with fallback to indian-data
  const dbPrograms = await prisma.program.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    take: 3
  });
  const programs = dbPrograms.length > 0 ? dbPrograms : indianPrograms;

  const dbTrainers = await prisma.trainer.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });
  const trainers = dbTrainers.length > 0 ? dbTrainers : indianTrainers;

  const dbTestimonials = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: { createdAt: 'desc' }
  });
  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : indianTestimonials;

  const siteContentRecord = await prisma.siteContent.findUnique({
    where: { key: 'main' }
  });
  const siteContent = siteContentRecord ? (siteContentRecord.content as any) : null;

  const dbPlans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });
  const plans = dbPlans.length > 0 ? dbPlans : indianMembershipPlans;

  const dbFaqs = await prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });
  const faqs = dbFaqs.length > 0 ? dbFaqs : indianFaqs;

  const galleryImages = await prisma.galleryImage.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    take: 12
  });

  return (
    <>
      
      <main className="bg-background text-foreground">
        {/* Hero Section with Apple-style Pinned Scroll */}
        <HeroPinned heroData={siteContent?.hero} />

        {/* Stats Counter with GSAP Animation */}
        <StatsCounter stats={[
          { label: "Members", value: parseInt((siteContent?.stats?.members || "15000").replace(/\D/g,'')) || 15000, suffix: "+", icon: <Users className="w-6 h-6 text-accent" /> },
          { label: "Expert Trainers", value: parseInt((siteContent?.stats?.trainers || "15").replace(/\D/g,'')) || 15, suffix: "+", icon: <Users className="w-6 h-6 text-accent" /> },
          { label: "Programs", value: parseInt((siteContent?.stats?.programs || "20").replace(/\D/g,'')) || 20, suffix: "+", icon: <TrendingUp className="w-6 h-6 text-accent" /> },
          { label: "Years Experience", value: parseInt((siteContent?.stats?.years || "5").replace(/\D/g,'')) || 5, suffix: "+", icon: <Clock className="w-6 h-6 text-accent" /> },
        ]} />

        {/* Text Marquee â€” scroll-velocity driven */}
        <TextMarquee />

        {/* About Section with Parallax */}
        <FadeSection className="py-32 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
                About Unicorn Fitness Club
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                {siteContent?.about?.title || 'Premier Fitness Destination in Jaipur'}
              </h2>
              <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
                {siteContent?.about?.description || `Owned by Lokesh Meena, Unicorn Fitness Club is Jaipur's premium fitness destination. 
                We offer world-class facilities, certified trainers, and personalized programs designed 
                to help you achieve your fitness goals.`}
              </p>
              <p className="text-foreground/40 mb-8 text-sm">
                {siteContent?.about?.address || 'Located at Apex Tower, Mahal Road, Near Jagatpura Flyover, Jaipur, Rajasthan 302017'}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-0.5 text-sm">Certified Trainers</h3>
                    <p className="text-xs text-foreground/50">Expert coaching team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-0.5 text-sm">Premium Equipment</h3>
                    <p className="text-xs text-foreground/50">Latest fitness gear</p>
                  </div>
                </div>
              </div>
            </div>
            <ParallaxImage
              src="/images/training-area.jpg"
              alt="Training Area"
              speed={-25}
              className="rounded-2xl h-125"
            />
          </div>
        </FadeSection>

        {/* Horizontal Scroll Apple-style */}
        <HorizontalScroll attributes={siteContent?.attributes} />

        {/* 3D Depth Section Apple Vision Style */}
        <DepthSection
          items={['Power', 'Precision', 'Performance']}
          className="bg-linear-to-b from-background to-card/50"
        />

        {/* Why Choose Us */}
        <FadeSection className="py-32 px-6 sm:px-8 lg:px-12 bg-card/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
                Why Choose Us
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Premium Features for Your Success
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: 'Group Classes',
                  description: 'Join energizing group sessions led by expert instructors',
                  image: '/images/group-class.jpg',
                },
                {
                  icon: Target,
                  title: 'Personal Training',
                  description: 'One-on-one coaching tailored to your specific goals',
                  image: '/images/trainer-1.jpg',
                },
                {
                  icon: Zap,
                  title: 'Modern Facilities',
                  description: 'State-of-the-art equipment and pristine workout spaces',
                  image: '/images/cardio-zone.jpg',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  <div className="p-6">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* Facilities Showcase */}
        <FadeSection className="py-32 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
                Our Facilities
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                World-Class Training Environment
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
              <ParallaxImage src="/images/yoga-studio.jpg" alt="Yoga Studio" speed={-25} className="h-100 rounded-2xl" />
              <div className="space-y-6">
                {[
                  { icon: Clock, title: '24/7 Access', desc: 'Train on your schedule with round-the-clock gym access' },
                  { icon: Dumbbell, title: 'Premium Equipment', desc: 'Latest Technogym and Life Fitness equipment' },
                  { icon: Heart, title: 'Recovery Zone', desc: 'Dedicated space for stretching and recovery' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="text-foreground/60 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 order-2 md:order-1">
                {[
                  { icon: Trophy, title: 'Expert Coaching', desc: 'Certified trainers with years of experience' },
                  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Detailed metrics and performance analytics' },
                  { icon: Users, title: 'Community', desc: 'Join a supportive fitness community' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="text-foreground/60 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <ParallaxImage src="/images/cardio-zone.jpg" alt="Cardio Zone" speed={-25} className="h-100 rounded-2xl order-1 md:order-2" />
            </div>
          </div>
        </FadeSection>

        {/* Announcement Marquee */}
        <TextMarquee texts={['CARDIO', 'YOGA', 'STRENGTH', 'HIIT', 'FLEXIBILITY', 'WELLNESS']} speed={0.7} />

        {/* Programs Section */}
        <ProgramsSection programs={programs} />

        {/* Pricing Section */}
        <PricingSection plans={plans} />

        {/* Team Section */}
        <TeamSection trainers={trainers} />

        {/* Testimonials Section */}
        <TestimonialsSection testimonials={testimonials} />

        {/* Gallery Section */}
        <GallerySection images={galleryImages} />

        {/* F- Section */}
        <FAQSection faqs={faqs} />

        {/* Final CTA */}
        <FadeSection className="py-32 px-6 sm:px-8 lg:px-12 bg-linear-to-b from-background to-accent/5">
          <div className="max-w-4xl mx-auto text-center">
            <img
              src="/images/unicorn-logo.png"
              alt="Unicorn Fitness Club"
              className="w-16 h-16 mx-auto mb-8 opacity-80"
              loading="lazy"
              decoding="async"
            />
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
              Ready to Transform Your Life?
            </h2>
            <p className="text-base text-foreground/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              {siteContent?.about?.description ? (siteContent.about.description.length > 100 ? siteContent.about.description.slice(0, 100) + "..." : siteContent.about.description) : "Join over 15,000 members at Unicorn Fitness Club and start your journey to a healthier, stronger you."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-linear-to-r from-orange-500 to-amber-500 text-black font-bold rounded-xl hover:from-orange-400 hover:to-amber-400 transition-all hover:scale-105 shadow-lg shadow-orange-500/20">
                {siteContent?.hero?.cta || 'Start Free Trial'}
              </button>
              <a href={`tel:${(siteContent?.about?.phone || '08764360662').replace(/\s+/g, '')}`} className="px-10 py-4 border border-accent/30 rounded-xl font-bold hover:bg-accent/10 hover:border-accent/50 transition-all">
                Call: {siteContent?.about?.phone || '087643 60662'}
              </a>
            </div>
            <p className="mt-8 text-xs text-foreground/40">
              {siteContent?.about?.address || 'Owner: Lokesh Meena | Apex Tower, Mahal Road, Jaipur'}
            </p>
          </div>
        </FadeSection>
      </main>
      
    </>
  )
}


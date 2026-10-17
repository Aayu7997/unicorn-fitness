import { prisma } from '@/lib/prisma'
import { indianMembershipPlans, indianFaqs } from '@/lib/indian-data'
import { PricingSection } from '@/components/pricing-section'
import { FAQSection } from '@/components/faq-section'
import { KineticText } from '@/components/ui/kinetic-text'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Membership Plans | UFC GYM',
  description: 'Flexible fitness membership plans for all levels at Unicorn Fitness Club Jaipur.',
}

export default async function MembershipPage() {
  const dbPlans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });
  // Transform plans if needed, PricingSection takes array of plans
  const plans = dbPlans.length > 0 ? dbPlans : indianMembershipPlans;

  const dbFaqs = await prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });
  const faqs = dbFaqs.length > 0 ? dbFaqs : indianFaqs;

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-12 overflow-hidden">
      
      {/* Decorative magical background effect */}
      <div className="absolute top-0 inset-x-0 h-[60vh] bg-linear-to-b from-accent/10 via-accent/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[100px] pointer-events-none mix-blend-screen" />
      
      <div className="max-w-7xl mx-auto px-6 mt-8 relative z-10 text-center flex flex-col items-center justify-center">
        <KineticText 
          text="Membership Plans" 
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-foreground tracking-tight"
        />
        <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mt-4 font-medium">
          Experience state-of-the-art equipment, expert trainers, and a community that pushes you to be your best.
        </p>
      </div>

      <div className="-mt-16">
        <PricingSection plans={plans} />
      </div>

      <div className="mt-8">
        <FAQSection faqs={faqs} />
      </div>
    </main>
  )
}

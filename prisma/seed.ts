import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database...')

  // ─── - User ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('-@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'unicornfitness3111@gmail.com' },
    update: { passwordHash: adminHash, role: 'admin', name: 'Lokesh Meena' },
    create: {
      email: 'unicornfitness3111@gmail.com',
      name: 'Lokesh Meena',
      passwordHash: adminHash,
      role: 'admin',
    },
  })
  console.log(`✅ -: ${admin.email}`)

  // ─── Plans ─────────────────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Basic',
      price: 2999,
      period: 'month',
      description: 'Perfect for beginners',
      features: ['Full Gym -', 'Locker Room -', 'Cardio Equipment', 'Free Weights -', '1 Month Validity'],
      popular: false,
      sortOrder: 0,
    },
    {
      name: 'Pro',
      price: 5999,
      period: 'month',
      description: 'Most popular choice',
      features: ['Everything in Basic', 'Group Classes -', '2 PT Sessions/month', 'Nutrition Guidance', 'Body -', '3 Month Validity'],
      popular: true,
      sortOrder: 1,
    },
    {
      name: 'Elite',
      price: 9999,
      period: 'month',
      description: 'Maximum transformation',
      features: ['Everything in Pro', 'Unlimited PT Sessions', 'Custom Meal Plan', 'Priority Booking', 'Progress Tracking', '6 Month Validity'],
      popular: false,
      sortOrder: 2,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: `plan-${plan.name.toLowerCase()}` },
      update: plan,
      create: { id: `plan-${plan.name.toLowerCase()}`, ...plan },
    })
  }
  console.log(`✅ Plans: ${plans.length} seeded`)

  // ─── Programs ──────────────────────────────────────────────────────────────
  const programs = [
    { name: 'Weight Training', slug: 'weight-training', description: 'Build strength and muscle mass with our scientifically designed weight training program. Perfect for all fitness levels.', duration: 'Ongoing', level: '- levels', trainer: 'Lokesh Meena', price: 0, benefits: ['Increased muscle mass', 'Improved bone density', 'Boosted metabolism', 'Better posture'], sortOrder: 0, imageUrl: '/images/program-strength.jpg' },
    { name: 'HIIT Cardio', slug: 'hiit-cardio', description: 'High-intensity interval training that burns maximum calories and improves cardiovascular health in minimum time.', duration: '45 min/session', level: 'Intermediate', trainer: 'Priya Sharma', price: 0, benefits: ['Maximum calorie burn', 'Improved cardiovascular health', 'Increased endurance', 'Fat loss'], sortOrder: 1, imageUrl: '/images/program-cardio.jpg' },
    { name: 'Yoga & Flexibility', slug: 'yoga-flexibility', description: 'Improve flexibility, balance, and mental clarity with our comprehensive yoga program led by certified instructors.', duration: '60 min/session', level: 'Beginner', trainer: '- Verma', price: 0, benefits: ['Enhanced flexibility', 'Stress reduction', 'Better balance', 'Mental clarity'], sortOrder: 2, imageUrl: '/images/program-yoga.jpg' },
    { name: 'CrossFit', slug: 'crossfit', description: 'Functional movements performed at high intensity to build total body fitness and endurance.', duration: '60 min/session', level: 'Advanced', trainer: 'Rahul Singh', price: 0, benefits: ['Full-body conditioning', 'Improved agility', 'Community driven', 'Measurable results'], sortOrder: 3, imageUrl: '/images/training-area.jpg' },
    { name: 'Zumba Dance', slug: 'zumba-dance', description: 'Fun, energetic dance fitness classes that feel like a party while delivering serious fitness results.', duration: '60 min/session', level: '- levels', trainer: 'Priya Sharma', price: 0, benefits: ['Full-body workout', 'Coordination improvement', 'Mood enhancement', 'Calorie burning'], sortOrder: 4, imageUrl: '/images/group-class.jpg' },
    { name: 'Personal Training', slug: 'personal-training', description: '1-on-1 sessions with our certified trainers for personalized attention and accelerated results.', duration: '60 min/session', level: '- levels', trainer: 'Lokesh Meena', price: 0, benefits: ['Personalized workout plan', 'Direct feedback', 'Faster results', 'Injury prevention'], sortOrder: 5, imageUrl: '/images/trainer-1.jpg' },
  ]

  for (const program of programs) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      update: program,
      create: program,
    })
  }
  console.log(`✅ Programs: ${programs.length} seeded`)

  // ─── Trainers ──────────────────────────────────────────────────────────────
  const trainers = [
    { name: 'Lokesh Meena', role: 'Head Trainer & Owner', specialty: 'Strength Training & Body Transformation', experience: '8+ Years', bio: 'Certified personal trainer and gym owner with expertise in strength training, muscle building, and body transformation. Passionate about helping members achieve their fitness goals.', sortOrder: 0, imageUrl: '/images/trainer-1.jpg' },
    { name: 'Priya Sharma', role: 'Group Fitness Instructor', specialty: 'HIIT, Zumba & Cardio', experience: '5+ Years', bio: 'Energetic and motivating group fitness instructor specializing in high-intensity interval training and dance fitness. Creates a fun atmosphere while delivering serious results.', sortOrder: 1, imageUrl: '/images/trainer-2.jpg' },
    { name: '- Verma', role: 'Yoga & Wellness Instructor', specialty: 'Hatha Yoga & Meditation', experience: '7+ Years', bio: 'Certified yoga instructor trained in Hatha and Vinyasa yoga. Focuses on holistic well-being, flexibility, and mental health through mindful movement.', sortOrder: 2, imageUrl: '/images/trainer-3.jpg' },
    { name: 'Rahul Singh', role: 'CrossFit Coach', specialty: 'Functional Fitness & -', experience: '6+ Years', bio: 'CrossFit Level 2 certified coach with a background in athletics. Specializes in functional movement patterns and high-performance training.', sortOrder: 3, imageUrl: '/images/trainer-4.jpg' },
  ]

  for (const trainer of trainers) {
    const existing = await prisma.trainer.findFirst({ where: { name: trainer.name } })
    if (!existing) await prisma.trainer.create({ data: trainer })
  }
  console.log(`✅ Trainers: ${trainers.length} seeded`)

  // ─── F- ──────────────────────────────────────────────────────────────────
  const faqs = [
    { question: 'What are the gym timings?', answer: 'We are open Monday to Saturday from 5:30 - to 10:00 PM, and Sunday from 7:00 - to 8:00 PM.', sortOrder: 0 },
    { question: 'Do you offer a free trial?', answer: 'Yes! We offer a 1-day free trial pass for new members. Visit us with a valid ID to claim your free trial.', sortOrder: 1 },
    { question: 'What facilities are available?', answer: 'We have a fully equipped weight training area, cardio zone, group fitness studio, yoga room, locker rooms with showers, and a juice bar.', sortOrder: 2 },
    { question: '- personal training sessions available?', answer: 'Yes, we offer 1-on-1 personal training sessions with our certified trainers. Sessions can be booked in packages for better value.', sortOrder: 3 },
    { question: 'What is the membership cancellation policy?', answer: 'Memberships can be cancelled with 30 days written notice. Refunds are provided for unused months on annual memberships.', sortOrder: 4 },
    { question: 'Do you have parking facilities?', answer: 'Yes, we have free parking available for all members in the UFC Tower complex.', sortOrder: 5 },
    { question: 'Can I freeze my membership?', answer: 'Yes, memberships can be frozen for up to 30 days per year due to medical reasons or travel with valid documentation.', sortOrder: 6 },
    { question: 'Is there a joining fee?', answer: 'No, there is no separate joining fee. You only pay the membership fee for your chosen plan.', sortOrder: 7 },
  ]

  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i]
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } })
    if (!existing) await prisma.fAQ.create({ data: faq })
  }
  console.log(`✅ FAQ: ${faqs.length} seeded`)

  // ─── Testimonials ──────────────────────────────────────────────────────────
  const testimonials = [
    { name: 'Rahul Gupta', role: 'Software Engineer', location: 'Jaipur', transformation: 'Lost 18 kg in 4 months', content: 'Unicorn Fitness Club completely changed my life. The trainers are incredibly supportive and the environment is motivating. Lost 18 kg in just 4 months!', rating: 5, approved: true, imageUrl: '/images/testimonial-1.jpg' },
    { name: 'Priya Jain', role: 'Teacher', location: 'Jaipur', transformation: 'Gained 8 kg muscle mass', content: 'As a working woman, I needed a gym that fits my schedule. The flexible timings and professional trainers at Unicorn Fitness made it possible. Highly recommend!', rating: 5, approved: true, imageUrl: '/images/testimonial-2.jpg' },
    { name: 'Ravi Sharma', role: 'Businessman', location: 'Jaipur', transformation: 'Improved fitness level by 200%', content: 'The personal training sessions here are world-class. Lokesh sir\'s expertise and dedication to each member is unmatched. Best gym in Jaipur!', rating: 5, approved: true, imageUrl: '/images/testimonial-3.jpg' },
    { name: 'Sneha Patel', role: 'Student', location: 'Jaipur', transformation: 'Reduced body fat by 15%', content: 'Started as a complete beginner and now I\'m doing advanced workouts. The trainers here genuinely care about your progress. 5 stars!', rating: 5, approved: true, imageUrl: '/images/testimonial-1.jpg' },
    { name: 'Vijay Kumar', role: 'Government Officer', location: 'Jaipur', transformation: 'Reversed pre-diabetes condition', content: 'The nutrition guidance combined with the training program helped me reverse my pre-diabetes condition. This gym is more than just a workout place.', rating: 5, approved: true, imageUrl: '/images/testimonial-2.jpg' },
    { name: 'Rahul Singh', role: 'Doctor', location: 'Jaipur', transformation: 'Marathon ready in 6 months', content: 'The HIIT and cardio programs prepared me for my first marathon. The coaches are extremely knowledgeable. Best investment in my health!', rating: 5, approved: true, imageUrl: '/images/testimonial-3.jpg' },
  ]

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } })
    if (!existing) await prisma.testimonial.create({ data: t })
  }
  console.log(`✅ Testimonials: ${testimonials.length} seeded`)

  // ─── Site Content ──────────────────────────────────────────────────────────
  await prisma.siteContent.upsert({
    where: { key: 'main' },
    update: {},
    create: {
      key: 'main',
      content: {
        hero: {
          headline: 'Transform Your Life at Unicorn Fitness Club',
          subheadline: "Jaipur's Premier Fitness Destination — Where Results Happen",
          cta: 'Start Your Journey',
        },
        about: {
          title: '- Unicorn Fitness Club',
          description: 'Founded by Lokesh Meena, Unicorn Fitness Club has been transforming lives in Jaipur since 2019. We believe that fitness is not just about physical transformation—it\'s about building confidence, discipline, and a healthier lifestyle.',
          address: 'UFC Tower, Mahal Road, Near Jagatpura Flyover, Jaipur, Rajasthan — 302017',
          phone: '087643 60662',
          email: 'Unicornfitness3111@gmail.com',
        },
        stats: {
          members: '500+',
          trainers: '15+',
          programs: '20+',
          years: '5+',
        },
        footer: {
          description: "Jaipur's Premier Fitness Destination",
        },
      },
    },
  })
  console.log('✅ Site content seeded')

  console.log('\n🎉 Seed complete!')
  console.log('\n📧 - Login:')
  console.log('   Email: Unicornfitness3111@gmail.com')
  console.log('   Password: -@123')
  console.log('\n⚠️  IMPORT-: Change the admin password after first login!')
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

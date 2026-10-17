'use client'

import { motion } from 'framer-motion'
import { Trophy, Dumbbell, Target, PersonStanding, Heart, Users } from 'lucide-react'

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  }

  return (
    <main className="min-h-screen bg-background">
      

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-accent/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-foreground mb-6"
          >
            <span className="text-accent">Unicorn Fitness Club</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-foreground/70"
          >
            Premier fitness destination in Jaipur - Fit Life, Healthy Life
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div {...fadeInUp}>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-foreground/70 mb-4">
                Founded by Lokesh Meena, Unicorn Fitness Club was born from a vision to create a premium fitness experience in Jaipur. Located at Apex Tower, Mahal Road, near Jagatpura Flyover, we have become the leading fitness destination in the city.
              </p>
              <p className="text-foreground/70 mb-4">
                Our state-of-the-art facility at Jagatpura features world-class equipment, dedicated cardio and strength zones, group class studios, yoga spaces, and certified expert trainers committed to your transformation.
              </p>
              <p className="text-foreground/70">
                With over 15,000 successful member transformations, we continue to set new standards in fitness excellence, combining proven training methods with modern science and personalized coaching.
              </p>
            </motion.div>

            {/* Visual */}
            <motion.div
              {...fadeInUp}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-border/50 group"
            >
              <img 
                src="/images/founder.jpeg" 
                alt="Founder of Unicorn Fitness Club" 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-xl">Lokesh Meena</p>
                <p className="text-white/80 text-sm">Founder & Head Coach</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-background rounded-lg border border-border"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-foreground/70">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* - */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-foreground">
            By The Numbers
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-accent mb-2">
                  {achievement.number}
                </div>
                <p className="text-foreground/70 text-sm">
                  {achievement.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            World-Class Facilities
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {facilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="text-4xl flex-shrink-0">{facility.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{facility.name}</h3>
                  <p className="opacity-80 text-sm">{facility.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
    </main>
  )
}

const values = [
  {
    icon: <Trophy className="w-12 h-12 text-accent" />,
    title: 'Excellence',
    description: 'State-of-the-art equipment and certified trainers delivering world-class fitness experiences in Jaipur.',
  },
  {
    icon: <Dumbbell className="w-12 h-12 text-accent" />,
    title: 'Transformation',
    description: 'Over 15,000 successful transformations through personalized training and dedicated support.',
  },
  {
    icon: <Target className="w-12 h-12 text-accent" />,
    title: 'Results',
    description: 'Proven methodologies and expert guidance ensuring you achieve your fitness goals effectively.',
  },
]

const achievements = [
  { number: '15K+', label: 'Transformations' },
  { number: '20+', label: 'Expert Trainers' },
  { number: '98%', label: 'Success Rate' },
  { number: '24/7', label: '- -' },
]

const facilities = [
  {
    icon: <Dumbbell className="w-10 h-10 text-accent" />,
    name: 'Strength Training Zone',
    description: 'Premium free weights, power racks, and resistance machines for serious strength building.',
  },
  {
    icon: <Target className="w-10 h-10 text-accent" />,
    name: 'Cardio Equipment Zone',
    description: 'Latest treadmills, ellipticals, and bikes with entertainment systems and heart rate monitoring.',
  },
  {
    icon: <Heart className="w-10 h-10 text-accent" />,
    name: 'Group Class Studios',
    description: 'Spacious studios for yoga, Zumba, aerobics, and specialized group fitness programs.',
  },
  {
    icon: <PersonStanding className="w-10 h-10 text-accent" />,
    name: 'Functional Training',
    description: 'Battle ropes, TRX, kettlebells, and agility equipment for dynamic workouts.',
  },
  {
    icon: <Users className="w-10 h-10 text-accent" />,
    name: 'Personal Training',
    description: 'One-on-one sessions with certified trainers for customized fitness plans.',
  },
  {
    icon: <Target className="w-10 h-10 text-accent" />,
    name: 'Premium -',
    description: 'Modern locker rooms, shower facilities, and comfortable lounge areas.',
  },
]

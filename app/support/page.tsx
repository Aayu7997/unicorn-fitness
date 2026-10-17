'use client'

import { motion } from 'framer-motion'
import { FadeSection } from '@/components/fade-section'
import { MessageCircle, Mail, Phone, Clock, MapPin, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  const faqs = [
    {
      category: 'Membership',
      questions: [
        {
          q: 'How do I join Unicorn Fitness Club?',
          a: 'Visit our facility at Apex Tower, Mahal Road, Jagatpura, Jaipur or contact us at 087643 60662. You can also email us at Unicornfitness3111@gmail.com to schedule a tour and sign up.'
        },
        {
          q: 'What are your operating hours?',
          a: 'We are open Monday-Saturday: 5:00 AM - 11:00 PM, Sunday: 6:00 AM - 10:00 PM, and Public Holidays: 7:00 AM - 9:00 PM.'
        },
        {
          q: 'Can I pause my membership?',
          a: 'Yes, you can freeze your membership for up to 3 months per year with a ₹500/month freeze fee. Medical documentation or travel proof is required.'
        }
      ]
    },
    {
      category: 'Classes & Training',
      questions: [
        {
          q: 'How do I book a class?',
          a: 'Classes can be booked through our mobile app, at the front desk, or by calling us. Premium and Elite members get priority booking.'
        },
        {
          q: 'What if I miss a personal training session?',
          a: 'Please provide 24-hour notice to reschedule. Late cancellations or no-shows will forfeit the session.'
        },
        {
          q: 'Do you offer beginner-friendly classes?',
          a: '-! We have classes for all fitness levels, and our trainers will help you modify exercises to match your abilities.'
        }
      ]
    },
    {
      category: 'Facilities',
      questions: [
        {
          q: 'What equipment is available?',
          a: 'We offer state-of-the-art cardio machines, free weights, resistance machines, functional training equipment, and dedicated yoga/group class studios.'
        },
        {
          q: 'Do you have locker facilities?',
          a: 'Yes, we provide complimentary day-use lockers. Premium and Elite members can request personal lockers.'
        },
        {
          q: 'Is parking available?',
          a: 'Yes, we have ample parking space for all members at Apex Tower.'
        }
      ]
    }
  ]

  const supportChannels = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      contact: '087643 60662',
      availability: 'Mon-Sat: 5 AM-11 PM'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Send us your questions anytime',
      contact: 'Unicornfitness3111@gmail.com',
      availability: 'Response within 24 hours'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      description: 'Come to our facility',
      contact: 'Apex Tower, Mahal Road, Jagatpura',
      availability: 'Daily: See operating hours'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat with our team',
      contact: '- on website',
      availability: 'Mon-Sat: 9 AM-9 PM'
    }
  ]

  return (
    <main className="min-h-screen bg-background">
      

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-accent/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            How Can We Help?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-foreground/70"
          >
            We're here to support your fitness journey every step of the way
          </motion.p>
        </div>
      </section>

      {/* Search */}
      <FadeSection>
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 bg-card border border-accent/20 rounded-xl focus:outline-none focus:border-accent transition-colors text-foreground"
              />
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Support Channels */}
      <FadeSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
              <p className="text-foreground/70">Choose your preferred way to reach us</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportChannels.map((channel, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-card rounded-xl border border-accent/20 hover:border-accent transition-colors"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-4">
                    {channel.icon}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{channel.title}</h3>
                  <p className="text-sm text-foreground/60 mb-3">{channel.description}</p>
                  <p className="font-semibold text-accent mb-1">{channel.contact}</p>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <Clock className="w-3 h-3" />
                    {channel.availability}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* F- */}
      <FadeSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-foreground/70">Find quick answers to common questions</p>
            </div>

            <div className="space-y-12">
              {faqs.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-2xl font-bold text-accent mb-6">{section.category}</h3>
                  <div className="space-y-6">
                    {section.questions.map((faq, faqIndex) => (
                      <motion.div
                        key={faqIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: faqIndex * 0.1 }}
                        className="p-6 bg-background rounded-xl border border-accent/20"
                      >
                        <h4 className="font-bold text-foreground mb-2">{faq.q}</h4>
                        <p className="text-foreground/70">{faq.a}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Contact Form */}
      <FadeSection>
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Still Need Help?</h2>
              <p className="text-foreground/70">Send us a message and we'll get back to you soon</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-card rounded-2xl border border-accent/20"
            >
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Message</label>
                  <textarea rows={6} className="w-full px-4 py-3 bg-background border border-accent/20 rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground resize-none" placeholder="Tell us more about your question..." />
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-4 bg-accent text-background font-bold rounded-lg hover:bg-accent/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>
      </FadeSection>

      {/* Quick Links */}
      <FadeSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Helpful Resources</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Terms of Service', href: '/terms-of-service' },
                { label: 'Cookie Policy', href: '/cookie-policy' }
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      
    </main>
  )
}

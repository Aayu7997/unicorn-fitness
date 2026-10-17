'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
export function FAQSection({ faqs }: { faqs: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  if (!faqs || faqs.length === 0) return null

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 relative overflow-hidden section-contained">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Help & Support
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">Frequently Asked Questions</h2>
          <p className="text-lg text-foreground/70">
            Everything you need to know about Unicorn Fitness Club
          </p>
        </motion.div>

        {/* F- Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="mt-16 p-8 bg-linear-to-r from-accent/10 to-primary/10 rounded-2xl text-center border border-accent/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <p className="mb-4 font-semibold">Still have questions?</p>
          <p className="text-sm text-foreground/70">
            Contact our team at{' '}
            <span className="text-accent font-semibold">087643 60662</span> or email{' '}
            <span className="text-accent font-semibold">info@unicornfitness.com</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function FAQItem({ faq, index, isOpen, onToggle }: {
  faq: { id: number | string; question: string; answer: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  // Measure content height for smooth CSS transition
  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300"
    >
      <button
        className="w-full p-6 text-left flex items-start justify-between gap-4 bg-card dark:bg-gray-900 hover:bg-accent/5 dark:hover:bg-accent/10 transition-colors duration-200 hover:translate-x-1"
        onClick={onToggle}
      >
        <span className="text-lg font-bold pr-4 dark:text-gray-100">{faq.question}</span>
        <div
          className="shrink-0 text-accent transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown className="w-6 h-6" />
        </div>
      </button>

      {/* Answer — CSS height transition (replaces Framer Motion height:'auto') */}
      <div
        className="overflow-hidden border-t border-border dark:border-gray-700 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          maxHeight: isOpen ? `${height}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef}>
          <p className="p-6 text-foreground/70 dark:text-gray-300 leading-relaxed bg-accent/5 dark:bg-accent/10">
            {faq.answer}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

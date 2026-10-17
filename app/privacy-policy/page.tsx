'use client'

import { motion } from 'framer-motion'
import { FadeSection } from '@/components/fade-section'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-foreground/70">Last updated: January 2025</p>
          </motion.div>

          <FadeSection>
            <div className="prose prose-lg max-w-none text-foreground/80">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p>
                  Welcome to Unicorn Fitness Club. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and safeguard your information when you visit our facility 
                  or use our services located at Apex Tower, Mahal Road, Jagatpura, Jaipur, Rajasthan 302017.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <p className="mb-4">We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Identification:</strong> Name, email address, phone number, date of birth, and emergency contact information</li>
                  <li><strong>Membership Information:</strong> Membership type, payment details, attendance records, and fitness goals</li>
                  <li><strong>Health Information:</strong> Medical history, fitness assessments, and progress tracking data (with your consent)</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, and device information when using our website</li>
                  <li><strong>Communication Data:</strong> Records of correspondence with our staff and trainers</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and manage your gym membership and services</li>
                  <li>Process payments and maintain billing records</li>
                  <li>Create personalized fitness programs and track your progress</li>
                  <li>Communicate important updates, class schedules, and promotions</li>
                  <li>Ensure facility security and member safety</li>
                  <li>Improve our services and facilities based on member feedback</li>
                  <li>Comply with legal obligations and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against 
                  unauthorized access, alteration, disclosure, or destruction. Our security measures include encrypted 
                  storage, secure payment processing, and restricted access to personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Sharing</h2>
                <p className="mb-4">We do not sell your personal data. We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Certified trainers and staff members to provide services</li>
                  <li>Payment processors to handle membership transactions</li>
                  <li>Legal authorities when required by law</li>
                  <li>Service providers who assist in facility operations (under strict confidentiality agreements)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>- and receive a copy of your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your data (subject to legal obligations)</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Object to direct marketing communications</li>
                  <li>Lodge a complaint with relevant data protection authorities</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Data Retention</h2>
                <p>
                  We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, 
                  comply with legal obligations, resolve disputes, and enforce our agreements. Membership data is typically 
                  retained for 7 years after account closure for accounting and legal purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Children's Privacy</h2>
                <p>
                  Our services are intended for individuals aged 16 and above. We do not knowingly collect personal 
                  information from children under 16 without parental consent. Junior memberships (ages 13-15) require 
                  guardian authorization and supervision.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy periodically to reflect changes in our practices or legal requirements. 
                  We will notify members of significant changes via email or facility notices. Continued use of our services 
                  after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Us</h2>
                <p className="mb-4">
                  If you have questions or concerns about this privacy policy or your personal data, please contact us:
                </p>
                <div className="bg-card p-6 rounded-lg border border-accent/20">
                  <p><strong>Unicorn Fitness Club</strong></p>
                  <p>Owner: Lokesh Meena</p>
                  <p>Apex Tower, Mahal Road, Near Jagatpura Flyover</p>
                  <p>- Nagar, Railway Colony, Jagatpura</p>
                  <p>Jaipur, Rajasthan 302017</p>
                  <p className="mt-4">Phone: <a href="tel:+918764360662" className="text-accent hover:underline">087643 60662</a></p>
                  <p>Email: <a href="mailto:Unicornfitness3111@gmail.com" className="text-accent hover:underline">Unicornfitness3111@gmail.com</a></p>
                </div>
              </section>
            </div>
          </FadeSection>
        </div>
      </section>

      
    </main>
  )
}

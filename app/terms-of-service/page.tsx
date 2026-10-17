'use client'

import { motion } from 'framer-motion'
import { FadeSection } from '@/components/fade-section'

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-foreground/70">Last updated: January 2025</p>
          </motion.div>

          <FadeSection>
            <div className="prose prose-lg max-w-none text-foreground/80">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing and using the facilities and services of Unicorn Fitness Club located at Apex Tower, 
                  Mahal Road, Jagatpura, Jaipur, Rajasthan 302017, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of these terms, you may not access our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Membership</h2>
                <h3 className="text-xl font-semibold text-foreground mb-2">2.1 Eligibility</h3>
                <p className="mb-4">
                  Members must be at least 16 years of age. Persons aged 13-15 may join with parental consent and 
                  must be supervised by a guardian during facility use.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-2">2.2 Membership Types</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Basic Monthly: ₹2,999/month - Access to gym equipment and facilities</li>
                  <li>Premium Monthly: ₹5,999/month - Includes group classes and nutrition guidance</li>
                  <li>Elite Annual: ₹9,999/month - Full access with personal training sessions</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">2.3 Payment Terms</h3>
                <p>
                  Membership fees are due in advance. Late payments may result in suspension of membership privileges. 
                  A grace period of 7 days is provided before account suspension.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Facility Rules</h2>
                <h3 className="text-xl font-semibold text-foreground mb-2">3.1 Code of Conduct</h3>
                <p className="mb-4">Members must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Treat staff, trainers, and other members with respect</li>
                  <li>Use equipment properly and return items to designated areas</li>
                  <li>Maintain personal hygiene and wear appropriate athletic attire</li>
                  <li>Refrain from disruptive behavior, offensive language, or harassment</li>
                  <li>Follow safety guidelines and trainer instructions</li>
                  <li>Keep personal belongings secure in provided lockers</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.2 Prohibited Activities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Using or possessing illegal substances on premises</li>
                  <li>Photography or video recording without permission</li>
                  <li>Smoking, vaping, or consuming alcohol</li>
                  <li>Soliciting or conducting commercial activities</li>
                  <li>Bringing outside trainers or guests without authorization</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Health and Safety</h2>
                <h3 className="text-xl font-semibold text-foreground mb-2">4.1 Medical Clearance</h3>
                <p>
                  Members are required to complete a health questionnaire. Those with pre-existing medical conditions 
                  should consult their physician before beginning any exercise program. Unicorn Fitness Club is not 
                  responsible for injuries resulting from failure to disclose medical conditions.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.2 Assumption of Risk</h3>
                <p>
                  Members acknowledge that physical exercise carries inherent risks. By using our facilities, you assume 
                  all risks associated with participation in fitness activities and agree to exercise at your own risk.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.3 Emergency Procedures</h3>
                <p>
                  In case of medical emergency, staff will provide basic first aid and contact emergency services. 
                  Members consent to emergency medical treatment if necessary.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Cancellation and Refunds</h2>
                <h3 className="text-xl font-semibold text-foreground mb-2">5.1 Cancellation Policy</h3>
                <p className="mb-4">
                  Monthly memberships can be cancelled with 30 days written notice. Annual memberships require 60 days notice. 
                  Cancellation requests must be submitted in writing to management.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-2">5.2 Refund Policy</h3>
                <p>
                  Monthly membership fees are non-refundable once the billing cycle begins. Annual memberships may receive 
                  prorated refunds (minus a ₹2,000 processing fee) if cancelled within the first 90 days due to medical reasons 
                  with doctor's certificate.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.3 Membership Freeze</h3>
                <p>
                  Members may freeze their membership for up to 3 months per year (₹500/month freeze fee) due to medical 
                  reasons, travel, or other valid circumstances with proper documentation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Liability Waiver</h2>
                <p>
                  Members agree to indemnify and hold harmless Unicorn Fitness Club, its owner Lokesh Meena, employees, 
                  and contractors from any claims, damages, or liabilities arising from use of facilities or services, 
                  except in cases of gross negligence or willful misconduct by the club.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Personal Training Services</h2>
                <p>
                  Personal training sessions must be scheduled in advance and are subject to trainer availability. 
                  Cancellations require 24-hour notice; late cancellations forfeit the session. Training packages 
                  are valid for 6 months from purchase date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Intellectual Property</h2>
                <p>
                  All content, logos, workout programs, and materials provided by Unicorn Fitness Club are protected 
                  by intellectual property rights. Members may not reproduce, distribute, or commercially exploit any 
                  club materials without written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Termination by Club</h2>
                <p className="mb-4">
                  Unicorn Fitness Club reserves the right to terminate or suspend membership without refund for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violation of facility rules or code of conduct</li>
                  <li>Non-payment of membership fees</li>
                  <li>Threatening or abusive behavior toward staff or members</li>
                  <li>Misuse or damage to equipment or facilities</li>
                  <li>Fraudulent information provided during registration</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Members will be notified of significant 
                  changes via email or facility notices. Continued use of services after changes constitutes acceptance 
                  of updated terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>
                <p>
                  These terms are governed by the laws of India and the state of Rajasthan. All disputes will be 
                  resolved through arbitration in Jaipur, Rajasthan.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Information</h2>
                <p className="mb-4">
                  For questions about these Terms of Service, please contact:
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

              <section className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-sm text-foreground/70">
                  <strong>-:</strong> By signing the membership agreement or using our facilities, 
                  you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </section>
            </div>
          </FadeSection>
        </div>
      </section>

      
    </main>
  )
}

'use client'

import { motion } from 'framer-motion'
import { FadeSection } from '@/components/fade-section'

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-foreground mb-4">Cookie Policy</h1>
            <p className="text-foreground/70">Last updated: January 2025</p>
          </motion.div>

          <FadeSection>
            <div className="prose prose-lg max-w-none text-foreground/80">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies</h2>
                <p>
                  Cookies are small text files stored on your device when you visit our website. They help us provide 
                  you with a better experience by remembering your preferences, analyzing site traffic, and personalizing 
                  content. This Cookie Policy explains how Unicorn Fitness Club uses cookies and similar technologies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">2.1 Essential Cookies</h3>
                <p className="mb-4">
                  These cookies are necessary for the website to function properly. They enable core functionality such as 
                  security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Session management and authentication</li>
                  <li>Load balancing and security</li>
                  <li>Form submission functionality</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-2">2.2 Performance Cookies</h3>
                <p className="mb-4">
                  These cookies collect information about how visitors use our website, such as which pages are visited 
                  most often and if users receive error messages. This helps us improve website performance.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Google Analytics for traffic analysis</li>
                  <li>Page load time monitoring</li>
                  <li>User interaction tracking</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-2">2.3 Functional Cookies</h3>
                <p className="mb-4">
                  These cookies allow the website to remember choices you make and provide enhanced features and 
                  personalization.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Language preferences</li>
                  <li>Theme selection (dark/light mode)</li>
                  <li>Location preferences for class schedules</li>
                  <li>Video player settings</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-2">2.4 Targeting/- Cookies</h3>
                <p className="mb-4">
                  These cookies are used to deliver advertisements relevant to you and your interests. They also limit 
                  the number of times you see an advertisement and help measure campaign effectiveness.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Social media advertising (Facebook, Instagram)</li>
                  <li>Google Ads remarketing</li>
                  <li>Conversion tracking</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Third-Party Cookies</h2>
                <p className="mb-4">
                  We use services from trusted third parties that may also set cookies on your device:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google -:</strong> Website traffic analysis and user behavior</li>
                  <li><strong>Facebook Pixel:</strong> Social media advertising and analytics</li>
                  <li><strong>Instagram:</strong> Social media integration and content sharing</li>
                  <li><strong>YouTube:</strong> Video content embedding</li>
                  <li><strong>Payment Processors:</strong> Secure payment transaction processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookie Duration</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Session Cookies</h3>
                    <p>
                      Temporary cookies that expire when you close your browser. Used for essential site functions like 
                      maintaining your logged-in state during a browsing session.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Persistent Cookies</h3>
                    <p>
                      Cookies that remain on your device for a set period or until manually deleted. Used to remember 
                      your preferences and settings across visits. Duration ranges from 30 days to 2 years depending on purpose.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. How to Manage Cookies</h2>
                <p className="mb-4">
                  You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but 
                  you can modify your browser settings to decline cookies if you prefer.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-2">Browser Settings</h3>
                <p className="mb-4">You can control cookies through your browser settings:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                </ul>
                <p className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                  <strong>Note:</strong> Disabling certain cookies may affect website functionality and your user experience. 
                  Essential cookies cannot be disabled as they are required for the website to function.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookie Consent</h2>
                <p>
                  When you first visit our website, you will see a cookie consent banner. You can choose to accept all 
                  cookies, reject non-essential cookies, or customize your preferences. Your choice will be stored and 
                  you can change your preferences at any time by clicking the cookie settings link in the footer.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Do Not Track Signals</h2>
                <p>
                  Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your 
                  online activity tracked. Currently, there is no industry standard for responding to DNT signals. We do 
                  not currently respond to DNT browser signals, but you can set your preferences through our cookie consent tool.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Cookies and Mobile Devices</h2>
                <p>
                  Similar technologies are used on mobile devices, including mobile identifiers and SDK data collection. 
                  You can manage these through your device settings:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>iOS:</strong> Settings → Privacy → Tracking → Allow Apps to Request to Track (disable)</li>
                  <li><strong>Android:</strong> Settings → Google → Ads → Opt out of Ads Personalization</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Updates to Cookie Policy</h2>
                <p>
                  We may update this Cookie Policy periodically to reflect changes in technology, legislation, or our 
                  business practices. We will notify you of significant changes via email or a prominent notice on our 
                  website. The "Last Updated" date at the top indicates when the policy was last revised.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Us About Cookies</h2>
                <p className="mb-4">
                  If you have questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="bg-card p-6 rounded-lg border border-accent/20">
                  <p><strong>Unicorn Fitness Club</strong></p>
                  <p>Owner: Lokesh Meena</p>
                  <p>- Tower, Mahal Road, Near Jagatpura Flyover</p>
                  <p>- Nagar, Railway Colony, Jagatpura</p>
                  <p>Jaipur, Rajasthan 302017</p>
                  <p className="mt-4">Phone: <a href="tel:+918764360662" className="text-accent hover:underline">087643 60662</a></p>
                  <p>Email: <a href="mailto:Unicornfitness3111@gmail.com" className="text-accent hover:underline">Unicornfitness3111@gmail.com</a></p>
                </div>
              </section>

              <section className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/30">
                <h3 className="font-bold text-foreground mb-2">Your Consent</h3>
                <p className="text-sm text-foreground/70">
                  By using our website, you consent to our use of cookies in accordance with this Cookie Policy. 
                  If you do not agree to our use of cookies, please adjust your browser settings or refrain from using our website.
                </p>
              </section>
            </div>
          </FadeSection>
        </div>
      </section>

      
    </main>
  )
}

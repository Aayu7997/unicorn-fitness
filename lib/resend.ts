import { Resend } from 'resend'

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM_EMAIL = 'noreply@unicornfitness.com'
const TO_EMAIL = process.env.CONTACT_EMAIL || 'Unicornfitness3111@gmail.com'

interface ContactEmailData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

/**
 * Send contact form notification email to the gym owner.
 */
export async function sendContactNotification(data: ContactEmailData): Promise<void> {
  const resend = getResendClient()
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email notification')
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,

    to: TO_EMAIL,

    subject: `New Inquiry: ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">New Contact Inquiry — Unicorn Fitness Club</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #666;">Name:</td>
            <td style="padding: 8px;">${data.name}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold; color: #666;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          ${data.phone ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Phone:</td><td style="padding: 8px;">${data.phone}</td></tr>` : ''}
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold; color: #666;">Subject:</td>
            <td style="padding: 8px;">${data.subject}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #666; vertical-align: top;">Message:</td>
            <td style="padding: 8px;">${data.message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; color: #999; font-size: 12px;">
          This inquiry was submitted via the Unicorn Fitness Club website contact form.
        </p>
      </div>
    `,
  })
}

/**
 * Send welcome email to a new member.
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to Unicorn Fitness Club! 🦄',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Welcome to Unicorn Fitness Club, ${name}!</h2>
        <p>We're thrilled to have you join our fitness family at Jaipur's premier fitness destination.</p>
        <p>Your journey to a healthier, stronger life starts now.</p>
        <p><strong>Your gym:</strong> - Tower, Mahal Road, Near Jagatpura Flyover, Jaipur</p>
        <p><strong>Call us:</strong> 087643 60662</p>
        <p style="color: #999; font-size: 12px;">— Lokesh Meena, Owner, Unicorn Fitness Club</p>
      </div>
    `,
  })
}

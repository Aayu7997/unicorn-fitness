import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const forgotSchema = z.object({
  email: z.string().email('Invalid email').max(254),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateCheck = checkRateLimit(`forgot:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ message: 'If an account exists, a reset code was sent.' });
    }

    // Generate a 6-digit OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n========================================\n🔑 [PASSWORD RESET CODE for ${email}]: ${resetToken}\n⏰ Expires in 15 minutes\n========================================\n`);
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const fromEmail = process.env.RESEND_FROM || 'Unicorn Fitness Club <onboarding@resend.dev>';
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: email,
            subject: 'Unicorn Fitness Club — Password Reset Code',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Unicorn Fitness Club</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Password Recovery</p>
                </div>
                <div style="padding: 32px 28px; color: #1e293b;">
                  <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0; color: #0f172a;">Password Reset Request</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                    We received a request to reset the password for your Unicorn Fitness Club account. Enter the 6-digit verification code below to complete the reset:
                  </p>
                  <div style="background: #fff7ed; border: 2px dashed #fb923c; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ea580c; font-family: monospace;">
                      ${resetToken}
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 600; color: #9a3412;">
                      Expires in 15 minutes
                    </p>
                  </div>
                  <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 20px 0;">
                    If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
                    Unicorn Fitness Club, - Tower, Mahal Road, Near Jagatpura Flyover, Jaipur<br />
                    © ${new Date().getFullYear()} Unicorn Fitness Club. All rights reserved.
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          console.error('Failed to send reset email via Resend API:', await res.text());
        }
      } catch (e) {
        console.error('Error sending reset email:', e);
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY is not configured in .env.local. Configure RESEND_API_KEY to send emails in production.');
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a 6-digit reset code was sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

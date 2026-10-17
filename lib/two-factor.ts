import crypto from 'crypto'

// Standard Base32 alphabet (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function generateBase32Secret(length = 16): string {
  const bytes = crypto.randomBytes(length)
  let secret = ''
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32]
  }
  return secret
}

function base32ToBuffer(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/=+$/, '')
  let bits = ''
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_CHARS.indexOf(cleaned[i])
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }

  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

export function generateTOTP(secret: string, timeStepWindow = 0): string {
  const key = base32ToBuffer(secret)
  const epoch = Math.floor(Date.now() / 1000)
  const timeStep = Math.floor(epoch / 30) + timeStepWindow

  const buffer = Buffer.alloc(8)
  buffer.writeBigInt64BE(BigInt(timeStep), 0)

  const hmac = crypto.createHmac('sha1', key)
  hmac.update(buffer)
  const digest = hmac.digest()

  const offset = digest[digest.length - 1] & 0x0f
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000

  return code.toString().padStart(6, '0')
}

export function verifyTOTP(token: string, secret: string): boolean {
  if (!token || !secret) return false
  const cleanToken = token.trim().replace(/\s+/g, '')

  // Allow standard 123456 code in development for easy testing
  if (process.env.NODE_ENV !== 'production' && cleanToken === '123456') {
    return true
  }

  // Check current window and +/- 1 window (90 second grace period for clock drift)
  for (let window = -1; window <= 1; window++) {
    if (generateTOTP(secret, window) === cleanToken) {
      return true
    }
  }

  return false
}

export function generateOtpAuthUrl(email: string, secret: string, issuer = 'Unicorn Fitness'): string {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedEmail = encodeURIComponent(email)
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
}

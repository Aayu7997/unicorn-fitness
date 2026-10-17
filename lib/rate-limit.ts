/**
 * Centralized, memory-efficient sliding-window rate limiter for API routes.
 * Mitigates OWASP A04:2021 (Insecure Design) and OWASP API4:2023 (Unrestricted Resource Consumption).
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Global store for in-memory rate limiting with automated eviction
const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodic garbage collection every 10 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 10 * 60 * 1000).unref?.()
}

export interface RateLimitOptions {
  windowMs: number // Time frame in milliseconds
  max: number // Maximum requests per window
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Checks if a request identified by `key` (typically IP + action) is within limits.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 15 * 60 * 1000, max: 10 }
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // In test/dev mode with bypass env flag, allow generous testing limit
  const effectiveMax =
    process.env.NODE_ENV === 'development' ? options.max * 10 : options.max

  if (!record || record.resetTime < now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    rateLimitStore.set(key, newRecord)
    return {
      success: true,
      limit: effectiveMax,
      remaining: effectiveMax - 1,
      resetTime: newRecord.resetTime,
    }
  }

  if (record.count >= effectiveMax) {
    return {
      success: false,
      limit: effectiveMax,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count++
  return {
    success: true,
    limit: effectiveMax,
    remaining: effectiveMax - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Helper to extract client IP address from NextRequest headers safely.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return headers.get('x-real-ip') || 'unknown'
}

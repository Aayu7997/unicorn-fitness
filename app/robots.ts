import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/signin',
          '/signup',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/private/',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'ClaudeBot', 'Bytespider'],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/signin',
          '/signup',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/private/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

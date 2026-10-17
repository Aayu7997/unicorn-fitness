import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const routes = [
    '',
    '/about',
    '/programs',
    '/membership',
    '/gallery',
    '/testimonials',
    '/contact',
    '/blog',
    '/support',
    '/signin',
    '/signup',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/membership' ? 0.9 : 0.7,
  }))
}

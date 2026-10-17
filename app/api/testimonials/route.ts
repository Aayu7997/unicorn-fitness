import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
    const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID

    // Attempt to fetch from Google Places API if credentials are provided
    if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACE_ID) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}&language=en`
        
        const res = await fetch(url, {
          next: { revalidate: 86400 } // Cache for 24 hours
        })
        
        const data = await res.json()
        
        if (data?.result?.reviews) {
          // Map to existing Testimonial interface
          const mappedReviews = data.result.reviews
            .filter((r: any) => r.text) // Only show reviews with text
            .map((r: any) => ({
              id: r.author_url || Math.random().toString(),
              name: r.author_name,
              role: 'Google Review',
              content: r.text,
              rating: r.rating,
              imageUrl: r.profile_photo_url,
              createdAt: new Date(r.time * 1000).toISOString(),
              approved: true
            }))
          
          return NextResponse.json(mappedReviews, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
          })
        }
      } catch (err) {
        console.error("Error fetching Google Reviews:", err)
        // Fallback to database below
      }
    }

    // Fallback: Fetch from database if Google API is not configured or failed
    const testimonials = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(testimonials, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error("Error in testimonials API:", error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

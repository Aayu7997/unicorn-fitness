import { NextResponse } from 'next/server'

export async function GET() {
  // This is a placeholder that returns animation config
  // Later this will connect to Supabase/database
  const config = {
    global: {
      enabled: true,
      smoothScroll: true,
      preset: 'cinematic',
      performanceMode: 'auto'
    },
    hero: {
      type: 'cinematic',
      duration: 1.2,
      ease: 'power4.out',
      videoScroll: true,
      depth3D: true
    },
    sections: {
      reveal: 'fade-up',
      stagger: 0.15,
      parallax: true
    },
    pages: {
      home: 'cinematic',
      about: 'minimal',
      programs: 'dynamic'
    }
  }

  return NextResponse.json(config)
}

export async function POST(request: Request) {
  // Placeholder for saving animation config
  // Later this will save to database
  const body = await request.json()
  
  return NextResponse.json({ 
    success: true, 
    message: '- config saved',
    config: body 
  })
}

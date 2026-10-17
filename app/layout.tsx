import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { PageTransition } from '@/components/page-transition'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ScrollProgress } from '@/components/scroll-progress'
import { LoadingScreen } from '@/components/loading-screen'
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider'
import './globals.css'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  let customSeo = null;
  try {
    const seoRecord = await prisma.siteContent.findUnique({ where: { key: 'seo' } })
    if (seoRecord && seoRecord.content) {
      customSeo = seoRecord.content as any;
    }
  } catch (e) {
    console.error("Failed to fetch custom SEO", e);
  }

  const title = customSeo?.title || 'Unicorn Fitness Club — Premium Fitness & Training in Jaipur'
  const description = customSeo?.description || 'Jaipur\'s premier fitness destination. World-class equipment, certified trainers, personalized programs. Join 15,000+ members.'
  const keywords = customSeo?.keywords?.split(',').map((k: string) => k.trim()) || ['gym jaipur', 'fitness club jaipur', 'personal trainer jaipur', 'unicorn fitness', 'best gym jaipur', 'workout jaipur']
  const author = customSeo?.author || 'Unicorn Fitness Club'
  const ogImage = customSeo?.ogImage || '/images/hero-gym.jpg'
  const canonicalUrl = customSeo?.canonicalUrl || 'https://unicornfitnessclub.com'

  return {
    title: {
      default: title,
      template: '%s | Unicorn Fitness Club',
    },
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: author,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let adsData: any = null;
  try {
    const adsRecord = await prisma.siteContent.findUnique({ where: { key: 'ads' } })
    if (adsRecord && adsRecord.content) {
      adsData = adsRecord.content;
    }
  } catch (e) {
    console.error("Failed to fetch ads settings", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    "name": "Unicorn Fitness Club",
    "image": "https://unicornfitnessclub.com/images/hero-gym.jpg",
    "logo": "https://unicornfitnessclub.com/images/unicorn-logo.png",
    "@id": "https://unicornfitnessclub.com/#gym",
    "url": "https://unicornfitnessclub.com",
    "telephone": "+918764360662",
    "priceRange": "₹₹",
    "address": {
      "@type": "Postal-",
      "street-": "- Tower, Mahal Road, Near Jagatpura Flyover",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "302017",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.8222,
      "longitude": 75.8654
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "05:30",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "07:00",
        "closes": "20:00"
      }
    ],
    "same-": [
      "https://www.instagram.com/unicorn_fitness_jaipur"
    ],
    "founder": {
      "@type": "Person",
      "name": "Lokesh Meena"
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical images for instant hero render */}
        <link rel="preload" href="/images/hero-gym.jpg" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/unicorn-logo.png" as="image" />
        
        {/* Elite Structured JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        {/* Tracking Scripts Injected from Admin Panel */}
        {adsData?.googleAnalyticsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${adsData.googleAnalyticsId}`} strategy="afterInteractive" />
            <Script id="googleAnalyticsIdanalytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${adsData.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}

        {adsData?.googleAnalyticsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${adsData.googleAnalyticsId}`} strategy="afterInteractive" />
            <Script id="googleAnalyticsIdads" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${adsData.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}

        {adsData?.metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${adsData.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {adsData?.tiktokPixelId && (
          <Script id="tiktok-pixel" strategy="afterInteractive">
            {`
              !function (w, d, t) {
                w.Tiktok-=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.set-=function(t,e){t[e]=function(){t.push([e].concat(-.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.set-(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.set-(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${adsData.tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `}
          </Script>
        )}

        <ThemeProvider>
          <LoadingScreen />
          <ScrollProgress />
          <SmoothScrollProvider>
            <Header />
            {children}
            <Footer />
          </SmoothScrollProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

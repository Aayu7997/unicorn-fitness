'use client'

import { motion } from 'framer-motion'
import { FadeSection } from '@/components/fade-section'
import { Calendar, Clock, User, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function BlogPage() {
  const { data: postsData, error, isLoading } = useSWR('/api/blog', fetcher)

  const categories = ['All', 'Strength Training', 'Nutrition', 'Yoga & Wellness', 'Cardio', 'Recovery', 'Motivation']

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 w-full">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )
    }

    if (error || !postsData || postsData.length === 0) {
      return (
        <div className="text-center py-20 text-foreground/70">
          No blog posts found. Check back later!
        </div>
      )
    }

    const featuredPost = postsData[0]
    const otherPosts = postsData.slice(1)

    return (
      <>
        {/* Featured Post */}
        <FadeSection>
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Link href={`/blog/${featuredPost.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative h-[500px] rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <img 
                    src={featuredPost.coverUrl || "/placeholder.svg"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                    <span className="inline-block px-3 py-1 bg-accent text-background text-xs font-bold rounded-full mb-4">
                      FEATURED
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-foreground/70 text-lg mb-6 max-w-3xl">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        5 min read
                      </div>
                      <div>By {featuredPost.author}</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </section>
        </FadeSection>

        {/* Blog Grid */}
        <FadeSection>
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post: any, index: number) => (
                  <Link href={`/blog/${post.slug}`} key={post.id}>
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group cursor-pointer"
                    >
                      <div className="relative h-64 rounded-xl overflow-hidden mb-4">
                        <img 
                          src={post.coverUrl || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-accent/90 text-background text-xs font-bold rounded-full">
                            {post.tags?.[0] || 'Article'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-foreground/70 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-foreground/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            5 min read
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
                      </div>

                      <div className="mt-3 text-sm text-foreground/50">
                        By {post.author}
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-16 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-accent text-background font-bold rounded-xl"
                >
                  Load More
                </motion.button>
              </div>
            </div>
          </section>
        </FadeSection>
      </>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      
      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-accent/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Fitness Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-foreground/70"
          >
            Expert insights, tips, and stories from Unicorn Fitness Club
          </motion.p>
        </div>
      </section>

      {/* Categories */}
      <FadeSection>
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-full border border-accent/20 hover:bg-accent/10 hover:border-accent transition-all text-sm font-medium text-foreground"
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Dynamic Content */}
      {renderContent()}

      {/* Newsletter */}
      <FadeSection>
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Subscribe to our newsletter for the latest fitness tips, workout routines, and exclusive content
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-accent text-background font-bold rounded-xl whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </section>
      </FadeSection>

      
    </main>
  )
}

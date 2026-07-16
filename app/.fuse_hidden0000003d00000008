import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '../lib/blog'

const BASE_URL = 'https://healthos.live'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/faq/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/voice-biomarkers/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/voice-vs-wearables/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog/`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about/`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy/`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/terms/`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ]

  // Published blog posts, added automatically as each post's status flips to "published".
  const postRoutes: MetadataRoute.Sitemap = getPublishedPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}/`,
    lastModified: (p.updated || p.date) ? new Date(p.updated || p.date) : lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...postRoutes]
}

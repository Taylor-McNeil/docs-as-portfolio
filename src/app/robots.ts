import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/tools',
    },
    sitemap: 'https://taylormcneil.dev/sitemap.xml',
    host: 'https://taylormcneil.dev',
  }
}

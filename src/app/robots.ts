import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/tools',
    },
    sitemap: 'https://www.taylormcneil.dev/sitemap.xml',
    host: 'https://www.taylormcneil.dev',
  }
}

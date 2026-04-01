import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://taylormcneil.dev'

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/quickstart`, priority: 0.9 },
    { url: `${baseUrl}/changelog`, priority: 0.6 },
    { url: `${baseUrl}/aampersand/a-sirens-song`, priority: 0.8 },
    { url: `${baseUrl}/aampersand/peering-into-lethe`, priority: 0.8 },
    { url: `${baseUrl}/aampersand/a-broken-astrolabe`, priority: 0.8 },
    { url: `${baseUrl}/case-studies/stellar-api-docs`, priority: 0.8 },
    { url: `${baseUrl}/case-studies/on-good-tutorials`, priority: 0.7 },
    { url: `${baseUrl}/guides/hmac-authentication`, priority: 0.7 },
    { url: `${baseUrl}/tutorials/java-game-dev`, priority: 0.7 },
    { url: `${baseUrl}/tutorials/mongodb-tanstack`, priority: 0.7 },
    { url: `${baseUrl}/side-projects/the-longview`, priority: 0.6 },
  ]
}
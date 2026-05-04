import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://taylormcneil.dev'
  const lastModified = new Date()

  return [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/quickstart`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/guides/hmac-authentication`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/tutorials/java-game-dev`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/tutorials/mongodb-tanstack`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/case-studies/stellar-api-docs`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/case-studies/on-good-tutorials`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/side-projects/the-longview`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/aampersand`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/aampersand/a-broken-astrolabe`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/aampersand/a-sirens-song`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/aampersand/oily-bodies-in-karpathos`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/aampersand/peering-into-lethe`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ]
}

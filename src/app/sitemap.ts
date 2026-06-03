import type { MetadataRoute } from 'next'
import { readdirSync } from 'fs'
import { join } from 'path'

const baseUrl = 'https://taylormcneil.dev'
const appDir = join(process.cwd(), 'src', 'app')
const PAGE_FILE = /^page\.(tsx|ts|jsx|mdx)$/

// Routes to keep out of the sitemap. A route and everything beneath it is
// excluded, so 'tools' also drops 'tools/ogmaker', 'tools/tropecloud', etc.
const EXCLUDED = new Set(['tools'])

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency']
type RouteMeta = { changeFrequency?: ChangeFrequency; priority?: number }

// Per-route SEO tuning. Keys are routes relative to the site root ('' = home).
// Any page not listed here falls back to the defaults computed in `metaFor`.
const overrides: Record<string, RouteMeta> = {
  '': { changeFrequency: 'weekly', priority: 1 },
  changelog: { changeFrequency: 'weekly', priority: 0.5 },
  aampersand: { changeFrequency: 'monthly', priority: 0.8 },
}

// Sensible defaults by top-level section so new pages get reasonable values
// without needing an explicit override.
function metaFor(route: string): RouteMeta {
  if (route in overrides) return overrides[route]
  const section = route.split('/')[0]
  if (section === 'aampersand') return { changeFrequency: 'monthly', priority: 0.6 }
  if (section === 'side-projects') return { changeFrequency: 'monthly', priority: 0.5 }
  return { changeFrequency: 'monthly', priority: 0.7 }
}

// Recursively collect every directory under src/app that has a page file.
// The returned strings are routes relative to the site root ('' = home).
function findRoutes(dir: string, base = ''): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const routes: string[] = []

  if (entries.some((e) => e.isFile() && PAGE_FILE.test(e.name))) {
    routes.push(base)
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    // Skip Next.js route groups (group) and private folders (_lib).
    if (entry.name.startsWith('(') || entry.name.startsWith('_')) continue
    const childBase = base ? `${base}/${entry.name}` : entry.name
    if (EXCLUDED.has(childBase)) continue
    routes.push(...findRoutes(join(dir, entry.name), childBase))
  }

  return routes
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return findRoutes(appDir)
    .sort()
    .map((route) => ({
      url: route ? `${baseUrl}/${route}` : baseUrl,
      lastModified,
      ...metaFor(route),
    }))
}

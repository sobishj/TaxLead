// Site settings live in one KV document ("site"); each logo is its own KV entry ("logo:<id>").

export const SITE_KEY = 'site'
export const logoKey = (id) => `logo:${id}`

export const MAX_LOGO_BYTES = 1024 * 1024
export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif']

export const defaultSite = () => ({
  clients: [],
  scripts: [],
  settings: { marqueeTitle: 'Trusted by growing businesses across India and the Middle East', grayscale: true, speed: 40 },
  updatedAt: null,
})

export async function readSite(env, { cacheTtl } = {}) {
  const site = await env.SITE.get(SITE_KEY, cacheTtl ? { type: 'json', cacheTtl } : { type: 'json' })
  const base = defaultSite()
  return site ? { ...base, ...site, settings: { ...base.settings, ...site.settings } } : base
}

export async function writeSite(env, site) {
  site.updatedAt = new Date().toISOString()
  await env.SITE.put(SITE_KEY, JSON.stringify(site))
  return site
}

export const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Only accept http(s) links so a client entry can't smuggle a javascript: URL into the page.
const safeUrl = (v) => {
  const s = str(v, 500)
  if (!s) return ''
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''
  } catch {
    return ''
  }
}

// Validates an admin-submitted site document against the stored one.
export function sanitizeSite(input, current) {
  const known = new Map(current.clients.map((c) => [c.id, c]))
  const clients = (Array.isArray(input.clients) ? input.clients : [])
    .filter((c) => c && known.has(c.id))
    .slice(0, 200)
    .map((c) => ({ ...known.get(c.id), name: str(c.name, 120) || known.get(c.id).name, url: safeUrl(c.url) }))

  const scripts = (Array.isArray(input.scripts) ? input.scripts : []).slice(0, 50).map((s) => ({
    id: typeof s.id === 'string' && /^[a-z0-9]{1,24}$/.test(s.id) ? s.id : newId(),
    name: str(s.name, 120) || 'Untitled script',
    placement: s.placement === 'head' ? 'head' : 'body',
    enabled: Boolean(s.enabled),
    code: typeof s.code === 'string' ? s.code.slice(0, 50_000) : '',
  }))

  const i = input.settings || {}
  const speed = Number(i.speed)
  const settings = {
    marqueeTitle: str(i.marqueeTitle, 200),
    grayscale: i.grayscale !== false,
    speed: Number.isFinite(speed) ? Math.min(120, Math.max(10, Math.round(speed))) : 40,
  }

  return { clients, scripts, settings }
}

// What the public page is allowed to see.
export const publicSite = (site) => ({
  clients: site.clients.map(({ id, name, url, logo, v }) => ({
    name,
    url,
    logo: logo ? `/api/logo/${id}?v=${v || 1}` : null,
  })),
  settings: site.settings,
})

export const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...init.headers },
  })

import { json, logoKey, readSite, sanitizeSite, writeSite } from '../../../server/site.js'

export async function onRequestGet({ env }) {
  return json(await readSite(env))
}

// Saves client order/names/links, scripts and settings. Clients missing from the payload are deleted.
export async function onRequestPut({ request, env }) {
  const input = await request.json().catch(() => null)
  if (!input) return json({ error: 'Invalid JSON' }, { status: 400 })

  const current = await readSite(env)
  const next = { ...current, ...sanitizeSite(input, current) }

  const kept = new Set(next.clients.map((c) => c.id))
  const removed = current.clients.filter((c) => !kept.has(c.id) && c.logo)
  await Promise.all(removed.map((c) => env.SITE.delete(logoKey(c.id))))

  return json(await writeSite(env, next))
}

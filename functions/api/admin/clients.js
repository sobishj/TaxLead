import { LOGO_TYPES, MAX_LOGO_BYTES, json, logoKey, newId, readSite, sanitizeSite, writeSite } from '../../../server/site.js'

// Adds a client (multipart: name, url, logo) or, when `id` is given, replaces that client's logo.
export async function onRequestPost({ request, env }) {
  const form = await request.formData().catch(() => null)
  if (!form) return json({ error: 'Expected multipart form data' }, { status: 400 })

  const site = await readSite(env)
  const id = form.get('id')
  const existing = id ? site.clients.find((c) => c.id === id) : null
  if (id && !existing) return json({ error: 'Client not found' }, { status: 404 })

  const name = String(form.get('name') || '').trim()
  if (!existing && !name) return json({ error: 'Client name is required' }, { status: 400 })

  const file = form.get('logo')
  const hasFile = file && typeof file === 'object' && file.size > 0
  if (hasFile) {
    if (!LOGO_TYPES.includes(file.type)) return json({ error: 'Logo must be PNG, JPG, WebP, SVG, GIF or AVIF' }, { status: 400 })
    if (file.size > MAX_LOGO_BYTES) return json({ error: 'Logo must be 1 MB or smaller' }, { status: 400 })
  }

  const client = existing || { id: newId(), name, url: '', logo: false, v: 0 }
  if (hasFile) {
    await env.SITE.put(logoKey(client.id), await file.arrayBuffer(), { metadata: { type: file.type } })
    client.logo = true
    client.v = (client.v || 0) + 1
  }

  if (!existing) {
    site.clients.push(client)
    // Run the new entry through the same validation as edits (trims name, checks the URL).
    const clean = sanitizeSite({ ...site, clients: site.clients.map((c) => (c.id === client.id ? { ...c, url: form.get('url') } : c)) }, site)
    site.clients = clean.clients
  }

  return json(await writeSite(env, site))
}

import { isAuthenticated } from '../../../server/auth.js'
import { json } from '../../../server/site.js'

export async function onRequestGet({ request, env }) {
  const ok = env.ADMIN_PASSWORD ? await isAuthenticated(env, request) : false
  return json({ authenticated: ok, configured: Boolean(env.ADMIN_PASSWORD), kv: Boolean(env.SITE) })
}

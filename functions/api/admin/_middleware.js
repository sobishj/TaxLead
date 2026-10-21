import { isAuthenticated, sameOrigin } from '../../../server/auth.js'
import { json } from '../../../server/site.js'

// Every /api/admin/* route requires a valid admin session.
export async function onRequest({ request, env, next }) {
  if (!env.SITE) return json({ error: 'KV namespace "SITE" is not bound to this project.' }, { status: 500 })
  if (!env.ADMIN_PASSWORD || !(await isAuthenticated(env, request))) return json({ error: 'Not signed in' }, { status: 401 })
  if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'Bad origin' }, { status: 403 })
  return next()
}

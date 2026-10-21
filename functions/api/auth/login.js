import { checkPassword, sameOrigin, sessionCookie } from '../../../server/auth.js'
import { json } from '../../../server/site.js'

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD is not set on the server.' }, { status: 500 })
  if (!sameOrigin(request)) return json({ error: 'Bad origin' }, { status: 403 })

  const { password } = await request.json().catch(() => ({}))
  if (!(await checkPassword(env, password))) {
    // Slow down password guessing.
    await new Promise((r) => setTimeout(r, 800))
    return json({ error: 'Incorrect password' }, { status: 401 })
  }
  return json({ ok: true }, { headers: { 'set-cookie': await sessionCookie(env, request) } })
}

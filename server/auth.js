// Stateless admin sessions: the cookie holds an expiry time plus an HMAC of it, so no session store is needed.

const COOKIE = 'tl_admin'
const SESSION_SECONDS = 60 * 60 * 12

const enc = new TextEncoder()

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

function secretOf(env) {
  const secret = env.SESSION_SECRET || env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured')
  return secret
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)))
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Compares HMACs of both values so the check takes the same time whatever the password length.
export async function checkPassword(env, password) {
  if (!env.ADMIN_PASSWORD || typeof password !== 'string') return false
  const key = 'password-check'
  return safeEqual(await hmac(key, password), await hmac(key, env.ADMIN_PASSWORD))
}

export async function sessionCookie(env, request) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  const token = `${exp}.${await hmac(secretOf(env), `admin:${exp}`)}`
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`

export async function isAuthenticated(env, request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  if (!match) return false
  const [exp, sig] = match[1].split('.')
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false
  return safeEqual(sig, await hmac(secretOf(env), `admin:${exp}`))
}

// Rejects cross-site form posts; the SameSite cookie already blocks most of these, this is belt and braces.
export function sameOrigin(request) {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(request.url).origin
}

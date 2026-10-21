import { clearCookie } from '../../../server/auth.js'
import { json } from '../../../server/site.js'

export const onRequestPost = () => json({ ok: true }, { headers: { 'set-cookie': clearCookie() } })

import { publicSite, readSite } from '../server/site.js'

// Injects the client list and the admin-managed scripts (chatbots, analytics, …) into public HTML pages
// at the edge, so changes made in /admin go live without rebuilding or touching source code.
export async function onRequest({ request, env, next }) {
  const res = await next()
  const { pathname } = new URL(request.url)
  if (
    request.method !== 'GET' ||
    !env.SITE ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') ||
    !(res.headers.get('content-type') || '').includes('text/html')
  ) {
    return res
  }

  let site
  try {
    site = await readSite(env, { cacheTtl: 60 })
  } catch {
    return res
  }

  const data = JSON.stringify(publicSite(site)).replace(/</g, '\\u003c')
  const enabled = site.scripts.filter((s) => s.enabled && s.code.trim())
  const block = (placement) =>
    enabled
      .filter((s) => s.placement === placement)
      .map((s) => `\n<!-- ${s.name.replace(/--/g, '')} -->\n${s.code}\n`)
      .join('')

  const out = new HTMLRewriter()
    .on('head', {
      element(el) {
        el.append(`<script>window.__TAXLEAD__=${data}</script>${block('head')}`, { html: true })
      },
    })
    .on('body', {
      element(el) {
        el.append(block('body'), { html: true })
      },
    })
    .transform(res)

  const headers = new Headers(out.headers)
  headers.set('cache-control', 'no-cache')
  return new Response(out.body, { status: out.status, statusText: out.statusText, headers })
}

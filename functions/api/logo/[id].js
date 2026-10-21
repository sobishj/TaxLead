import { logoKey } from '../../../server/site.js'

// Serves an uploaded logo. URLs carry ?v=<n>, so a new upload gets a new URL and these can be cached for a year.
export async function onRequestGet({ params, env }) {
  if (!/^[a-z0-9]{1,24}$/.test(params.id)) return new Response('Not found', { status: 404 })
  const { value, metadata } = await env.SITE.getWithMetadata(logoKey(params.id), { type: 'arrayBuffer', cacheTtl: 3600 })
  if (!value) return new Response('Not found', { status: 404 })
  return new Response(value, {
    headers: {
      'content-type': metadata?.type || 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      // Uploaded SVGs are images, never documents that can run script.
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  })
}

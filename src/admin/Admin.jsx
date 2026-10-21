import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'

async function api(path, { method = 'GET', body, form } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: form || (body ? JSON.stringify(body) : undefined),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

const logoUrl = (c) => (c.logo ? `/api/logo/${c.id}?v=${c.v || 1}` : null)

/* ---------- login ---------- */

function Login({ status, onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/auth/login', { method: 'POST', body: { password } })
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <img src="/images/logo.webp" alt="Taxlead" className="login-logo" />
        <h1>Sign in to admin</h1>
        {status && !status.configured && (
          <p className="notice warn">
            No admin password is set yet. Add an <code>ADMIN_PASSWORD</code> secret to the Cloudflare Pages project (or
            <code>.dev.vars</code> locally) — see README.
          </p>
        )}
        {status && status.configured && !status.kv && (
          <p className="notice warn">The <code>SITE</code> KV namespace isn't bound yet — see README.</p>
        )}
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="current-password" required />
        </label>
        {error && <p className="notice error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a href="/" className="back">← Back to website</a>
      </form>
    </div>
  )
}

/* ---------- clients ---------- */

function AddClient({ onAdded, onError }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  const pick = (f) => {
    setFile(f || null)
    setPreview(f ? URL.createObjectURL(f) : null)
    if (f && !name) setName(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b(logo|final|v\d+)\b/gi, '').trim())
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const form = new FormData()
      form.set('name', name)
      form.set('url', url)
      if (file) form.set('logo', file)
      onAdded(await api('/api/admin/clients', { method: 'POST', form }))
      setName('')
      setUrl('')
      pick(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card add-client" onSubmit={submit}>
      <label
        className={`drop ${preview ? 'has' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          pick(e.dataTransfer.files[0])
        }}
      >
        {preview ? <img src={preview} alt="" /> : <><Icon name="download" size={22} /><span>Drop logo or click<br /><small>PNG, SVG, WebP, JPG · max 1 MB</small></span></>}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif" onChange={(e) => pick(e.target.files[0])} className="visually-hidden" />
      </label>
      <div className="add-fields">
        <label><span>Client name</span><input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} /></label>
        <label><span>Website <small>(optional — logo becomes a link)</small></span><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" /></label>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Uploading…' : 'Add client'}</button>
      </div>
    </form>
  )
}

function ClientRow({ client, index, count, onChange, onMove, onRemove, onReplace }) {
  const fileRef = useRef(null)
  const src = logoUrl(client)
  return (
    <li className="client-row">
      <div className="thumb" onClick={() => fileRef.current?.click()} title="Replace logo">
        {src ? <img src={src} alt="" /> : <span>{client.name.slice(0, 2)}</span>}
        <input ref={fileRef} type="file" className="visually-hidden" tabIndex={-1} accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif" onChange={(e) => e.target.files[0] && onReplace(e.target.files[0])} />
      </div>
      <input className="grow" value={client.name} onChange={(e) => onChange({ name: e.target.value })} aria-label="Client name" />
      <input className="grow" value={client.url || ''} onChange={(e) => onChange({ url: e.target.value })} placeholder="Website (optional)" aria-label="Website" />
      <div className="row-actions">
        <button type="button" className="icon-btn" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
        <button type="button" className="icon-btn" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
        <button type="button" className="icon-btn danger" onClick={onRemove} aria-label="Remove"><Icon name="close" size={16} /></button>
      </div>
    </li>
  )
}

function Clients({ site, update, setSite, onError }) {
  const clients = site.clients
  const patch = (i, p) => update({ clients: clients.map((c, j) => (j === i ? { ...c, ...p } : c)) })
  const move = (i, d) => {
    const next = [...clients]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    update({ clients: next })
  }

  // Server responses carry the saved list; keep any unsaved name/link edits the admin has typed.
  const mergeSaved = (saved) =>
    setSite((cur) => {
      const local = new Map(cur.clients.map((c) => [c.id, c]))
      return {
        ...cur,
        clients: saved.clients.map((c) => (local.has(c.id) ? { ...c, name: local.get(c.id).name, url: local.get(c.id).url } : c)),
      }
    })

  const replace = async (id, file) => {
    try {
      const form = new FormData()
      form.set('id', id)
      form.set('logo', file)
      mergeSaved(await api('/api/admin/clients', { method: 'POST', form }))
    } catch (err) {
      onError(err)
    }
  }

  return (
    <>
      <div className="panel-head">
        <div>
          <h2>Client logos</h2>
          <p>These scroll in the "Our Clients" section. New uploads go live straight away; edits, re-ordering and removals go live when you save.</p>
        </div>
      </div>
      <AddClient onAdded={mergeSaved} onError={onError} />
      {clients.length ? (
        <ul className="card client-list">
          {clients.map((c, i) => (
            <ClientRow
              key={c.id}
              client={c}
              index={i}
              count={clients.length}
              onChange={(p) => patch(i, p)}
              onMove={(d) => move(i, d)}
              onRemove={() => update({ clients: clients.filter((x) => x.id !== c.id) })}
              onReplace={(f) => replace(c.id, f)}
            />
          ))}
        </ul>
      ) : (
        <p className="empty">No clients yet. The logo strip stays hidden on the website until you add one.</p>
      )}
    </>
  )
}

/* ---------- scripts ---------- */

const newScript = () => ({ id: Math.random().toString(36).slice(2, 12), name: 'New script', placement: 'body', enabled: true, code: '' })

function Scripts({ site, update }) {
  const scripts = site.scripts
  const patch = (i, p) => update({ scripts: scripts.map((s, j) => (j === i ? { ...s, ...p } : s)) })

  return (
    <>
      <div className="panel-head">
        <div>
          <h2>Scripts &amp; integrations</h2>
          <p>
            Paste embed code from any provider — chatbots (Tawk.to, Crisp, Tidio, Chatbase, Botpress…), Google Analytics,
            Meta Pixel, WhatsApp widgets. It's added to every public page when enabled; no code changes or redeploys needed.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => update({ scripts: [...scripts, newScript()] })}>+ Add script</button>
      </div>

      {scripts.length === 0 && <p className="empty">No scripts yet. Click <strong>Add script</strong> and paste the snippet your provider gives you.</p>}

      {scripts.map((s, i) => (
        <div key={s.id} className={`card script ${s.enabled ? '' : 'off'}`}>
          <div className="script-head">
            <label className="switch" title={s.enabled ? 'Enabled' : 'Disabled'}>
              <input type="checkbox" checked={s.enabled} onChange={(e) => patch(i, { enabled: e.target.checked })} />
              <span />
            </label>
            <input className="grow script-name" value={s.name} onChange={(e) => patch(i, { name: e.target.value })} aria-label="Script name" />
            <select value={s.placement} onChange={(e) => patch(i, { placement: e.target.value })} aria-label="Placement">
              <option value="body">End of &lt;body&gt; (chat widgets)</option>
              <option value="head">Inside &lt;head&gt; (analytics, verification)</option>
            </select>
            <button
              type="button"
              className="icon-btn danger"
              aria-label="Delete script"
              onClick={() => confirm(`Delete "${s.name}"?`) && update({ scripts: scripts.filter((x) => x.id !== s.id) })}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          <textarea
            value={s.code}
            onChange={(e) => patch(i, { code: e.target.value })}
            spellCheck={false}
            rows={Math.min(16, Math.max(5, s.code.split('\n').length + 1))}
            placeholder={'<!-- paste embed code here -->\n<script src="https://…" async></script>'}
          />
        </div>
      ))}
      <p className="hint">Only paste code from providers you trust — scripts run on your public site with full access to the page.</p>
    </>
  )
}

/* ---------- settings ---------- */

function Settings({ site, update }) {
  const s = site.settings
  const set = (p) => update({ settings: { ...s, ...p } })
  return (
    <>
      <div className="panel-head"><div><h2>Logo strip settings</h2><p>How the client logo animation looks on the website.</p></div></div>
      <div className="card form-grid">
        <label>
          <span>Heading above the logos <small>(leave empty to hide)</small></span>
          <input value={s.marqueeTitle} onChange={(e) => set({ marqueeTitle: e.target.value })} maxLength={200} />
        </label>
        <label>
          <span>Scroll speed — {s.speed} px/s</span>
          <input type="range" min="10" max="120" value={s.speed} onChange={(e) => set({ speed: Number(e.target.value) })} />
        </label>
        <label className="check">
          <input type="checkbox" checked={s.grayscale} onChange={(e) => set({ grayscale: e.target.checked })} />
          <span>Show logos in grayscale (full colour on hover) — keeps mixed logos looking consistent</span>
        </label>
      </div>
    </>
  )
}

/* ---------- shell ---------- */

const TABS = [
  { id: 'clients', label: 'Clients', icon: 'building' },
  { id: 'scripts', label: 'Scripts', icon: 'layers' },
  { id: 'settings', label: 'Settings', icon: 'grid' },
]

function Dashboard({ onSignOut }) {
  const [site, setSite] = useState(null)
  const [saved, setSaved] = useState(null)
  const [tab, setTab] = useState(() => (location.hash.slice(1) in { clients: 1, scripts: 1, settings: 1 } ? location.hash.slice(1) : 'clients'))
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const flash = (msg, kind = 'ok') => {
    setToast({ msg, kind })
    clearTimeout(flash.t)
    flash.t = setTimeout(() => setToast(null), 4000)
  }
  const onError = (err) => (err.status === 401 ? onSignOut() : flash(err.message, 'error'))

  useEffect(() => {
    api('/api/admin/site').then((s) => { setSite(s); setSaved(s) }, onError)
  }, [])

  useEffect(() => { location.hash = tab }, [tab])

  // Server-side changes (uploads) also move the "saved" baseline for clients that already exist there.
  const strip = (s) => s && JSON.stringify({ c: s.clients.map(({ id, name, url }) => [id, name, url || '']), s: s.scripts, t: s.settings })
  const dirty = site && saved && strip(site) !== strip(saved)

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const update = (p) => setSite((s) => ({ ...s, ...p }))
  const setSiteTracked = (fn) => {
    setSite((cur) => {
      const next = fn(cur)
      // A successful upload means the server now holds these clients; keep unsaved text edits pending.
      setSaved((prev) => ({
        ...prev,
        clients: next.clients.map((c) => {
          const p = prev.clients.find((x) => x.id === c.id)
          return p ? { ...c, name: p.name, url: p.url } : c
        }),
      }))
      return next
    })
    flash('Logo uploaded — live on the site within a minute.')
  }

  const save = async () => {
    setSaving(true)
    try {
      const s = await api('/api/admin/site', { method: 'PUT', body: site })
      setSite(s)
      setSaved(s)
      flash('Saved — changes appear on the website within about a minute.')
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    if (dirty && !confirm('You have unsaved changes. Sign out anyway?')) return
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    onSignOut()
  }

  return (
    <div className="shell">
      <aside className="side">
        <img src="/images/logo.webp" alt="Taxlead" className="side-logo" />
        <nav>
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={18} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <a href="/" target="_blank" rel="noopener">View website ↗</a>
          <button onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <main className="main">
        {!site ? (
          <p className="empty">Loading…</p>
        ) : (
          <>
            {tab === 'clients' && <Clients site={site} update={update} setSite={setSiteTracked} onError={onError} />}
            {tab === 'scripts' && <Scripts site={site} update={update} />}
            {tab === 'settings' && <Settings site={site} update={update} />}
          </>
        )}
      </main>

      <div className={`savebar ${dirty ? 'show' : ''}`}>
        <span>You have unsaved changes</span>
        <button className="btn btn-quiet" onClick={() => setSite(saved)}>Discard</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>

      {toast && <div className={`toast ${toast.kind}`} role="status">{toast.msg}</div>}
    </div>
  )
}

export default function Admin() {
  const [status, setStatus] = useState(null)

  const check = () =>
    api('/api/auth/me').then(setStatus, () =>
      setStatus({ authenticated: false, configured: false, kv: false, offline: true }),
    )

  useEffect(() => { check() }, [])

  if (!status) return null
  if (status.offline) {
    return (
      <div className="login-wrap">
        <div className="card login">
          <h1>Admin API not reachable</h1>
          <p className="notice warn">
            The admin panel needs Cloudflare Pages Functions. Locally, run <code>npm run build</code> then <code>npm run cf:dev</code> instead of <code>npm run dev</code>.
          </p>
        </div>
      </div>
    )
  }
  if (!status.authenticated) return <Login status={status} onDone={check} />
  return <Dashboard onSignOut={() => setStatus({ ...status, authenticated: false })} />
}

import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import Gradient from './Gradient.jsx'
import { company, nav, serviceGroups, exclusive, industries, team, stats, process, sampleClients } from './data.js'

/* ---------- hooks ---------- */

// Fades sections in as they scroll into view.
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// Captures the browser's install prompt so we can offer our own "Install app" button.
function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => setDeferred(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])
  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }
  return [Boolean(deferred), install]
}

// Client list and settings are injected into the page at the edge (functions/_middleware.js).
function useSiteData() {
  const injected = typeof window !== 'undefined' ? window.__TAXLEAD__ : null
  if (injected) return injected
  return { clients: import.meta.env.DEV ? sampleClients : [], settings: {} }
}

/* ---------- pieces ---------- */

// Stripe-style chevron that grows a tail on hover.
function Arrow() {
  return (
    <svg className="hover-arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path className="ha-line" d="M0 5h7" />
      <path className="ha-tip" d="M1 1l4 4-4 4" />
    </svg>
  )
}

function Logo({ variant = 'dark' }) {
  return <img src={variant === 'light' ? '/images/logo-footer.webp' : '/images/logo.webp'} alt="Taxlead" className="logo" />
}

function Header({ canInstall, onInstall }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="brand" aria-label="Taxlead home" onClick={() => setOpen(false)}>
          <Logo />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`}>{n.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          {canInstall && (
            <button className="btn btn-quiet btn-sm hide-sm" onClick={onInstall}>
              Install app <Arrow />
            </button>
          )}
          <a href="#contact" className="btn btn-dark btn-sm hide-sm">Contact us <Arrow /></a>
          <button
            className="menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div className={`sheet ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <nav className="sheet-panel" aria-label="Mobile" onClick={(e) => e.stopPropagation()}>
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {n.label} <Arrow />
            </a>
          ))}
          <a href="#contact" className="btn btn-primary" onClick={() => setOpen(false)}>Contact us <Arrow /></a>
          {canInstall && (
            <button className="btn btn-quiet" onClick={() => { setOpen(false); onInstall() }}>
              <Icon name="install" size={18} /> Install app
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  const steps = [
    { icon: 'building', label: 'Company incorporated', meta: 'Private Limited' },
    { icon: 'check', label: 'GST & TDS returns', meta: 'Filed on time' },
    { icon: 'ledger', label: 'Payroll processed', meta: 'PF · ESI · PT' },
    { icon: 'chart', label: 'MIS report', meta: 'Ready to review' },
  ]
  return (
    <section className="hero" id="top">
      <div className="hero-gradient" aria-hidden="true">
        <Gradient />
      </div>
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-eyebrow">Tax · Compliance · Advisory — Kochi, India &amp; the Middle East</p>
          <h1>
            Business infrastructure to start, run and grow your company.{' '}
            <span className="h1-sub">
              Incorporate, file taxes, run payroll and stay compliant — with one team handling it all.
            </span>
          </h1>
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary">Get started <Arrow /></a>
            <a href={company.profilePdf} className="btn btn-quiet" target="_blank" rel="noopener">
              Company profile <Arrow />
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="mock dash">
            <div className="mock-bar"><i /><i /><i /><span>taxlead · compliance</span></div>
            <div className="dash-body">
              <div className="dash-head">
                <div><small>This quarter</small><strong>All filings on track</strong></div>
                <span className="pill ok">Healthy</span>
              </div>
              <ul className="dash-list">
                {steps.map((s) => (
                  <li key={s.label}>
                    <span className="dl-ic"><Icon name={s.icon} size={16} /></span>
                    <span className="dl-text"><strong>{s.label}</strong><small>{s.meta}</small></span>
                    <span className="dl-ok"><Icon name="tick" size={13} strokeWidth="2.6" /></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mock phone">
            <div className="phone-notch" />
            <div className="phone-body">
              <span className="phone-ic"><Icon name="cfo" size={20} /></span>
              <strong>Your eCFO</strong>
              <small>Monthly review is ready</small>
              <div className="phone-chart">
                {[38, 52, 46, 64, 58, 76, 88].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
              </div>
              <span className="phone-btn">Open report</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClientMarquee() {
  const { clients, settings } = useSiteData()
  const setRef = useRef(null)
  const [duration, setDuration] = useState(40)
  const speed = settings?.speed || 40

  // Repeat short lists so one copy of the track is always wider than the screen.
  const reps = clients.length ? Math.ceil(12 / clients.length) : 0
  const row = Array.from({ length: reps }, () => clients).flat()

  useEffect(() => {
    const el = setRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDuration(Math.max(10, el.scrollWidth / speed)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [speed, row.length])

  if (!clients.length) return null

  const item = (c, i, hidden) => {
    const inner = c.logo ? <img src={c.logo} alt={hidden ? '' : c.name} loading="lazy" /> : <span className="wordmark">{c.name}</span>
    return c.url ? (
      <a key={i} className="client" href={c.url} target="_blank" rel="noopener nofollow" tabIndex={hidden ? -1 : undefined} title={c.name}>{inner}</a>
    ) : (
      <span key={i} className="client" title={c.name}>{inner}</span>
    )
  }

  return (
    <section className="clients" aria-label="Our clients">
      <div className="container">
        {settings?.marqueeTitle !== '' && (
          <p className="clients-title">{settings?.marqueeTitle || 'Trusted by growing businesses across India and the Middle East'}</p>
        )}
      </div>
      <div className={`marquee ${settings?.grayscale === false ? '' : 'mono'}`} style={{ '--dur': `${duration}s` }}>
        <div className="marquee-track">
          <div className="marquee-set" ref={setRef}>{row.map((c, i) => item(c, i, i >= clients.length))}</div>
          <div className="marquee-set" aria-hidden="true">{row.map((c, i) => item(c, i, true))}</div>
        </div>
      </div>
    </section>
  )
}

function ServiceMock({ id }) {
  if (id === 'start') {
    const rows = [['Name reservation', 'done'], ['DSC & DIN', 'done'], ['SPICe+ incorporation', 'done'], ['PAN, TAN & bank account', 'now']]
    return (
      <div className="mock mini-ui">
        <div className="mu-head"><strong>Incorporation tracker</strong><span className="pill">Private Limited</span></div>
        <div className="progress"><i style={{ width: '78%' }} /></div>
        <ul className="mu-steps">
          {rows.map(([t, s]) => (
            <li key={t} className={s}><span className="mu-dot">{s === 'done' && <Icon name="tick" size={11} strokeWidth="3" />}</span>{t}</li>
          ))}
        </ul>
      </div>
    )
  }
  if (id === 'manage') {
    const rows = [['GSTR-1', 'Filed', 'ok'], ['TDS payment', 'Paid', 'ok'], ['PF & ESI', 'Filed', 'ok'], ['GSTR-3B', 'Due in 4 days', 'due']]
    return (
      <div className="mock mini-ui">
        <div className="mu-head"><strong>Compliance calendar</strong><span className="pill">This month</span></div>
        <ul className="mu-rows">
          {rows.map(([t, s, k]) => (
            <li key={t}><span>{t}</span><span className={`pill ${k}`}>{s}</span></li>
          ))}
        </ul>
      </div>
    )
  }
  const bars = [[42, 30], [50, 34], [47, 33], [58, 37], [63, 39], [72, 42]]
  return (
    <div className="mock mini-ui">
      <div className="mu-head"><strong>MIS — monthly view</strong><span className="pill">Apr – Sep</span></div>
      <div className="mu-chart">
        {bars.map(([a, b], i) => (
          <div key={i} className="mu-col"><i style={{ height: `${a}%` }} /><i style={{ height: `${b}%` }} /></div>
        ))}
      </div>
      <div className="mu-legend"><span><i className="l1" />Revenue</span><span><i className="l2" />Expenses</span></div>
    </div>
  )
}

function Services() {
  const [active, setActive] = useState(serviceGroups[0].id)
  const group = serviceGroups.find((g) => g.id === active)
  const wideTail = group.items.length % 3 === 2
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">What we do</span>
          <h2>Flexible solutions for every stage of your business. <span className="muted">Start right, stay compliant and make better decisions with one team behind you.</span></h2>
        </div>

        <div className="tabs reveal" role="tablist" aria-label="Service categories">
          {serviceGroups.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={active === g.id}
              className={active === g.id ? 'active' : ''}
              onClick={() => setActive(g.id)}
            >
              {g.title}
            </button>
          ))}
        </div>

        <div className="bento" role="tabpanel" key={group.id}>
          <article className="tile feature">
            <div>
              <h3>{group.title}</h3>
              <p>{group.blurb}</p>
              <a href="#contact" className="link">Talk to an expert <Arrow /></a>
            </div>
            <ServiceMock id={group.id} />
          </article>
          {group.items.map((s, i) => (
            <article
              key={s.title}
              className={`tile ${wideTail && i >= group.items.length - 2 ? 'wide' : ''}`}
              style={{ '--i': i }}
            >
              <span className="tile-ic"><Icon name={s.icon} /></span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="stats-band">
      <div className="stats-glow" aria-hidden="true" />
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker on-dark">Built for owners</span>
          <h2>The back office behind growing businesses. <span className="muted">Chartered Accountants, lawyers and MBAs working as one team for you.</span></h2>
        </div>
        <div className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat reveal">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Exclusive() {
  return (
    <section className="section" id="exclusive">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Exclusive services</span>
          <h2>Go beyond compliance. <span className="muted">Premium programmes for businesses that want strategic finance support without the overhead.</span></h2>
        </div>
        <div className="columns">
          {exclusive.map((e, i) => (
            <article key={e.title} className="column reveal">
              <span className="col-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="tile-ic"><Icon name={e.icon} size={24} /></span>
              <h3>{e.title}</h3>
              <p>{e.text}</p>
              <a href="#contact" className="link">Talk to us <Arrow /></a>
            </article>
          ))}
        </div>

        <div className="process reveal">
          <h3 className="process-title">How we work</h3>
          <ol>
            {process.map((p, i) => (
              <li key={p.title}>
                <span className="step">{i + 1}</span>
                <div><strong>{p.title}</strong><p>{p.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section tinted" id="about">
      <div className="container about-grid">
        <div className="reveal">
          <span className="kicker">About us</span>
          <h2>One partner for the entire life of your business.</h2>
        </div>
        <div className="reveal">
          <p className="lead">
            {company.legalName} is a business services and consulting firm based in Kochi. We support businesses from
            the day they are incorporated through every stage of running them — including statutory filings and
            compliance under labour law, HR operations, corporate law and allied statutes.
          </p>
          <p>
            Our team of Chartered Accountants, lawyers and MBAs serves clients across India and the Middle East,
            combining technical depth with practical, owner-friendly advice.
          </p>
          <div className="industries">
            <span className="ind-label">Industries we serve</span>
            <div className="chips">
              {industries.map((i) => <span key={i} className="chip">{i}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Team() {
  const initials = (n) =>
    n.replace(/^CA\.\s*/, '').split(' ').filter((w) => /^[A-Z][a-z]/.test(w)).slice(0, 2).map((w) => w[0]).join('')
  return (
    <section className="section" id="team">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Leadership</span>
          <h2>The people behind Taxlead.</h2>
        </div>
        <div className="team">
          {team.map((m) => (
            <article key={m.name} className="member reveal">
              <span className="avatar">{initials(m.name)}</span>
              <div>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // The form opens the visitor's email app with the enquiry pre-filled.
  const submit = (e) => {
    e.preventDefault()
    const subject = `Enquiry${form.service ? ` – ${form.service}` : ''} from ${form.name}`
    const body = `Name: ${form.name}\nPhone: ${form.phone}\nService: ${form.service || '—'}\n\n${form.message}`
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const allServices = [...serviceGroups.flatMap((g) => g.items), ...exclusive].map((s) => s.title)

  return (
    <section className="section" id="contact">
      <div className="container contact-grid">
        <div className="reveal">
          <span className="kicker">Contact us</span>
          <h2>Let's talk about your business.</h2>
          <p className="lead">Tell us what you need and our team will get back to you.</p>

          <ul className="contact-list">
            <li>
              <span className="tile-ic"><Icon name="phone" size={20} /></span>
              <div>
                <small>Call</small>
                <a href={company.phone.href}>{company.phone.label}</a>
                {company.mobiles.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
              </div>
            </li>
            <li>
              <span className="tile-ic"><Icon name="mail" size={20} /></span>
              <div>
                <small>Email</small>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </div>
            </li>
            <li>
              <span className="tile-ic"><Icon name="pin" size={20} /></span>
              <div>
                <small>Visit</small>
                <a href={company.mapUrl} target="_blank" rel="noopener">
                  {company.address.map((l) => <span key={l} className="block">{l}</span>)}
                </a>
              </div>
            </li>
          </ul>
        </div>

        <form className="form reveal" onSubmit={submit}>
          <h3>Send an enquiry</h3>
          <label>
            <span>Your name</span>
            <input required value={form.name} onChange={set('name')} autoComplete="name" />
          </label>
          <label>
            <span>Phone</span>
            <input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
          </label>
          <label>
            <span>Service of interest</span>
            <select value={form.service} onChange={set('service')}>
              <option value="">Select a service</option>
              {allServices.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            <span>Message</span>
            <textarea rows="4" required value={form.message} onChange={set('message')} />
          </label>
          <button className="btn btn-primary" type="submit">Send enquiry <Arrow /></button>
          <small className="form-note">Opens your email app with the message ready to send.</small>
        </form>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="section cta">
      <div className="container cta-grid reveal">
        <div>
          <h2>Ready to get started?</h2>
          <p className="lead">Talk to our team about incorporation, compliance or a full eCFO programme — we'll recommend exactly what your business needs.</p>
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary">Contact us <Arrow /></a>
            <a href={company.phone.href} className="btn btn-quiet">Call {company.phone.label} <Arrow /></a>
          </div>
        </div>
        <div className="cta-cards">
          <a className="cta-card" href={company.profilePdf} target="_blank" rel="noopener">
            <span className="tile-ic"><Icon name="download" size={20} /></span>
            <strong>Company profile</strong>
            <p>Download our services, team and credentials as a PDF.</p>
            <span className="link">Download <Arrow /></span>
          </a>
          <a className="cta-card" href={company.mapUrl} target="_blank" rel="noopener">
            <span className="tile-ic"><Icon name="pin" size={20} /></span>
            <strong>Visit our office</strong>
            <p>{company.address.slice(0, 2).join(', ')}.</p>
            <span className="link">Get directions <Arrow /></span>
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{company.tagline}</p>
          <div className="social">
            {company.social.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener" aria-label={s.name}>
                <Icon name={s.icon} size={18} />
              </a>
            ))}
          </div>
        </div>
        {serviceGroups.map((g) => (
          <div key={g.id}>
            <h4>{g.title}</h4>
            {g.items.slice(0, 5).map((s) => <a key={s.title} href="#services">{s.title}</a>)}
          </div>
        ))}
        <div>
          <h4>Company</h4>
          {nav.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
          <a href={company.profilePdf} target="_blank" rel="noopener">Company profile (PDF)</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</span>
        <span>
          <a href={company.phone.href}>{company.phone.label}</a> · <a href={`mailto:${company.email}`}>{company.email}</a>
        </span>
      </div>
    </footer>
  )
}

export default function App() {
  useReveal()
  const [canInstall, install] = useInstallPrompt()
  return (
    <>
      <Header canInstall={canInstall} onInstall={install} />
      <main>
        <Hero />
        <ClientMarquee />
        <Services />
        <Stats />
        <Exclusive />
        <About />
        <Team />
        <Contact />
        <Cta />
      </main>
      <Footer />
    </>
  )
}

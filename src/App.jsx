import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import Gradient from './Gradient.jsx'
import logoUrl from './assets/logo.webp'
import logoLightUrl from './assets/logo-light.webp'
import { company, nav, serviceGroups, about, teamIntro, team, clientsIntro, sampleClients } from './data.js'

/* ---------- hooks ---------- */

// Scroll animations modelled on the original site (AOS): elements with data-anim="fade-right | fade-left |
// zoom-in | fade-up" animate whenever they come into view, and reset once fully off screen so they play
// again next time. Clicking a menu link replays the animations of the section it jumps to.
function useScrollAnimations() {
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-anim]')]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.12) e.target.classList.add('in')
          else if (!e.isIntersecting) e.target.classList.remove('in')
        }),
      { threshold: [0, 0.12] },
    )
    els.forEach((el) => io.observe(el))

    const replay = (ev) => {
      const link = ev.target.closest('a[href^="#"]')
      const target = link && link.getAttribute('href').length > 1 && document.querySelector(link.getAttribute('href'))
      if (!target) return
      const section = target.closest('section') || target
      const items = [...section.querySelectorAll('[data-anim]')]
      if (section.matches('[data-anim]')) items.push(section)
      items.forEach((el) => {
        // Jump back to the start state instantly (no fade-out), so the entrance plays again from scratch.
        el.classList.add('anim-reset')
        el.classList.remove('in')
        void el.offsetWidth
        el.classList.remove('anim-reset')
        // Re-observing reports the element's current visibility, which re-adds `in` for anything on screen.
        io.unobserve(el)
        io.observe(el)
      })
    }
    document.addEventListener('click', replay)
    return () => {
      io.disconnect()
      document.removeEventListener('click', replay)
    }
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
  return <img src={variant === 'light' ? logoLightUrl : logoUrl} alt="Taxlead" className="logo" />
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

  const links = nav.filter((n) => n.id !== 'contact')

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="brand" aria-label="Taxlead home" onClick={() => setOpen(false)} data-anim="fade-right">
          <Logo />
        </a>
        <nav className="nav-links" aria-label="Primary" data-anim="fade-left">
          {links.map((n) => (
            <a key={n.id} href={`#${n.id}`}>{n.label}</a>
          ))}
        </nav>
        <div className="header-actions" data-anim="fade-left">
          {canInstall && (
            <button className="btn btn-quiet btn-sm hide-sm" onClick={onInstall}>
              Install app <Arrow />
            </button>
          )}
          <a href="#contact" className="btn btn-dark btn-sm hide-sm">Contact Us <Arrow /></a>
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
          {links.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {n.label} <Arrow />
            </a>
          ))}
          <a href="#contact" className="btn btn-primary" onClick={() => setOpen(false)}>Contact Us <Arrow /></a>
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
  const compliance = ['Income Tax', 'GST', 'PF', 'ESI', 'Company Law']
  return (
    <section className="hero" id="top">
      <div className="hero-gradient" aria-hidden="true">
        <Gradient />
      </div>
      <div className="container hero-grid">
        <div className="hero-copy" data-anim="fade-right">
          <p className="hero-eyebrow">{company.legalName}</p>
          <h1>{company.tagline}</h1>
          <p className="lead">{company.taglineMore}</p>
          <div className="hero-ctas">
            <a href="#exclusive" className="btn btn-primary">Exclusive Services <Arrow /></a>
            <a href={company.profilePdf} className="btn btn-quiet" target="_blank" rel="noopener">
              Download Our Profile <Arrow />
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true" data-anim="fade-left">
          <div className="mock dash">
            <div className="mock-bar"><i /><i /><i /><span>taxlead.in</span></div>
            <div className="dash-body">
              <div className="dash-head">
                <div><small>Manage</small><strong>Statutory Filing and compliances</strong></div>
              </div>
              <ul className="dash-list">
                {compliance.map((s) => (
                  <li key={s}>
                    <span className="dl-ic"><Icon name="check" size={16} /></span>
                    <span className="dl-text"><strong>{s}</strong></span>
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
              <strong>eCFO Programme</strong>
              <small>A Virtual CFO programme designed by Taxlead</small>
              <div className="phone-chart">
                {[38, 52, 46, 64, 58, 76, 88].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
              </div>
              <span className="phone-btn">Exclusive Services</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head center" data-anim="zoom-in">
          <span className="kicker">Our Services</span>
          <h2>What We Do</h2>
        </div>

        <ol className="timeline">
          {serviceGroups.map((g, i) => (
            <li
              key={g.id}
              id={g.id}
              className={`tl-item ${i % 2 ? 'right' : 'left'}`}
              data-anim={g.anim}
              style={{ '--row': i + 1 }}
            >
              <span className="tl-dot" aria-hidden="true">{i + 1}</span>
              <article className="tl-card">
                <span className="tl-icon" aria-hidden="true"><Icon name={g.icon} size={28} /></span>
                <h3>{g.title}</h3>
                <ul className="tl-list">
                  {g.items.map((s, j) => (
                    <li key={s.title} style={{ '--j': j }}>
                      <span className="tl-tick" aria-hidden="true"><Icon name="tick" size={12} strokeWidth="3" /></span>
                      <div>
                        <strong>{s.title}</strong>
                        {s.text && <p>{s.text}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section tinted" id="about">
      <div className="container about-grid">
        <div data-anim="fade-right">
          <span className="kicker">Taxlead Business Solutions</span>
          <h2>About Us</h2>
        </div>
        <div data-anim="zoom-in">
          <p className="lead">{about}</p>
          <a href={company.profilePdf} className="btn btn-primary" target="_blank" rel="noopener">
            Download Our Profile <Arrow />
          </a>
        </div>
      </div>
    </section>
  )
}

function Team() {
  const initials = (n) =>
    n.replace(/^CA\.\s*/, '').split(' ').filter((w) => /^[A-Z][a-z]/.test(w)).slice(0, 2).map((w) => w[0]).join('')
  return (
    <section className="team-band" id="team">
      <div className="band-glow" aria-hidden="true" />
      <div className="container">
        <div className="section-head" data-anim="zoom-in">
          <span className="kicker on-dark">CAs · Lawyers · MBAs</span>
          <h2>Our Team</h2>
          <p className="lead">{teamIntro}</p>
        </div>
        <div className="team">
          {team.map((m, i) => (
            <article key={m.name} className="member" data-anim="zoom-in" style={{ '--delay': `${i * 120}ms` }}>
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
    <div className="clients" aria-label="Our clients" data-anim="fade-up">
      {settings?.marqueeTitle && <p className="clients-title">{settings.marqueeTitle}</p>}
      <div className={`marquee ${settings?.grayscale === false ? '' : 'mono'}`} style={{ '--dur': `${duration}s` }}>
        <div className="marquee-track">
          <div className="marquee-set" ref={setRef}>{row.map((c, i) => item(c, i, i >= clients.length))}</div>
          <div className="marquee-set" aria-hidden="true">{row.map((c, i) => item(c, i, true))}</div>
        </div>
      </div>
    </div>
  )
}

function Clients() {
  return (
    <section className="section" id="clients">
      <div className="container">
        <div className="section-head center" data-anim="zoom-in">
          <span className="kicker">Industries</span>
          <h2>Our Clients</h2>
          <p className="lead">{clientsIntro}</p>
        </div>
      </div>
      <ClientMarquee />
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

  return (
    <section className="section tinted" id="contact">
      <div className="container">
        <div className="section-head center" data-anim="zoom-in">
          <span className="kicker">Contact Us</span>
          <h2>Get in Touch</h2>
        </div>

        <div className="contact-cards">
          <div className="contact-card" data-anim="fade-right">
            <span className="tile-ic"><Icon name="mail" size={20} /></span>
            <small>Email</small>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </div>
          <div className="contact-card" data-anim="zoom-in">
            <span className="tile-ic"><Icon name="phone" size={20} /></span>
            <small>Phone</small>
            <a href={company.phone.href}>{company.phone.label}</a>
            {company.mobiles.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
          </div>
          <div className="contact-card" data-anim="fade-left">
            <span className="tile-ic"><Icon name="pin" size={20} /></span>
            <small>Address</small>
            <a href={company.mapUrl} target="_blank" rel="noopener">
              {company.address.map((l) => <span key={l} className="block">{l}</span>)}
            </a>
          </div>
        </div>

        <form className="form" onSubmit={submit} data-anim="fade-up">
          <h3>Send us a message</h3>
          <div className="form-row">
            <label>
              <span>Your name</span>
              <input required value={form.name} onChange={set('name')} autoComplete="name" />
            </label>
            <label>
              <span>Phone</span>
              <input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            </label>
          </div>
          <label>
            <span>Service</span>
            <select value={form.service} onChange={set('service')}>
              <option value="">Select a service</option>
              {serviceGroups.map((g) => (
                <optgroup key={g.id} label={g.title}>
                  {g.items.map((s) => <option key={s.title}>{s.title}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            <span>Message</span>
            <textarea rows="4" required value={form.message} onChange={set('message')} />
          </label>
          <button className="btn btn-primary" type="submit">Send <Arrow /></button>
          <small className="form-note">Opens your email app with the message ready to send to {company.email}.</small>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand" data-anim="fade-up">
          <Logo />
          <p>{company.tagline}. {company.taglineMore}</p>
          <div className="social">
            {company.social.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener" aria-label={s.name}>
                <Icon name={s.icon} size={18} />
              </a>
            ))}
          </div>
        </div>
        <div data-anim="fade-up">
          <h4>Quick Links</h4>
          {nav.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
        </div>
        <div data-anim="fade-up">
          <h4>Contact Info</h4>
          <a href={company.mapUrl} target="_blank" rel="noopener">{company.address.join(' ')}</a>
          <a href={company.phone.href}>{company.phone.label}</a>
          {company.mobiles.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Copyright © {new Date().getFullYear()} {company.legalName}</span>
      </div>
    </footer>
  )
}

export default function App() {
  useScrollAnimations()
  const [canInstall, install] = useInstallPrompt()
  return (
    <>
      <Header canInstall={canInstall} onInstall={install} />
      <main>
        <Hero />
        <Services />
        <About />
        <Team />
        <Clients />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

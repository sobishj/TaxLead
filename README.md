# Taxlead Business Solutions — website + admin

React + Vite PWA for [taxlead.in](https://www.taxlead.in/), styled after stripe.com, with an admin panel at **`/admin`** for:

- **Client logos** — upload names, logos and links for the animated "Trusted by" strip under the hero. You can re-order, rename, replace or remove them.
- **Scripts & integrations** — paste any embed code (chatbots like Tawk.to, Crisp, Tidio, Chatbase, Botpress; Google Analytics; Meta Pixel; WhatsApp widgets) and switch each one on or off. You don't edit source code or redeploy.
- **Settings** — the logo-strip heading, its scroll speed, and grayscale or colour logos.

Everything runs on Cloudflare's **free** plan: Pages hosts the site, Pages Functions run the API, and Workers KV stores the clients, scripts and logo files.

## How it works

| Piece | Where |
|---|---|
| Public site | `index.html`, `src/App.jsx`, `src/styles.css`, content in `src/data.js` |
| Hero gradient (WebGL) | `src/Gradient.jsx` |
| Admin panel | `admin/index.html`, `src/admin/` |
| API (login, uploads, saving) | `functions/api/` with shared code in `server/` |
| Script and logo injection | `functions/_middleware.js` adds the client list and any enabled scripts to every public page at the edge |

Admin changes appear on the live site **within about a minute**, because KV reads are cached at the edge for 60 seconds.

## Deploy to Cloudflare Pages (free)

You need a Cloudflare account. Run these once:

```bash
npm install
npx wrangler login

# 1. Create the storage and paste the id it prints into wrangler.toml (replace REPLACE_WITH_KV_NAMESPACE_ID)
npx wrangler kv namespace create SITE

# 2. Build and deploy. The first run creates the "taxlead" Pages project.
npm run deploy

# 3. Set the admin password (use a long, unique one), then deploy again so it takes effect
npx wrangler pages secret put ADMIN_PASSWORD --project-name taxlead
npm run deploy
```

Optional: add a `SESSION_SECRET` secret (any long random string) the same way. It lets you change the password without signing everyone out, and the reverse.

Then, in the Cloudflare dashboard → **Workers & Pages → taxlead → Custom domains**, add `taxlead.in` and `www.taxlead.in`.

**Auto-deploy from Git instead:** push the repo to GitHub, then in the dashboard go to **Workers & Pages → Create → Pages → Connect to Git**. Use build command `npm run build` and output directory `dist`. The KV binding is read from `wrangler.toml`. Add `ADMIN_PASSWORD` under **Settings → Variables and Secrets**, marked as a *Secret*.

### Free-tier limits (generous for a company site)

- Pages Functions: 100,000 requests/day. Static files such as JS, CSS and images don't count.
- KV: 100,000 reads/day, 1,000 writes/day and 1 GB of storage. Each admin save or upload counts as one or two writes.
- Each logo can be up to 1 MB.

## Develop locally

```bash
npm run dev                      # fast UI work on http://localhost:5173 (sample logos, no admin API)

cp .dev.vars.example .dev.vars   # set ADMIN_PASSWORD for local testing
npm run build && npm run cf:dev  # full stack incl. /admin and the API on http://localhost:8788
```

Locally, KV data is stored in `.wrangler/` and never touches production.

## Using the admin panel

1. Go to `https://your-domain/admin` and sign in with `ADMIN_PASSWORD`. Sessions last 12 hours.
2. **Clients:** drop a logo onto the box (PNG or SVG with a transparent background looks best), check the name, and click *Add client*. Click a thumbnail to replace a logo. Name, link and order changes go live when you click **Save changes**.
3. **Scripts:** click *Add script*, paste the provider's snippet and pick where it goes:
   - *End of body* for chat widgets.
   - *Head* for analytics or site verification.

   Use the switch to turn a script off without deleting it. Save when you're done.

> Scripts run on your public site with full access to the page, so only paste code from providers you trust, and keep the admin password private.

## Other notes

- The contact form opens the visitor's email app with the enquiry filled in. To receive submissions directly, point it at Formspree or Web3Forms, or add another Pages Function.
- Logos live in `src/assets/` (header/footer/admin). They are imported through Vite, so a replaced logo gets a new hashed URL and is never served stale from cache. App and browser icons (`public/favicon.ico`, `icon.svg`, `pwa-*.png`, `apple-touch-icon-180x180.png`, `maskable-icon-512x512.png`) are generated from the logo mark — replace those files to change them.

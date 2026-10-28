# LUBEMAX — Marketing Site (original concept redesign)

A polished, responsive single-page site for **LUBEMAX Lubricants Pvt. Ltd.**, built as an
original redesign inspired by [lubemax.in](https://lubemax.in/) — same facts, new design.

- **Stack:** HTML + CSS + vanilla JavaScript only. No frameworks, no libraries, no build step, no external fonts or CDNs.
- **Design direction:** deep teal (`#05232a → #12606e`) + warm amber (`#f2a32c`) on crisp neutral whites; system type stacks; mono-face technical labels; an oil-drop / viscosity motif (animated SVG droplet, pillar ticker, fluid gradients).

## Run it

Any static server — or just open the file:

```bash
# option 1 — open directly
open index.html            # macOS
xdg-open index.html        # Linux
start index.html           # Windows

# option 2 — tiny local server (recommended)
python3 -m http.server 8000
# then visit http://localhost:8000
```

No installation, no compilation.

## Files

| File             | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `index.html`     | Semantic markup: header/nav, hero, ticker, products, why, brands, applications, about, contact, footer |
| `css/styles.css` | Full design system (tokens, components, responsive, reduced-motion, print) |
| `js/main.js`     | Product data + tab UI, mobile menu, scroll-spy, reveal animations, counters, form validation, WhatsApp hand-off |
| `images/`        | Photography used through `<img>` tags across hero, products, applications and about |

## Imagery

Every visual on the page is a real `<img>` element (lazy-loaded, `alt`-labelled, `object-fit: cover`):

- **Hero / products / facility / automotive / agriculture / mining / industries** — original AI-generated brand photography, colour-graded to the teal + amber palette (prompts kept reproducible; no real brands or logos appear).
- **Construction** — StockCake free stock (excavator at sunset).
- **Transport** — Pexels free licence (cargo truck on an Indian highway).
- **Marine** — engine-room photo via image search.
- **Machinery** — gear-macro photo via image search.

Swap any file in `images/` for your own shot — the layout only relies on the filenames.

Performance: images are downscaled to display size and re-compressed (1.7 MB → 0.66 MB total), progressive JPEG, lazy-loaded with explicit `width`/`height` (no layout shift), hero preloaded with `fetchpriority=high`.

## What was taken from the reference (lubemax.in)

- Tagline & positioning: *Maximum protection. Maximum performance.* — “Indian engineering, global ambition”.
- Stats: 10+ years, 500+ dealers, 250+ products, 100,000+ customers; established 2015.
- Brands: **LUBEFAST**, **LUBEMAX**, **SKN** with their one-line positioning.
- Products shown: 4T Engine Oil · Diesel & Petrol Engine Oil · Tractor/Off-Highway Engine Oil · Gear Oil · Hydraulic & Agriculture Oil · Transmission Oil · Coolant (descriptions from the reference).
- Applications: Automotive, Agriculture, Mining, Industries, Construction, Transport, Marine, Machinery (copy from the reference).
- About: vision, mission, 4-stage manufacturing process, 2015→2026 timeline.
- Contacts: **+91 91115 55812** (call), **lubemaxlubricants@gmail.com** (email), **+91 87600 11113** (WhatsApp enquiries), enquiry form fields (name, phone, email, company, city, product, purpose, message).

## Placeholders (must be verified before launch)

Search the code for `PLACEHOLDER`. They mark:

- Registered office address (not published on the reference site).
- Certification cards (ISO / Lab) — the reference itself labels these as placeholders.
- Google Maps embed on the contact panel.
- Social profile links.
- “Grease & Additives” product card (a category the reference lists on its enquiry form but never details).

Product data lives in one array at the top of `js/main.js` (`PRODUCTS`) — add grades, pack sizes or new SKUs there once verified.

## Interactions (all vanilla JS)

- Photo-led cards: product packs, industry shots and the facility image, with hover zoom and gradient scrims.
- Easy scrolling: native smooth anchors + scroll-padding, lightweight hero parallax, floating back-to-top button that appears after the hero, gentler reveal transitions — all disabled under `prefers-reduced-motion`.
- Mobile burger menu (ARIA `aria-expanded`, closes on Escape / link / breakpoint change, body scroll lock).
- Accessible product tabs (roving tabindex + arrow/Home/End keys, `aria-selected`, live panel label).
- Scroll-spy nav highlighting + scroll progress bar + sticky header shadow.
- Scroll-reveal with stagger, count-up stats, marquee pillar ticker — all disabled under `prefers-reduced-motion`.
- Enquiry form: full client-side validation (name, ≥10-digit phone, optional email format, purpose required, 800-char message) with inline `aria-invalid` errors, focus management, and a formatted `wa.me` hand-off. Nothing is stored; there is no backend.
- Keyboard-friendly everywhere: skip link, visible amber focus rings, logical tab order.

## Quality checks performed

- 69/69 functional assertions against the real DOM (tabs, keyboard nav, validation matrix, WhatsApp payload, reset, deep links, imagery wiring) via jsdom.
- Browser-verified at 390 / 834 / 1100–1440 px: zero horizontal overflow, no console/page errors, nav toggling confirmed (Playwright screenshots in `../shots/`).
- HTML: balanced tags, unique ids, all `label[for]` / `aria-describedby` / `aria-controls` targets exist.
- CSS: balanced braces, no undefined custom properties; text colors hold ≥ 4.5:1 contrast.

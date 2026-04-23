# 3D Orthotics Website: Project Guide

## Company Overview

**3D Orthotics** is a veteran-owned (SDVOSB & WOSB) medical device company that provides HIPAA-compliant digital orthotic scanning for VA and DOD hospitals. The flagship product is **AccuScan DP**, an iPad-based 3D foot scanning system that de-identifies patient data before transmission.

- Phone: **844-FOOT-911**
- Certifications: SDVOSB, WOSB, FDA Registered (RN#3015146490), SAM Registered (CAGE: 9PXW1), HIPAA Compliant
- Award: **Most Improved Product: VA Podiatry Nationally**

## Audience & Conversion Model

This is **not a D2C funnel**. The site sells to **doctors arriving from ads**; veterans use it as a utility surface for order tracking, adjustments, and FAQ.

- **Value prop framing**: "We take these VA responsibilities off your plate" — a handoff model, not a "we improve metric X by Y%" model.
- **Avoid sales-y CTAs**: no "Schedule a Demo" / "Book a Call". Use consultative, peer-to-peer framings.
- Marketing copy is already approved — the design is what we're improving, not the content.

---

## Brand Identity

### Colors (from the logo)

| Token           | Hex / Value               | Usage                              |
|-----------------|---------------------------|------------------------------------|
| `--navy`        | `#00549d`                 | Primary brand: dark blue "3D"      |
| `--navy-mid`    | `#0068bb`                 | Hover / mid-blue accent            |
| `--cyan`        | `#00aec7`                 | Secondary brand: "ORTHOTICS"       |
| `--cyan-dim`    | `#0090a8`                 | Dimmed cyan for subtle accents     |
| `--cyan-light`  | `#e8f7fa`                 | Very light blue tints              |
| `--bg`          | `#ffffff`                 | Page background: pure white        |
| `--surface`     | `#f8f9fc`                 | Section backgrounds, cards         |
| `--surface-2`   | `#eff2f7`                 | Deeper surface variant             |
| `--text`        | `#121820`                 | Primary text: near-black           |
| `--text-mid`    | `#3a4a5c`                 | Secondary text                     |
| `--text-dim`    | `#6b7d92`                 | Muted / caption text               |
| `--text-faint`  | `rgba(33, 34, 38, 0.08)`  | Borders: nearly invisible          |

### Typography

| Token             | Font                                       | Usage                    |
|-------------------|--------------------------------------------|--------------------------|
| `--font-display`  | `'Ethnocentric', 'Inter', sans-serif`      | Headings, display text   |
| `--font-body`     | `'Inter', sans-serif`                      | Body text, UI elements   |

- **Ethnocentric**: custom display font, weight 400, loaded locally from `/Ethnocentric/`
- **Inter**: variable font from Google Fonts (weights 100–900)
- Headings use tight letter-spacing (`--ls-tight: -.035em`) and weight 400
- Body text uses `--ls-normal: -.01em`

### Logo

- File: `logo.png` (root)
- Favicon: `favicon.svg`
- "3D" in navy (`#00549d`), "ORTHOTICS" in cyan (`#00aec7`), white background

---

## Design Direction

### North star: antigravity.google aesthetic with our own identity

Ultra-clean, modern, interactive, cutting-edge. Key principles:

1. **Clean white canvas**: white dominates, generous whitespace
2. **Large, bold typography**: hero text 3–6rem+, tight letter-spacing, Ethnocentric
3. **Pill-shaped buttons**: `border-radius: 9999px` on all CTAs
4. **Rounded cards**: `border-radius: 16px` on cards, containers, UI elements
5. **Subtle borders**: `rgba(33,34,38,0.08)`, not heavy outlines
6. **Interactive particle backgrounds**: floating dots, mouse-responsive (`js/particles-bg.js`)
7. **Smooth animations**: scroll-triggered reveals, `--ease-out-quint` / `--ease-out-expo`
8. **Generous spacing**: `--section-gap: clamp(6rem, 10vw, 10rem)`, `--page-margin: clamp(1.5rem, 4vw, 4.5rem)`
9. **No dark sections**: use `section--light` (grey `#f8f9fc`) for contrast, never navy/dark backgrounds
10. **The foot scan visualization is sacred**: `js/foot-3d.js` is off-limits without explicit permission

### What NOT to do

- Don't make it look like a generic SaaS template
- Don't use heavy borders, sharp corners, or boxy layouts
- Don't darken sections with navy backgrounds
- Don't add visual clutter — fewer elements, more whitespace
- Don't replace or redesign the foot scan 3D visualization without asking

---

## Project Structure

```
/
  index.html                  Homepage
  about.html                  About Us
  accuscan-dp.html            AccuScan DP product page
  orthotics.html              Orthotics catalog
  va-resource-guide.html      VA resources
  faq.html                    FAQ
  guides.html                 Guides + care PDFs
  awards.html                 Awards
  contact.html                Contact form
  lab.html                    DEV-ONLY: unlinked sandbox for previewing new
                              animations before merging to live pages.
                              Currently: iPad beam-wipe scan animation demo.

  css/style.css               All global styles (single file, ~2,100 lines)

  js/main.js                  Navigation, scroll reveals, carousels, modals, counters
  js/foot-3d.js               THREE.js foot scan particle visualization (hero) — SACRED
  js/particles-bg.js          Full-page interactive particle background
  js/bubbles.js               Orthotics product bubble catalog (index + accuscan-dp)
  js/home-ipad-showcase.js    Homepage iPad pipeline animation
  js/home-ortho-modal.js      Homepage orthotics picker modal
  js/orthotics-page.js        Orthotics page catalog + modal
  js/orthotics-tilt.js        Gyroscope tilt effect on orthotics page
  js/awards-overlays.js       Award badge overlays on awards.html
  js/va-resource-guide-overlays.js  VA resource guide badges
  js/lab-page.js              Lab-only: beam-wipe animation controller

  logo.png, favicon.svg       Brand assets
  foot.obj                    3D geometry for foot scan (3.5 MB)
  Orthotics Pics/             Product photography (45 images, 15 products × 3)
  images/                     Shared marketing imagery
  Ethnocentric/               Custom display font files (.ttf + .otf)
  Break-In-Guide.pdf          Linked from guides.html
  Disinfecting-Procedure-for-Accuscan-DP.pdf  Linked from guides.html

  Web Dev Team/docs/          Historical audit notes (not site code)
  .claude/                    Claude Code config (launch.json, settings.local.json)
```

### Tech Stack

- **Plain HTML/CSS/JS** — no framework, no build step, no npm
- **THREE.js r128 + OBJLoader** — loaded from CDN, used only on index.html and accuscan-dp.html for the foot scan
- **Inter** — Google Fonts CDN
- **Python HTTP server** for local preview: `python -m http.server 8765` (see `.claude/launch.json`)

---

## Workflow Rules

### Before every edit

1. **Explain first**: Describe what you plan to do, what it affects, and why. Don't silently fix things.
2. **Check design principles** (`/distinctive-web`, `/responsive-web`): Does the change keep the site distinctive and work on desktop (1280px+) and mobile (375–430px)?

### After every edit

3. **Screenshot significant visual changes** (`/screenshot-review`): desktop (1280×900) and mobile (390×844). Audit against the design direction above.
4. **Report and confirm**: Show what changed, ask for feedback before the next step.

### General rules

- **One step at a time** — don't batch multiple sections into one edit
- **Don't revert without asking** — propose a fix instead; confirm before any full revert
- **Don't touch `js/foot-3d.js`** unless explicitly asked
- **Don't over-engineer** — this is a static site; no build tools, no frameworks
- **Stay on brand** — every color/font traces back to the tokens above
- **Stay on vision** — antigravity.google: clean, interactive, cutting-edge
- **Explain trade-offs** — call out performance, a11y, or browser-support costs upfront
- **Preserve content** — don't rewrite marketing copy or reorganize sections without asking
- **Prefer inline `<style>` for page-specific CSS** — only promote to `css/style.css` when it's genuinely shared across pages
- **Lab work stays in lab.html** — don't link it from the live site; it's a sandbox

---

## Animation & Easing Reference

```css
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);   /* fast start, smooth end */
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);  /* buttons, cards, hovers */
--ease-in-out:    cubic-bezier(0.76, 0, 0.24, 1);  /* loader, modals */
```

- Scroll reveals: `.reveal` class + IntersectionObserver in `js/main.js`
- Staggered children: `.stagger` class with `nth-child` delays
- Hover transitions: 0.3–0.35s with `ease-out-quint`

---

## Security Posture

- All pages should carry a `<meta http-equiv="Content-Security-Policy">` tag (lab.html already does — other pages to be audited)
- No inline event handlers (`onclick=`, etc.) — CSP blocks them
- External CDN scripts should use SRI (`integrity="sha..."`) hashes
- `target="_blank"` links need `rel="noopener"` (tabnabbing)
- No secrets or internal URLs in HTML comments

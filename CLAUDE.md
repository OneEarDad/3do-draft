# 3D Orthotics Website: Project Guide

## Company Overview

**3D Orthotics** is a veteran-owned (SDVOSB & WOSB) medical device company that provides HIPAA-compliant digital orthotic scanning for VA and DOD hospitals. The flagship product is **AccuScan DP**, an iPad-based 3D foot scanning system that de-identifies patient data before transmission.

- Phone: **844-FOOT-911**
- Certifications: SDVOSB, WOSB, FDA Registered (RN#3015146490), SAM Registered (CAGE: 9PXW1), HIPAA Compliant
- Award: **Most Improved Product: VA Podiatry Nationally**

---

## Brand Identity

### Colors (from the logo)

| Token           | Hex / Value               | Usage                              |
|-----------------|---------------------------|------------------------------------|
| `--navy`        | `#00549d`                 | Primary brand: dark blue "3D"     |
| `--navy-mid`    | `#0068bb`                 | Hover / mid-blue accent            |
| `--cyan`        | `#00aec7`                 | Secondary brand: "ORTHOTICS"      |
| `--cyan-dim`    | `#0090a8`                 | Dimmed cyan for subtle accents     |
| `--cyan-light`  | `#e8f7fa`                 | Very light blue tints              |
| `--bg`          | `#ffffff`                 | Page background: pure white       |
| `--surface`     | `#f8f9fc`                 | Section backgrounds, cards         |
| `--surface-2`   | `#eff2f7`                 | Deeper surface variant             |
| `--text`        | `#121820`                 | Primary text: near-black          |
| `--text-mid`    | `#3a4a5c`                 | Secondary text                     |
| `--text-dim`    | `#6b7d92`                 | Muted / caption text               |
| `--text-faint`  | `rgba(33, 34, 38, 0.08)`  | Borders: nearly invisible         |

### Typography

| Token             | Font                                       | Usage                    |
|-------------------|--------------------------------------------|--------------------------|
| `--font-display`  | `'Ethnocentric', 'Inter', sans-serif`      | Headings, display text   |
| `--font-body`     | `'Inter', sans-serif`                      | Body text, UI elements   |

- **Ethnocentric**: custom display font, single weight (400), loaded from `/Ethnocentric/`
- **Inter**: variable font from Google Fonts (weight 100–900)
- Headings use tight letter-spacing (`--ls-tight: -.035em`) and weight 400
- Body text uses `--ls-normal: -.01em`

### Type Scale (fluid with clamp)

| Token          | Size                            |
|----------------|---------------------------------|
| `--fs-display` | `clamp(3.2rem, 6.5vw, 6.5rem)` |
| `--fs-h1`      | `clamp(2.6rem, 5vw, 5rem)`     |
| `--fs-h2`      | `clamp(2rem, 3.8vw, 3.5rem)`   |
| `--fs-h3`      | `clamp(1.3rem, 1.8vw, 1.6rem)` |
| `--fs-body`    | `clamp(.95rem, 1vw, 1.1rem)`   |
| `--fs-label`   | `.72rem`                        |

### Logo

- File: `logo.png` (root directory)
- Favicon: `favicon.svg`
- The logo has "3D" in navy (`#00549d`) and "ORTHOTICS" in cyan (`#00aec7`) on a white background

---

## Design Direction

### Goal: antigravity.google aesthetic with our own identity

This website should feel like **antigravity.google**: ultra-clean, modern, interactive, and cutting-edge. Key principles:

1. **Clean white canvas**: white backgrounds dominate, content breathes with generous spacing
2. **Large, bold typography**: hero text 3-6rem+, tight letter-spacing, Ethnocentric display font
3. **Pill-shaped buttons**: `border-radius: 9999px` on all CTAs
4. **Rounded cards**: `border-radius: 16px` on cards, containers, and UI elements
5. **Subtle borders**: nearly invisible (`rgba(33,34,38,0.08)`), not heavy outlines
6. **Interactive particle backgrounds**: floating dots in brand colors, mouse-responsive (see `js/particles-bg.js`)
7. **Smooth animations**: scroll-triggered reveals, hover transitions using `--ease-out-quint` and `--ease-out-expo`
8. **Generous spacing**: `--section-gap: clamp(6rem, 10vw, 10rem)`, `--page-margin: clamp(1.5rem, 4vw, 4.5rem)`
9. **No dark sections**: use `section--light` (grey `#f8f9fc`) for contrast, not navy/dark backgrounds
10. **The foot scan visualization is sacred**: `js/foot-3d.js` must NOT be modified without explicit permission. The user loves the original particle scan effect.

### What NOT to do

- Don't make it look like a generic SaaS template
- Don't use heavy borders, sharp corners, or boxy layouts
- Don't darken sections with navy backgrounds (use light grey instead)
- Don't add visual clutter: fewer elements, more whitespace
- Don't replace or redesign the foot scan 3D visualization without asking

---

## Project Structure

```
/
  index.html             : Homepage
  about.html             : About Us
  accuscan-dp.html       : AccuScan DP product page
  orthotics.html         : Orthotics catalog
  va-resource-guide.html : VA Resources
  faq.html               : FAQ
  guides.html            : Guides
  awards.html            : Awards
  contact.html           : Contact form
  css/style.css          : All global styles (single file)
  js/main.js             : Navigation, scroll reveals, carousels, modals, counters
  js/foot-3d.js          : THREE.js foot scan particle visualization (hero)
  js/foot-3d-preview.js  : Progressive reveal variant of foot scan
  js/particles-bg.js     : Interactive particle background (full-page floating dots)
  logo.png               : Company logo
  favicon.svg            : Favicon
  Orthotics Pics/        : Product photography
  Ethnocentric/          : Custom display font files
```

### Tech Stack

- **Plain HTML/CSS/JS**: no framework, no build tools
- **THREE.js r128**: loaded from CDN for 3D rendering
- **OBJLoader**: loads `foot.obj` geometry for the scan visualization
- **Inter**: Google Fonts CDN
- **No npm dependencies** for the site itself (Playwright is dev-only for screenshots)

---

## Workflow Rules

### Before every edit

1. **Explain first**: Before making any code change, describe what you plan to do, what it affects, and how it improves the design. Don't silently fix things.
2. **Invoke `/distinctive-web`**: Check the planned change against distinctive design principles (asymmetry, variable rhythm, intentional typography, scroll animations, depth). Ensure the change doesn't make the site look more generic.
3. **Invoke `/responsive-web`**: Verify the change works on both desktop (1280px+) and mobile (375-430px). Every new element needs both breakpoints considered.

### After every edit

4. **Take screenshots**: Run `/screenshot-review` after every significant visual change. Use Playwright to capture desktop (1280x900) and mobile (390x844) screenshots.
5. **Review and confirm**: Analyze the screenshots against the design direction above. If something doesn't look right, fix it before moving on.
6. **Report to user**: Show the user what changed and ask for feedback before proceeding to the next step.

### General rules

- **One step at a time**: Don't batch multiple sections into one edit. Make one focused change, screenshot, confirm, then move to the next.
- **Don't revert without asking**: If something looks off, propose a fix instead of reverting. If a full revert is needed, confirm with the user first.
- **Don't touch `js/foot-3d.js`**: The 3D foot scan visualization is off-limits unless the user explicitly asks to modify it.
- **Don't over-engineer**: This is a static site. Don't add build tools, frameworks, or unnecessary dependencies.
- **Stay on brand**: Every color, font, and design decision should trace back to the brand tokens above. Don't introduce off-brand colors.
- **Stay on vision**: The north star is antigravity.google: clean, interactive, cutting-edge. Every change should move toward that, not away from it.
- **Explain trade-offs**: If a design choice has downsides (performance, browser support, accessibility), say so upfront.
- **Keep content intact**: Don't rewrite marketing copy, remove sections, or change the information architecture without asking. The content is approved; the design is what we're improving.

---

## Animation & Easing Reference

```css
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);   /* fast start, smooth end */
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);   /* buttons, cards, hovers */
--ease-in-out:    cubic-bezier(0.76, 0, 0.24, 1);    /* loader, modals */
```

- Scroll reveals: `.reveal` class + IntersectionObserver in `js/main.js`
- Staggered children: `.stagger` class with `nth-child` delays
- Hover transitions: 0.3–0.35s with `ease-out-quint`

---

## Screenshot Pipeline

Server: `python -m http.server <port>` from project root
Screenshots: Playwright headless Chromium → `.screenshots/desktop.png` and `.screenshots/mobile.png`
Port: Use any available port (check with `netstat` if 3000 is busy)

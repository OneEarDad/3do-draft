# How to Update the Site

The live site is a **static HTML/CSS/JS site** on InMotion (Apache, `public_html`). There is no build step and no auto-deploy — **publishing means copying changed files up to the server.**

- **Source of truth:** the Git repo — <https://github.com/OneEarDad/3do-draft>
- **Live server:** InMotion `public_html` for `3dorthotics.com`
- **Golden rule:** edit in the repo, then push to the server. **Never edit files directly on the server** — that drifts the server out of sync with Git and the next deploy will overwrite it.

---

## The update loop

1. **Make the change in the source** (locally / in the repo) and commit + push to GitHub.
2. **Upload the changed file(s)** to InMotion `public_html`, preserving the same folder path (e.g. `css/style.css` → `public_html/css/style.css`). Overwrite the old file.
3. That's it — no restart, no build. Refresh the page to confirm.

You only upload what changed — usually 1–3 files, not the whole site.

---

## Cache-busting (important for CSS/JS edits)

CSS and JS are referenced with a version query string, e.g. `css/style.css?v=7`, `js/main.js?v=3`. Browsers cache these aggressively.

- When `style.css` or a JS file changes, the reference in the HTML must bump (`?v=7` → `?v=8`) **and** the changed HTML files must be uploaded too. This is done in source as part of the edit — just make sure the bumped HTML files go up alongside the changed CSS/JS.
- Images and fonts are immutable (new files get new names), so they don't need versioning.
- HTML itself is served with a short (10-minute) cache, so HTML-only edits appear within ~10 minutes (or immediately in a fresh/incognito load).

---

## Recommended method: SFTP (FileZilla or similar)

Best balance for ongoing edits.

1. Get SFTP credentials from cPanel → **SSH/FTP Access** (host, username, password; **port 22** for SFTP).
2. In FileZilla: connect, navigate the remote pane to `public_html`.
3. Drag the changed local file(s) into the matching remote folder; confirm overwrite.

**File/dir permissions** if ever needed: files `644`, directories `755`.

### Alternatives
- **cPanel File Manager** — fine for a one-off small edit: navigate to the file, Upload (overwrite), done. No software needed.
- **cPanel Git Version Control** — the most automated option: clone <https://github.com/OneEarDad/3do-draft> into a path on the server and `git pull` to deploy (or configure deploy-on-push). Requires SSH-key setup. Worth doing if updates become frequent; ask if you want this configured.

> Whichever method: **do not** touch the `scan/` directory (that's the `scan.3dorthotics.com` AccuScan portal) or the root `.htaccess` guards that protect it.

---

## Common updates — what to upload

| Change | Files to upload |
|---|---|
| Edit FAQ / page copy | the one `*.html` file |
| Color / spacing / shared style | `css/style.css` **+** every HTML file (their `?v=` bumped) |
| Behavior / animation | the relevant `js/*.js` **+** HTML referencing it (`?v=` bumped) |
| Swap a product photo | the new file in `Orthotics Pics/` (keep `.webp`, same base name) |
| Publish the legal pages | `privacy.html`, `terms.html` — after counsel review: fill `[EFFECTIVE DATE]` + `[GOVERNING-LAW STATE]`, delete the amber `.legal-draft-banner` block, then upload |
| Re-enable testimonials | `index.html` (remove the `<template id="testimonials-section">` wrapper, drop in real quotes) **+** any `?v=` bump |

---

## Quick sanity check after any update

- Load the changed page in a fresh/incognito tab and confirm the edit shows.
- For CSS/JS changes, confirm the new `?v=` number is what the browser requests (DevTools → Network).
- If something looks stale, it's almost always a missed `?v=` bump or an un-uploaded HTML file.

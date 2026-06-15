# Migration Guide — WordPress → Static Site (InMotion)

**Goal:** Replace the legacy WordPress site at the root domain **`3dorthotics.com`** with the new static HTML/CSS/JS site, **without disturbing the AccuScan portal at `scan.3dorthotics.com`**.

**Audience:** developer with cPanel / InMotion / SFTP / SSH access.

**You were sent:** `3dorthotics-deploy.zip` (the complete static site, ~5 MB, 86 files, includes its own `.htaccess`). Source of truth is the Git repo: <https://github.com/OneEarDad/3do-draft>.

---

## 🚨 Read first — the one thing that can go wrong

`scan.3dorthotics.com` is the **live AccuScan login portal** (`/login.php`). On this account its document root is **inside `public_html`** (expected: `public_html/scan/`).

That means:

- **DO NOT** delete the whole contents of `public_html`. That would take the scanner offline.
- Remove **only** the WordPress files from the `public_html` root and **preserve the `scan/` directory** (and anything else that isn't WordPress).
- The new site's `.htaccess` is already written to leave the `scan` subdomain alone (details in §6). Do not strip those guards.

DNS already points to InMotion, so **no DNS changes are required** — this is a file swap on the same server.

---

## 1. Prerequisites & assumptions

- cPanel access to the account hosting `3dorthotics.com`.
- The apex (`3dorthotics.com`) and `www` resolve to this InMotion account; `scan.3dorthotics.com` is a subdomain on the same account.
- A valid SSL cert (AutoSSL/Let's Encrypt) covering apex + `www`. Confirm under cPanel → **SSL/TLS Status**; run AutoSSL if needed.
- Required Apache modules (all standard on InMotion shared/VPS): `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires`, `mod_setenvif`, `mod_dir`.

---

## 2. Verify the scan subdomain's document root (do this before touching anything)

cPanel → **Domains** (or **Subdomains**) → find `scan.3dorthotics.com` → note **Document Root**.

- If it is `public_html/scan` → expected; follow §4 exactly (delete WordPress files only).
- If it is **outside** `public_html` (e.g. `/home/<user>/scan`) → even safer; `public_html` then holds only WordPress + the main site, but still delete selectively per §4 in case other assets live there.

Record the path before proceeding.

---

## 3. Full backup (non-negotiable)

1. **Files:** File Manager → select all of `public_html` → **Compress** → `public_html-backup-YYYYMMDD.zip` → **download off-server**.
   - Or via SSH: `tar -czf ~/public_html-backup-$(date +%F).tar.gz -C ~ public_html`
2. **Database:** cPanel → **phpMyAdmin** → export the WordPress DB (or **Backup Wizard** → Download a MySQL Database Backup). Keep even if you don't expect to need it.
3. Note the WordPress DB name/user from `wp-config.php` before deletion, in case of rollback.

---

## 4. Remove WordPress (root of `public_html` only)

Delete the following from `public_html`. **Leave `scan/` and any non-WordPress directories intact.**

**Directories:**
```
wp-admin/        wp-content/      wp-includes/
```

**Files:**
```
index.php        xmlrpc.php       wp-activate.php      wp-blog-header.php
wp-comments-post.php   wp-config.php   wp-cron.php       wp-links-opml.php
wp-load.php      wp-login.php     wp-mail.php          wp-settings.php
wp-signup.php    wp-trackback.php
license.txt      readme.html
.htaccess        (the WordPress-generated one — enable "Show Hidden Files")
```

Also remove any WordPress drop-ins if present: `wp-config-sample.php`, `.maintenance`, `wp-content` symlinks, caching-plugin `advanced-cache.php`/`object-cache.php` (these live in `wp-content`, removed with it).

> Tip: it's often cleaner to **move** WordPress into a temporary folder (e.g. `public_html/_wp_old/`) rather than delete, verify the new site works, then delete `_wp_old/` after. If you do this, make sure `_wp_old/` is not web-exposed or is password-protected, and delete it promptly.

**Do not delete:** `scan/`, and anything you don't positively recognize as WordPress — check with the owner first.

---

## 5. Deploy the static site

1. Upload `3dorthotics-deploy.zip` into `public_html`.
2. **Extract** into `public_html`. The archive uses forward-slash paths and unpacks files at the document-root level (`index.html`, `css/`, `js/`, `images/`, `Orthotics Pics/`, `Inter/`, `Ethnocentric/`, `foot.obj`, `.htaccess`, etc.) — **alongside**, not inside, `scan/`.
3. Delete the uploaded ZIP from the server.
4. Confirm the new `.htaccess` is present at `public_html/.htaccess` (Show Hidden Files).
5. **Permissions** (if they didn't survive extraction): files `644`, directories `755`.
   - SSH one-liner from `public_html`:
     ```
     find . -type d -not -path './scan/*' -exec chmod 755 {} \; && find . -type f -not -path './scan/*' -exec chmod 644 {} \;
     ```
   - (The `-not -path './scan/*'` guard avoids re-permissioning the scan app.)

---

## 6. What the `.htaccess` does (and how it protects `scan`)

The site ships a single root `.htaccess`. Because Apache applies a `public_html/.htaccess` to subdirectories too, every rule is written to exclude the scan subdomain:

- **`SetEnvIfNoCase Host "^scan\." IS_SCAN=1`** flags scan requests.
- **Security headers** (`HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are all set with **`env=!IS_SCAN`** → never applied to `scan.3dorthotics.com`.
- **HSTS is `max-age=31536000` with NO `includeSubDomains`** → cannot force HTTPS policy onto subdomains. (Strengthen to `includeSubDomains; preload` only once every subdomain is HTTPS-only.)
- **`RewriteRule ^scan(/|$) - [L]`** → our rewrites never touch the scan path.
- **HTTPS redirect** applies to the main site.
- **`DirectoryIndex index.html index.php`** → root serves `index.html`; `index.php` remains a fallback so scan's PHP entry still resolves.
- **`mod_deflate`** compresses HTML/CSS/JS/SVG and **explicitly forces `foot.obj`** (≈3.6 MB → ≈740 KB) through DEFLATE.
- **`mod_expires`** sets long cache on immutable assets (CSS/JS use `?v=` cache-busting), short cache (10 min) on HTML.
- Denies serving of `.md`, dotfiles, and the build script as defense-in-depth.

If `scan/` has its own `.htaccess`, it continues to take precedence for its own rewrites; the guards above are belt-and-suspenders.

---

## 7. Verify (both sites)

| Check | Expected |
|---|---|
| `https://3dorthotics.com` | New static site loads; valid SSL padlock |
| `http://3dorthotics.com` | 301-redirects to HTTPS |
| `https://www.3dorthotics.com` | Loads (apex or www both fine) |
| Homepage foot-scan + orthotic images | Render (confirms `foot.obj`, THREE.js CDN, `Orthotics Pics/*.webp` paths) |
| `https://scan.3dorthotics.com/login.php` | **Still works exactly as before** — the make-or-break check |
| `curl -sI -H 'Accept-Encoding: gzip' https://3dorthotics.com/foot.obj` | `Content-Encoding: gzip` present |
| <https://securityheaders.com> scan of the apex | A / A+ |

Then submit/refresh `https://3dorthotics.com/sitemap.xml` in Google Search Console.

---

## 8. Rollback

If anything is wrong and you need WordPress back fast:
1. Delete the new static files from `public_html` (leave `scan/`).
2. Restore `public_html-backup-YYYYMMDD.zip` (or move `_wp_old/` contents back).
3. Restore the DB from the phpMyAdmin export if it was changed.
DNS is unchanged throughout, so rollback is purely a file/DB restore.

---

## 9. Notes / gotchas

- **Email is unaffected.** Web hosting and MX/email routing are separate; swapping the site does not touch mailboxes (`PatientCare@`, `Orders@3DOrthotics.com`).
- **`lab.html` is intentionally excluded** from the deploy (internal sandbox).
- **Two legal pages ship as drafts:** `privacy.html` and `terms.html` carry a visible amber "Draft for review" banner and bracketed placeholders (`[EFFECTIVE DATE]`, `[GOVERNING-LAW STATE]`). These are edited in source and re-published once counsel signs off — see `UPDATING.md`. (Owner may have these already filled before you deploy.)
- **THREE.js r128 + OBJLoader are self-hosted** at `js/vendor/` (no external CDN dependency) so the foot scan works on locked-down networks. `script-src` is `'self'`. The only remaining third-party resource is the YouTube embed on the homepage (`frame-src https://www.youtube.com`); if a network blocks YouTube, only that one video won't play — the rest of the site is fully self-contained.
- **`foot.obj` is large by design** (the 3D foot scan). Confirm DEFLATE is active (table above) so it transfers compressed.
- After go-live, future updates are file-level, not a re-migration — see `UPDATING.md`.

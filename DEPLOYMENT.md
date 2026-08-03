# Deploying the 3D Orthotics site to InMotion

A step-by-step runbook for launching this site on InMotion shared hosting.
Written to be as turnkey as possible. Read section 1 first (decisions), then
follow section 3 (the easy path).

---

## 0. What you're deploying (30-second orientation)

- **Plain static site** — HTML/CSS/JS, **no build step**, no database, no PHP.
  You just copy the files up; there's nothing to "compile."
- Everything lives in the web root: **`public_html/`**.
- **This hosting is shared with the AccuScan portal** at
  `scan.3dorthotics.com`, whose files live in **`public_html/scan/`**.
  ⚠️ **Leave `public_html/scan/` completely alone.** The site's `.htaccess`
  is already written to not interfere with it.
- There is likely still an **old WordPress site in `public_html/`** to remove
  first (the `.htaccess` notes this).

---

## 1. Decisions before you start — add vs. keep out

| Item | Verdict | Why |
|---|---|---|
| **Contact form** | ✅ Keep out | The site uses click-to-call / click-to-email (`tel:` / `mailto:`) on purpose. A real web form would need PHP + spam protection. Not worth it — nothing to add. |
| **Cookie / consent banner** | ✅ Keep out | The site sets no cookies and runs no tracking. Not required. |
| **Analytics (e.g. GA4)** | ⚪ Optional | None is installed. If you want traffic stats, add the snippet **and** add its domains to the CSP `<meta>` on every page (`script-src`, `connect-src`, `img-src`). Skip if not needed. |
| **HTTPS / SSL** | ➕ Must enable | Free via InMotion AutoSSL (section 4). |
| **HSTS** | ✅ Already on | Enabled in `.htaccess`. It only "activates" once HTTPS works. |
| **www vs non-www** | ⚠️ Decide | Canonical tags currently point to **`https://3dorthotics.com`** (non-www). Pick one as your real address and enable the matching redirect (section 2). |
| **favicon / 404 / OG image / sitemap / robots / manifest** | ✅ Done | All already in the repo. Nothing to add. |
| **Security headers, gzip, caching** | ✅ Done | All configured in `.htaccess`. Just upload it. |

---

## 2. One recommended edit before deploy (SSL-safe redirect)

InMotion's own docs warn: a redirect that forces **all** HTTP → HTTPS can
catch the `/.well-known/` path that AutoSSL uses to validate your certificate,
which can **block the cert from issuing or auto-renewing** (your site would go
insecure ~90 days later). Your `.htaccess` redirect doesn't exempt it yet.

**In `.htaccess`, change the Force-HTTPS block from:**

```apache
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**to:**

```apache
  RewriteCond %{HTTPS} !=on
  RewriteCond %{REQUEST_URI} !^/\.well-known/    [NC]
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**www vs non-www (optional):** to force everyone onto the non-www address
(matching the canonical tags), uncomment these lines already present in the
`.htaccess`:

```apache
  RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
  RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
```

*(If your live domain should be `www.`, tell the site owner instead — the
canonical/OG tags would need flipping to `www.` in one pass.)*

---

## 3. Deploy — the easy path (cPanel File Manager)

Best for a one-time launch. No GitHub, no git, no SSH keys, no config files.

1. **Use the ZIP you were given** (`3d-orthotics-website.zip`). It already
   contains exactly what belongs on the server — the dev-only files in section 6
   are already removed, and the hidden `.htaccess` **is** included. You don't
   need to open, clean, or re-zip it.

2. **Log in to cPanel** (via your InMotion AMP account portal → "cPanel").

3. **Back up what's there first.** In **File Manager**, open `public_html`,
   select everything **except the `scan` folder and `.well-known`**, and either
   download a zip or move it into a `_old-wordpress/` folder. Don't delete
   `public_html` itself, and don't touch `public_html/scan`.
   *(Optional but safer: cPanel → Files → Backup → download a Full or Home
   Directory backup first.)*

4. **Remove the old WordPress files** from `public_html` (keep `scan/`,
   `.well-known/`, and any mail/system folders). If WordPress was installed via
   Softaculous, uninstall it there first so its database is cleaned up too.

5. **Upload the ZIP.** File Manager → open `public_html` → **Upload** → choose
   `3d-orthotics-website.zip`. When it finishes, go back to `public_html`,
   select the zip → **Extract**. Then delete the leftover zip.

6. **Sanity-check the layout.** `public_html/` should now directly contain
   `index.html`, `.htaccess`, `css/`, `js/`, `images/`, `foot.obj`, etc. —
   **not** nested inside an extra folder. If it extracted into a subfolder, move
   the contents up one level into `public_html`.

Then go to **section 4 (SSL)** and **section 5 (verify)**.

> **Ongoing updates option (git):** InMotion also supports **cPanel → Git
> Version Control**: clone the GitHub repo and deploy via a `.cpanel.yml` file
> that copies each folder/file into `public_html`. It's nicer for repeat
> updates but needs an SSH deploy key (for a private repo) and a maintained
> `.cpanel.yml`. For the initial launch, the File Manager path above is simpler.
> Ask and I can generate a ready-to-use `.cpanel.yml`.

---

## 4. Turn on HTTPS (free AutoSSL)

1. In your **AMP** account portal, open **"Manage Free Basic SSL"**, set
   **Enable Free SSL** to **ON**, and click **Run Check Now**.
   *(Alternatively, inside cPanel → **SSL/TLS Status** → select the domain →
   **Run AutoSSL**.)*
2. Wait a few minutes for the certificate to issue.
3. Visit `https://yourdomain.com` — you should get a valid padlock.
4. Visit `http://yourdomain.com` — it should **redirect to https** (that's the
   `.htaccess` rule). HSTS then keeps browsers on HTTPS automatically.

If AutoSSL fails to issue, it's almost always the `/.well-known/` redirect —
confirm the section-2 edit is in place.

---

## 5. Domain / DNS (only if not already pointed here)

- If `3dorthotics.com` **already resolves to InMotion** (the `scan.` subdomain
  works today, so it very likely does), there's **nothing to do** here.
- If you're moving the domain from another host, point its **nameservers** (or
  A record) to InMotion and allow up to 24–48h to propagate. Confirm both the
  apex (`3dorthotics.com`) and `www.` resolve, then enable your chosen
  www/non-www redirect (section 2).

---

## 6. Do NOT upload these (dev/source files)

Keep the public site clean — exclude:

- `.git/` and `.gitignore`
- `.claude/` and `CLAUDE.md`  *(internal project config/notes)*
- `DEPLOYMENT.md` (this file) and any other `*.md`
- `Web Dev Team/`  *(historical audit notes)*
- `3do final logo (r).svg` and `3do final logo svg.svg`  *(logo working files, not used by the site)*
- Any biomed deck files (`*.pptx`, `biomed-deck-build.js`) if present

**Do upload** everything else, including the hidden **`.htaccess`**, `foot.obj`,
the `.mp4`, the fonts folders (`Inter/`, `Ethnocentric/`), `Orthotics-Pics/`,
`favicon.svg`, `favicon.ico`, `robots.txt`, `sitemap.xml`, `site.webmanifest`,
and both care-guide PDFs.

---

## 7. Post-launch verification checklist

Tick these after the files are up and SSL is on:

- [ ] `https://` loads with a **valid padlock**; `http://` **301-redirects** to it.
- [ ] All 11 pages load: Home, AccuScan DP, Orthotics, VA Resources, FAQ,
      Awards, Contact, About, Guides, Privacy, Terms.
- [ ] **Foot-scan 3D animation** and the **iPad showcase video** play on the
      homepage; product **carousels/modals** work on Orthotics.
- [ ] **Images render** (case-sensitivity was pre-verified, so they should).
- [ ] **404 page** shows for a made-up URL (e.g. `/nope`).
- [ ] **favicon** appears in the browser tab.
- [ ] **PDFs** open from the Guides page.
- [ ] **`scan.3dorthotics.com` still works** (you didn't disturb it).
- [ ] **Security headers present** — check at
      [securityheaders.com](https://securityheaders.com) (expect an A/A+), or
      DevTools → Network → click the page → Response Headers (look for
      `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`).
- [ ] **Compression active** — DevTools → Network → click `foot.obj` (or a
      `.css`/`.js`) → Response Headers → `Content-Encoding: gzip`. `foot.obj`
      should transfer ~700 KB instead of ~3.5 MB.
- [ ] **Link preview** — paste the homepage URL somewhere that unfurls links
      (or use a free OG debugger) and confirm the title/description/share image.

---

## 8. Nice-to-have, after you're live (all optional)

- Submit `sitemap.xml` in **Google Search Console** so the site gets indexed.
- Consider **HSTS preload** later (only once you're 100% committed to HTTPS
  on every subdomain).
- Add **analytics** if you want traffic data (remember to update the CSP).

---

## Rollback

If anything looks wrong, restore the backup you took in step 5 (or the cPanel
Full/Home backup). Because you didn't touch `public_html/scan/`, the AccuScan
portal is unaffected regardless.

---

### Sources (InMotion docs)
- Upload website files (File Manager / FTP): inmotionhosting.com/support/website/upload-website-files/
- Git to publish files: inmotionhosting.com/support/website/git/using-git-to-publish-files/
- Enable AutoSSL (AMP & WHM): inmotionhosting.com/support/website/ssl/auto-ssl-guide/
- Force HTTPS with .htaccess: inmotionhosting.com/support/website/ssl/how-to-force-https-using-the-htaccess-file/
- Remove WordPress / clean public_html: inmotionhosting.com community support

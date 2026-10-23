# Career Ka Dost - Hosting Guide (for the next Claude Code, and for the owner)

Read `HANDOFF.md` for the full history and design decisions. This file is only about **what each folder/file is for and how to put the website online**.

The owner (Kalpak, for Bharat Rai's company Career Ka Dost, Nagpur) is non-technical. Give him short, copy-paste, click-by-click steps. He does not want to open VS Code. He has NOT chosen a host yet: ask which one he prefers, or recommend Option A.

---

## 1. The package, folder by folder

The folder is called `CKD Website` (on the owner's Desktop) / `Career-Ka-Dost-LATEST`:

```
CKD Website/
├── READ-ME-FIRST.txt                       short guide
├── HANDOFF.md                              full history, rules, decisions (read this too)
├── HOSTING-GUIDE.md                        this file
├── RUN-WEBSITE-LOCALHOST.bat               double-click: shows the built website on localhost, no install
├── serve-website.ps1                       used by the .bat file above (plain PowerShell, no Node needed)
├── Career-Ka-Dost-WEBSITE-TO-HOST.zip      = the contents of folder 1, zipped
├── Career-Ka-Dost-FOR-CLAUDE-CODE.zip      = folder 2 + folder 3 + guides + the two files above, zipped (for the next Claude Code)
├── 1-WEBSITE-TO-HOST/
├── 2-SOURCE-CODE/
└── 3-STAFF-PORTAL-SETUP/
```

| Folder / file | What it is | Who uses it | Put it online? |
|---|---|---|---|
| `1-WEBSITE-TO-HOST/` | The **finished, built website** (static HTML/JS/CSS, images, PDFs). The live staff-portal and lead-form links are already baked in. | The host | **YES. This is the ONLY thing to upload.** |
| `RUN-WEBSITE-LOCALHOST.bat` + `serve-website.ps1` | Double-click the `.bat` to preview `1-WEBSITE-TO-HOST` on `http://localhost:5173/` with nothing installed (plain Windows PowerShell serves the files). Use this to see the site on your own computer — Claude Code running in the cloud cannot open a localhost link on your machine. | Owner | No, these two stay local. |
| `2-SOURCE-CODE/` | The editable React/Vite project. Needed only to change the site and rebuild it. Also has `RUN-DEV-SERVER.bat` for a live-editing localhost preview (needs Node.js). | Developer / Claude Code | **NO.** Never upload it to a web host (it contains `.env`). |
| `3-STAFF-PORTAL-SETUP/Code.gs` | The backend code for the staff portal, to be **pasted into Google Apps Script**. | Owner, once per update | No (Google runs it). |
| `3-STAFF-PORTAL-SETUP/STEPS.txt` | Update steps, first usernames and first passwords. | Owner | **NO. Keep private.** Delete when everyone has logged in once. |
| `Career-Ka-Dost-WEBSITE-TO-HOST.zip` | Same as folder 1, for sites that accept a zip or for emailing. | Host | Yes (or unzip first). |
| `Career-Ka-Dost-FOR-CLAUDE-CODE.zip` | Source + portal setup + guides + the two localhost-preview files, one file, no `node_modules`. | Next Claude Code | No. |

### Inside `1-WEBSITE-TO-HOST/` (what must stay together)
```
index.html                the page; must be at the TOP of the hosted folder
favicon.png, favicon.svg, icons.svg
assets/index-*.js, index-*.css   the app code and styling (file names change with every build)
images/                   logo.png, logo-mark.png, founder.png
  achievers/              6 student photos (Results page)
  awards/                 5 award logos (About page / footer)
  testimonials/           aleena-shaikh.jpg
resources/class-10/       3 downloadable PDFs (Free Resources page)
```
Upload the **contents** so that `index.html` sits at the root of the site (not inside an extra folder).

### Inside `2-SOURCE-CODE/` (what each part is for)
| Path | Purpose |
|---|---|
| `package.json`, `package-lock.json` | Dependencies and commands (`npm run dev / build / lint`). |
| `vite.config.js` | Build config. `VITE_BASE_PATH` sets a sub-folder base (only needed for GitHub Pages project sites). |
| `.env` | **Private.** The two live Google links (leads form + staff portal). Baked into the site at build time. |
| `.env.example` | Template for `.env` with explanations. |
| `RUN-DEV-SERVER.bat` | Double-click: installs once (if needed), then runs `npm run dev` for a live-editing localhost preview. Needs Node.js. |
| `index.html` | HTML shell + preconnect hints. |
| `public/` | Static files copied as-is into the built site: `images/`, `resources/class-10/*.pdf`, favicons. **Add new PDFs/images here.** |
| `src/App.jsx` | Routes (`#/about`, `#/admin`, ...). |
| `src/components/` | All page sections and widgets (Header, Footer, Hero, Pricing, Resources, SiteSearch, CareerTest, Art3D, Lead form, ...). |
| `src/config/` | **The files the owner edits for content:** `site.js` (phones, email, social links, career test links), `pricing.js`, `faq.js`, `blog.js`, `legal.js`, `resources.js` (PDF downloads), `achievers.js`, `testimonials.js`, `ui.js`. |
| `src/admin/` | The staff portal screens (login, attendance, leave, staff, forgot password) and `api.js` (talks to Google). |
| `src/utils/` | Lead submit, search index, jump-to-spot, whatsapp helpers. |
| `scripts/leads-google-apps-script.gs` | Backend for the **lead form** (v5). Pasted into its own Apps Script. |
| `scripts/staff-portal-google-apps-script.gs` | Backend for the **staff portal** (portal-v8). Same file as `3-STAFF-PORTAL-SETUP/Code.gs`. |
| `scripts/portal-tests/` | Fake Google + 176 automated tests (`node scripts/portal-tests/run-all.cjs`). |
| `.github/workflows/pages.yml` | Auto-deploy to GitHub Pages (only if that host is chosen). |
| `HANDOFF.md`, `HOSTING-GUIDE.md`, `README.md` | Documentation. |

---

## 2. Before hosting: are the Google parts ready?

The website itself has no server. It depends on **two Google Apps Script web apps** (both "Execute as: Me", "Who has access: Anyone"):

1. **Lead form script** (`leads-google-apps-script.gs`): already deployed. Its `/exec` URL is in `.env` as `VITE_LEADS_WEBHOOK_URL`. Leads go to the Google Sheet tab "NEW WEBSITE CKD".
2. **Staff portal script** (`Code.gs`, version `portal-v8`): the URL is in `.env` as `VITE_ADMIN_API_URL`. **The owner has not yet confirmed that the live script was updated to portal-v8.** Until it is, `#/admin` shows an "older version" message.

### Option 1 - update the EXISTING sheet to portal-v8 (the `/exec` link stays the same)
Use this only if you are keeping the current "CKD EMPLOYEE PORTAL" sheet.
1. Open that Google Sheet → **Extensions → Apps Script**.
2. Click in the code, **Ctrl+A**, **Delete**.
3. Open `3-STAFF-PORTAL-SETUP/Code.gs` in Notepad, copy everything, paste into Apps Script, **Ctrl+S**.
4. In the function dropdown choose **applyFixedUsernames** → **Run** (gives Bharat Rai the username `brxxckd1010`; first password = `brxxckd1010@123`). Allow permissions if asked.
5. Choose **testEmail** → **Run**, allow the permission. A test email must arrive at careerkadost@gmail.com (check Spam).
6. **Deploy → Manage deployments → pencil (edit) → Version: New version → Deploy.** (Must be "New version" on the existing deployment - this keeps the same `/exec` link. A brand-new deployment gives a NEW link instead, and then `.env` must be updated and the site rebuilt.)
7. Open the `/exec` link in a browser. It must show `"version":"portal-v8"`.

### Option 2 - start completely fresh on a brand NEW Google Sheet (owner's choice, 21 Oct 2026)
Use this if you are deleting the old sheet and starting over with a clean slate - only the owner's account, no old test data, no old employee rows.
1. Create a new, blank Google Sheet (any name, e.g. "CKD EMPLOYEE PORTAL").
2. In it: **Extensions → Apps Script**. Delete the sample code, paste all of `3-STAFF-PORTAL-SETUP/Code.gs`, **Ctrl+S**.
3. In the function dropdown choose **setupPortal** → **Run**. Allow every permission it asks for. This creates the `Staff`, `Attendance` and `Leaves` tabs and **one account: the owner**, username `brxxckd1010`, first password `brxxckd1010@123`.
4. Choose **testEmail** → **Run**, allow the permission. A test email must arrive at careerkadost@gmail.com (check Spam) - this is what sends the password-reset codes later.
5. **Deploy → New deployment → select type "Web app" → Execute as: Me → Who has access: Anyone → Deploy.** Copy the web app URL (ends in `/exec`).
6. **This URL is NEW and different from the old one.** Put it into `.env` as `VITE_ADMIN_API_URL`, replacing the old value, then `npm run build` and re-upload the new `dist` to your host. The website will not talk to the new sheet until you do this step - this is the step people forget.
7. Open the `/exec` link in a browser. It must show `"version":"portal-v8"`.
8. Log in to the portal as `brxxckd1010` / `brxxckd1010@123`, set a real password. Then use **Staff → Add employee** to add each person when you are ready (you choose their username there; first password is automatically `username@123`).
9. Only then can you safely delete the old sheet, once you are sure you do not need its attendance/leave history - deleting it is permanent and cannot be undone by anyone, including Claude.

In the `Staff` tab, column G ("Active") shows `TRUE` for a working employee and `FALSE` for someone discontinued; discontinued rows are shaded grey automatically. New employees appear as a new row the moment they are added, and nobody's password (first, reset, or otherwise) is ever written anywhere in the Sheet - only a salted, one-way hash is stored, so even opening the Sheet directly never reveals a real password.

---

## 3. How to host (pick ONE)

The site uses **hash routing** (`#/about`), so it needs **no server rewrite rules** on any host. The site must be served over **HTTPS** (all modern hosts do this by default).

### Option A - Netlify Drop (recommended, easiest, free)
1. Go to **app.netlify.com/drop** (sign up or log in with the company Google account).
2. **Drag the whole `1-WEBSITE-TO-HOST` folder** onto the page (or drag the unzipped contents).
3. Netlify gives a link like `https://something.netlify.app`. Open it and run the checklist in section 5.
4. Site settings → Domain management to add a custom domain (e.g. careerkadost.com) and rename the free subdomain.
5. To update later: Deploys tab → drag the new folder again.

### Option B - Normal shared hosting / cPanel / Hostinger / GoDaddy
1. Log in to the hosting file manager (or FTP).
2. Open `public_html` (or the domain's web root). Delete any default `index.html`/placeholder first.
3. Upload the **contents** of `1-WEBSITE-TO-HOST` (or upload the zip and use "Extract") so that `public_html/index.html`, `public_html/assets/`, `public_html/images/`, `public_html/resources/` exist.
4. Turn on the free SSL certificate (Let's Encrypt / AutoSSL) and force HTTPS.
5. Open the domain and run the checklist.

### Option C - GitHub Pages (free, auto-builds from the source)
1. Create a GitHub repository, upload the contents of `2-SOURCE-CODE` (**not** `.env`; it is git-ignored).
2. Repo → Settings → **Secrets and variables → Actions → New repository secret**, add **both**:
   - `VITE_LEADS_WEBHOOK_URL` = the lead form `/exec` URL
   - `VITE_ADMIN_API_URL` = the staff portal `/exec` URL
3. Settings → **Pages → Source: GitHub Actions**. Every push to `main` builds and deploys (`.github/workflows/pages.yml`, already sets `VITE_BASE_PATH` to `/<repo-name>/`).
4. The site appears at `https://<user>.github.io/<repo>/`. For a custom domain use a user/organisation Pages site or set the custom domain in Pages settings (then the base path should be `/`: set `VITE_BASE_PATH` empty in the workflow).

### Option D - Vercel / Cloudflare Pages (git-connected)
Import the repo; Framework: **Vite**; Build command: `npm run build`; Output directory: `dist`; Node 20+; add environment variables `VITE_LEADS_WEBHOOK_URL` and `VITE_ADMIN_API_URL` in the project settings. Do NOT set `VITE_BASE_PATH`.

---

## 4. Rebuilding from source (only when content or code changes)

Needs Node.js 20+. In the `2-SOURCE-CODE` folder:
```bash
npm install
npm run dev        # local preview at http://localhost:5173
npm run build      # creates dist/  <- this is what gets uploaded
npm run lint
```
- `VITE_*` values from `.env` are **baked in at build time**: changing a Google link requires `npm run build` again and re-uploading `dist`.
- After building, `dist/images/ckd-lead-banner.jpg` may reappear if that 6.7 MB file is still in `public/images/`. Nothing in the code uses it: delete it from `dist` (or from `public/images`) before uploading.
- Never leave a `.env.local` that points to `http://localhost:8787` (the fake test server) in place when building for production.
- To add a PDF: copy it into `public/resources/class-10/` (simple file name, no spaces), then add it to `src/config/resources.js` (the file explains the format).
- To change phone numbers, email, social links, career-test links: `src/config/site.js`. Prices: `src/config/pricing.js`. FAQ: `faq.js`. Blog: `blog.js`. Legal pages: `legal.js`.

---

## 5. Post-hosting checklist (do all, in a real browser, on the live address)

1. Home page loads, logo and images show, no broken pictures.
2. Click through every menu item: About, Services/Pricing, Career Test, Results, Free Resources, Blog, FAQ, Contact.
3. **Free Resources → Class 10 → English / Social Science / Science → Download** opens or downloads the PDF.
4. **Career Test** pop-up offers two tests and opens the Google Forms.
5. **Header search**: type "pricing" or "dmit" → it jumps to the page and spot.
6. **Lead form** (Contact page): submit a test entry → a new row appears in the Google Sheet tab "NEW WEBSITE CKD". (Delete the test row afterwards.)
7. **Lock icon (far right of header) → `#/admin`**: login page appears, the message does NOT say "not connected" or "older version". Log in as Bharat (`brxxckd1010`), set a new password, see Team today / Leave requests / All records / Staff.
8. **Forgot password** with `brxxckd1010` → a 6-digit code arrives at careerkadost@gmail.com.
9. Test on a phone (the layout is mobile-first).
10. After everyone has logged in once, delete `STEPS.txt` from anywhere it was shared.

## 6. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Blank page on a GitHub Pages site | Wrong base path. The workflow sets it to `/<repo-name>/`. For a custom domain use `/`. |
| Admin page says "not connected" | The site was built without `VITE_ADMIN_API_URL`. Set it and rebuild (secrets for GitHub Pages / env var on Vercel). |
| Admin page says the script is older / blank panels | The Apps Script is not on portal-v8, or "New version" was not deployed. Redo section 2. |
| "Wrong username or password" for Bharat | Username has **two x**: `brxxckd1010`. First password `brxxckd1010@123`. Run `applyFixedUsernames` if the old username is still in the Sheet. |
| No reset email | Run `testEmail` once and allow the permission; check Spam; only the exact owner username triggers an email; max 1 per minute and 5 per hour. |
| Leads not appearing in the Sheet | Wrong or expired lead-script link; open the `/exec` link, it should answer. Redeploy as **New version** if code changed. |
| Admin works on localhost but not live | Live build still contains the localhost fake link (`.env.local` left behind). Delete it and rebuild. |
| Old content after upload | Browser/host cache: hard refresh (Ctrl+F5); on Netlify clear cache and redeploy. |
| First request to Admin is slow (a few seconds) | Normal: Google idles Apps Script. The site sends a wake-up request when the Admin page opens. |

## 7. Rules for the next Claude Code

- Do not undo anything under "Decisions that are final" in `HANDOFF.md` (fixed usernames, `username@123`, owner does not check in/out, only the owner resets passwords, no security questions, 10:10 AM late rule, admin = lock icon only, no Instagram gate, no black in the design).
- Never publish `.env`, `STEPS.txt`, or the Google Sheet contents publicly.
- Never reveal or reuse real passwords in chat; first passwords are only the documented `username@123` pattern.
- Anything that sends email, publishes the site, or changes the owner's Google account: ask the owner first.
- Keep the owner's instructions copy-paste simple and in plain English.

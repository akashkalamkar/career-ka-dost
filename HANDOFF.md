# Career Ka Dost - Project Handoff

Written 21 Oct 2026. Read this first, then continue the work. Everything below is the true state of the project.

**How to host and what each folder/file is for: see HOSTING-GUIDE.md.**

## 0. Paste this into the new Claude Code session

> Read `HANDOFF.md` in this folder completely before doing anything. It is the full history and current state of the Career Ka Dost website and its staff portal. Then run `npm install`, `npm run dev`, and `node scripts/portal-tests/run-all.cjs` to confirm everything works (expect 193 tests passing). The owner of the project is non-technical, writes short messages, wants copy-paste steps and never wants to open VS Code. Do not change any behaviour listed under "Decisions that are final" without asking.

---

## 1. Who and what

- **Client:** Kalpak Dorlikar works for **Career Ka Dost**, a career-counselling company in **Nagpur, India**. Founder / owner: **Bharat Rai**.
- **Project:** a marketing website (React) plus a staff attendance and leave portal (hidden behind a lock icon in the header, backed by Google Apps Script and a Google Sheet).
- **Contacts on the site:** phone +91 9503821010 and +91 9272397879, email careerkadost@gmail.com, Instagram `careerkadost`, YouTube `@CareerKaDost`. All in `src/config/site.js`.
- **Working style of the user:** short, often typo-filled messages (capital letters when excited). Wants direct copy-paste instructions, no VS Code, plain-English answers, and wants things shown on localhost first. Said clearly: do not add employees on their behalf, Bharat Rai will add them himself.

## 2. Tech stack

- React 19, Vite 8, Tailwind CSS v4 (design tokens in `src/index.css` under `@theme`), Figtree font.
- **Hash routing** (`#/about`, `#/admin`, ...) so it works on any static host with no server rules.
- No backend of our own. Two Google Apps Script web apps: the **leads form** and the **staff portal**.
- Node 20+ needed. Commands: `npm install`, `npm run dev` (http://localhost:5173), `npm run build` (creates `dist`), `npm run lint`.

## 3. Folder map

```
career-ka-dost-main/            (project root, has package.json)
  index.html                    preconnect hints, meta
  vite.config.js
  .env                          the two live Google links (see section 7)
  .env.example
  RUN-DEV-SERVER.bat            double-click: npm install (first time) + npm run dev, for Windows, no typing needed
  HANDOFF.md                    this file
  README.md                     where to change things (prices, phone, FAQ, blog...)
  public/
    images/                     logos, founder, achievers, awards, testimonials
    resources/class-10/         3 downloadable sample-paper PDFs
  scripts/
    leads-google-apps-script.gs           the lead form backend (v5)
    staff-portal-google-apps-script.gs    the staff portal backend (portal-v9)  <- authoritative copy
    portal-tests/                         fake Google + 176 automated backend tests
  src/
    App.jsx                     routes and redirects
    admin/                      staff portal UI (AdminApp, Panels, Leaves, Forgot, Chips, api, format)
    components/                 all page sections and widgets
    config/                     editable content: site, pricing, faq, blog, legal, resources, achievers, testimonials, ui
    utils/                      lead submit, search index, jump-to-spot, whatsapp, email, date
```

Staff portal pages: `src/admin/AdminApp.jsx` (login, first-login password, dashboard shell), `Panels.jsx` (My attendance, Team today, All records, Staff, Change password), `Leaves.jsx` (Apply for leave, Leave requests), `Forgot.jsx` (owner forgot-password), `api.js` (one-request-per-action client), `Chips.jsx`, `format.js`.

## 4. Website - everything built

Pages (nav order): Home, About, Pricing/Services, Career Test, Results, Free Resources, Blog, FAQ, Contact, and a lock-icon-only **Admin** link on the far right of the header (not in the footer - this was an explicit request).

- **Redesign** to a positive, bright look. Black was removed almost everywhere: the footer is cream with bold text, the results graph/stairs go from pale to richer to brand yellow (brand yellow is `#ffb81c`) and a student with a chequered flag stands on the top stair (`Art3D.jsx`, `STEPS`, `WinnerStudent`).
- **Brand:** new logo files in `public/images/` (`logo.png`, `logo-mark.png`), tagline under the logo (`Brand.jsx`), coloured social icons in the footer, award logos next to award names (`public/images/awards/`).
- **Header search bar** with suggestions: picks a page and jumps to the exact spot (`SiteSearch.jsx`, `utils/searchIndex.js`, `utils/jump.js`).
- **Career Test pop-up** with two tests - Psychometric Aptitude Test and Career Interest Inventory - opening Google Forms (`CareerTest.jsx`, `CAREER_TESTS` in `site.js`). The DMIT card was renamed.
- **CTA buttons** are white and turn yellow on hover.
- **Free Resources page** (`Resources.jsx`, data in `src/config/resources.js`): tabs Class 9, 10, 11, 12; subject cards; each card says "N Resource(s)"; a pop-up lists downloads with "5 Sample Papers (2027)" in bold red and bold bullet points; real downloadable PDFs. Currently live PDFs: **Class 10 English, Social Science, Science, Maths Basic, Hindi Course A, Hindi Course B**. Maths Standard still has no PDF (same `options` pattern as the two Hindi courses). All of Class 9/11/12 say "Coming soon".
  - An Instagram-follow gate was tried and then **removed on purpose** (it cannot be verified automatically). Downloads are free and normal.
- **Lead form** posts to a Google Sheet (tab "NEW WEBSITE CKD") through `VITE_LEADS_WEBHOOK_URL`. A lead pop-up appears on the site but is suppressed on `#/admin`.
- Legal text (refund, terms, privacy) is in `src/config/legal.js` and should be reviewed by a human.

## 5. Staff portal - current design (portal-v9)

The portal page is `#/admin` (marked `noindex`). The backend is `scripts/staff-portal-google-apps-script.gs`, pasted into the Apps Script editor of the Google Sheet "CKD EMPLOYEE PORTAL". The client sends one JSON request per action as `text/plain` (no CORS preflight) and every write action replies with the full fresh state (`bootstrap`), so the screen never needs a second request.

### Only the owner is created automatically (changed 21 Oct 2026, owner's instruction)
`setupPortal()` (and the `STAFF` constant it reads) now seeds **only** the owner. There are no pre-made employee accounts any more.

| Person | Role | Username | First password |
|---|---|---|---|
| Bharat Rai | owner | `brxxckd1010` (two x) | `brxxckd1010@123` |

Bharat Rai adds every employee himself, whenever he is ready, from his **Staff** tab in the portal (**Add employee**): he types the person's name and chooses their username there (same rules as before - 4-30 chars, starts with a letter, must contain a digit, no reserved words, unique). The first password is set automatically to that username + `@123`, exactly like the owner's. Usernames are still fixed forever once created.

**Important caveat for whoever picks this up next:** this only changes what a *fresh* `setupPortal()` run seeds. The already-live "CKD EMPLOYEE PORTAL" sheet may still have old rows for Kalpak Dorlikar, Mallika Rahate, Samiksha Waghmare and Nandini Atkar from before this change (`setupPortal()` only adds missing accounts, it never removes existing ones). This code change does **not** touch those existing rows. If the owner wants them gone from the live sheet too, that needs a separate, explicit decision - discontinue them from the Staff panel (keeps their history, "Decisions that are final" says employees are never deleted) or he removes the rows himself in the Sheet. Do not delete rows on his behalf without him asking for that specifically.

The user once typed `brxckd1010` by mistake. The real one is `brxxckd1010`. `USERNAME_FIXES` in the `.gs` file still has the mapping for Bharat Rai (and Kalpak Dorlikar, left over from before this change, harmless if he is not in the sheet - `applyFixedUsernames()` just logs "not found" and moves on).

### Rules
- First password is always `username@123`. At first login the person must set their own password (password only; username is never editable). Any code that tries to change a username is rejected (there is no such action).
- **Only Bharat Rai resets passwords.** Employees' passwords: from his **Staff** tab (temporary password shown to him, employee must change it at next login). His own: **Forgot password?** on the login page, type `brxxckd1010`, a 6-digit code is emailed to `careerkadost@gmail.com`, he types the code plus a new password. No security questions (that step was removed). Code valid 15 min, 5 tries, one email per minute, 5 per hour. The page answers identically for any username, so nobody can learn which username is the owner's; the forgot page itself pauses for 15 min after 10 tries. A "password changed" notice goes to the same address.
- Employees can still change **their own** password after login (this was my assumption; see open questions).
- **Attendance:** check-in and check-out use the **server clock in IST**, never the browser. Check-in at or after **10:10:00 AM = Late (red)**, before it = **On time (green)**. One check-in and one check-out per day. The **owner does not check in or out**.
- **Owner views:** Team today (active employees, with an on-leave chip), Daily reports (everyone's "today's work done" text, by date - added 23 Oct 2026), Leave requests (pending count in the tab), All records (month picker plus instant per-person filter, CSV export), Staff (add, reset password, discontinue/reactivate), Change password.
- **Employee views:** My attendance (check in/out, month list, plus a "Today's work done" text box right there - added 23 Oct 2026), Apply for leave, Change password. Employees see only their own data.
- **Daily work report (added 23 Oct 2026, owner's request):** each employee has one free-text box, up to 4000 characters, for what they worked on that day. Submitting again the same day replaces it (no duplicates) - there is no lock, so it can be edited any time before midnight IST. The owner does not submit one (same pattern as not checking in/out). The owner's **Daily reports** tab picks any date (defaults to today) and shows every active employee by name, with their text if they wrote one, or "No report submitted for this date" if not. Backend: `submitReport` (employee, one entry per day) and `teamReports` (owner, read by date) actions; stored in a new `DailyReports` sheet tab, date + username + name + text + updated-on, same privacy pattern as attendance (employees only ever see or write their own).
- **Leave:** full day or half day (First half / Second half), calendar date or range, reason; a "Leave applied" dialog; employees can cancel while pending; the owner accepts, rejects or changes his mind later. Clashing requests are blocked, up to 60 days, only today or later.
- **Staff management:** the owner adds an employee by typing the name and choosing the username (4-30 chars, starts with a letter, letters/digits/dot/underscore, must contain a digit, not containing admin/owner/portal/staff/login/password, unique). First password is forced to `username@123`. Employees are **discontinued, never deleted**; all their records stay. The owner cannot be discontinued.
- **Security:** salted SHA-256 hashes (150 rounds); sessions stored in Script Properties for 12 h; 5 wrong passwords lock that username for 15 min; session tokens are random UUIDs; employees only receive their own rows from the server.
- The login page, first-login form and every panel guard against an **out-of-date script**: if the pasted Apps Script is older than the site (reply missing fields), the UI shows a clear "update the script" message instead of a blank page.

### Sheet layout (auto-created by `setupPortal()`)
- `Staff`: Username, Name, Role, Salt, Password hash, Must change password, Active, Last login (8 columns). Discontinued rows (Active = `FALSE`) are shaded grey automatically (added 21 Oct 2026, same request as "only the owner is seeded"). Salt and Password hash are never plaintext - no password, first or reset, is ever written anywhere in the Sheet.
- `Attendance`: Date, Username, Name, Check-in, Check-out, Status, Hours worked (colour-coded rows).
- `Leaves`: ID, Username, Name, Type, Half, From, To, Days, Reason, Applied on, Status, Decided by, Decided on.
- `DailyReports` (added 23 Oct 2026): Date, Username, Name, Report, Updated on. One row per person per day; resubmitting the same day overwrites that row rather than adding a new one.

### Functions you can run from the Apps Script editor
`setupPortal` (first time only, safe to re-run), `applyFixedUsernames` (renames people per `USERNAME_FIXES`, moves their records, resets them to `username@123`), `setFirstPasswords`, `testEmail` (also grants the mail permission), `resetOwnerPassword` (emergency: new temporary owner password in the Execution log).

## 6. Where the user is right now (open items, in priority order)

1. ~~Host the website.~~ **Done, 23 Oct 2026.** Live at **www.careerkadost.com**, hosted on **Vercel**, auto-deploying from the GitHub repo `careerkadost-commits/career-ka-dost` (the owner's own new GitHub account, under the Vercel account `akashkalamkar` - see the new section 13 below for the full story and how to ship a future update). `VITE_LEADS_WEBHOOK_URL` and `VITE_ADMIN_API_URL` are set as Environment Variables (type Config, not Secret) in that Vercel project, and confirmed working in the browser (lock icon login worked).
2. ~~Update the live Apps Script to portal-v7.~~ Then v8. **The owner set up a brand-new Google Sheet from scratch on portal-v8 and confirmed it live** (`/exec` answered `"version":"portal-v8"`, 23 Oct 2026). **Superseded the same day:** the script changed again, to `portal-v9` (section 5 - the new Daily reports feature). **The owner still needs to deploy portal-v9**: paste `Staff-Portal-Setup/Code.gs` into Apps Script (same Sheet as before, do **not** make another new one), Deploy > Manage deployments > pencil > New version. Check the `/exec` link shows `"version":"portal-v9"`. The `/exec` URL itself does not change, so no website rebuild is needed for this step alone.
3. ~~Confirm with the user: should employees keep the ability to change their own password?~~ **Answered 21 Oct 2026: yes, keep it.** This is already the current behaviour, no code change needed.
4. **Content the user still has to give:** Maths Standard PDF (Maths Basic is now live), Class 9/11/12 PDFs, LinkedIn URL (`linkedinUrl` in `site.js` is empty, adding one shows the icon automatically), real prices (`src/config/pricing.js`; an empty price shows "Price on request"), a human review of the legal text, a YouTube link check.
5. After everyone has logged in once, remove `Staff-Portal-Setup/STEPS.txt` from any shared place (it lists the owner's first password).
6. **Decide what to do with any Kalpak/Mallika/Samiksha/Nandini rows that may exist in an OLDER Google Sheet** from before the "only the owner is seeded" change (see section 5's caveat). Moot if the owner is now only using the brand-new sheet from item 2 - check which Sheet the live `/exec` link actually points at before acting on this.

## 7. Secrets and links (keep private)

`.env` (not uploaded to git because of `.gitignore`):
- `VITE_LEADS_WEBHOOK_URL` - the lead form Google Apps Script `/exec` link.
- `VITE_ADMIN_API_URL` - the staff portal `/exec` link: `https://script.google.com/macros/s/AKfycbwSH-i_US9lcc_M0tVN8hKvltyjiboPnXXGBij0Jf-C58fsswzprVrcRk0pFrqr1znOkw/exec` (**updated 21 Oct 2026** - the owner deleted the old "CKD EMPLOYEE PORTAL" sheet and set up a brand new one from scratch, matching the only-the-owner-seeded `portal-v9` script. The site was rebuilt with this new link baked in. Not independently verified by Claude Code in this session - this environment's network cannot reach `script.google.com` to confirm the `/exec` link answers. The owner should open it in a browser once and confirm it shows `"version":"portal-v9"`.)
These are baked into the site at **build** time, so changing them needs `npm run build` again. If the portal is redeployed as a brand-new deployment (not "New version"), the `/exec` link changes and `.env` must be updated.

Apps Script web apps are deployed "Execute as: Me, Who has access: Anyone". Updates MUST be published with Deploy > Manage deployments > pencil > **New version**, otherwise the link keeps serving the old code.

## 8. Testing

- `node scripts/portal-tests/run-all.cjs` - runs the real `.gs` file against an in-memory fake of Google Services (`mock-portal.cjs`: Sheets, Properties, Cache, Lock, Mail, Utilities, with a controllable IST clock). **193 tests, all passing** at handoff: core login/attendance (35), leave (35), forgot-password (28), staff add/discontinue (33), fixed usernames (45), daily reports (17). `run-all.cjs` seeds the test employees itself now (via a `RUN_EXTRA` script, same shape as `addStaff`) since `setupPortal()` only creates the owner - see section 5.
- `mock-portal.cjs` can also serve the portal on http://localhost:8787 for browser tests: `RUN_SETUP=1 node scripts/portal-tests/mock-portal.cjs scripts/staff-portal-google-apps-script.gs 8787`, and then put `VITE_ADMIN_API_URL=http://localhost:8787` in a `.env.local` and run `npm run dev`. **Delete `.env.local` afterwards** or the built site would point to the fake. Test endpoints: `/__time?ist=2026-10-19T09:00:00` (set the fake clock), `/__mail` (read the fake mailbox), `/__eval?code=...`, `/__sheet`.
- The mock is a simulation. The real Google script has also been called live (about 1.4-2 s per call round trip), but the real mail sending and real Sheet formatting have not been seen by me.
- Browser checks done on localhost: login, forced first password, check-in (one request), owner views, leave flow, add/discontinue/reactivate, the emailed-code reset.
- `npm run lint` passes; `npm run build` passes.

## 9. Decisions that are final (do not undo without asking)

- Admin entry is a **lock icon only**, far right of the header; not in the footer.
- No Instagram-follow gate on downloads.
- Usernames are **fixed**. First password is **always `username@123`**.
- The owner does **not** check in or out.
- Only the owner resets passwords; the owner's own reset is by emailed code to careerkadost@gmail.com, **no security questions**.
- Employees are discontinued, never deleted.
- Late rule: **10:10:00 AM**.
- Avoid black in the design; keep the bright, positive colour scheme; footer is cream.
- Keep actions fast: one request per action.
- The user wants copy-paste instructions; do not require VS Code from them.

## 10. Gotchas learned the hard way

- `package.json` has `"type": "module"`, so Node scripts that use `require` must be `.cjs` (the mock and runner are).
- On Windows PowerShell 5.1: no `&&`; use here-strings carefully; write Python/JS helper scripts to files rather than inline.
- Do not use the Write tool with short or odd paths (it once created stray files in `C:\`); always use full paths inside the project.
- `public/images/ckd-lead-banner.jpg` is 6.7 MB and is not referenced anywhere in the code; it is left out of the zips. Delete it from `public/images` if confirmed unused, or compress it.
- Google Apps Script idles; the first request after a pause can take a few seconds. `warmUp()` in `api.js` sends a harmless GET when the admin page opens.
- Do not name an exported helper file `.jsx` if it has no JSX (a `format.jsx` to `format.js` rename caused a stale Vite module graph; restart the dev server after renames).

## 11. Packaging recipe

- **Website to host:** `npm run build`, then upload everything inside `dist`. (Remove `dist/images/ckd-lead-banner.jpg` first if it is unused, it saves 6.7 MB.)
- **Source zip for handoff:** the project folder without `node_modules`, `dist`, `.claude`, and `.env.local`. Keep `.env` (it holds the two live links).
- Zip with forward-slash entry names (use .NET `ZipArchive`; the old `Compress-Archive` in PowerShell 5.1 writes backslashes that break on Linux/Mac).
- **Local-preview launchers (added 21 Oct 2026):** `RUN-WEBSITE-LOCALHOST.bat` + `serve-website.ps1` sit at the package root next to `1-WEBSITE-TO-HOST`; they serve the built site on `http://localhost:5173/` with a plain PowerShell `HttpListener` (no Node, no install — this is what the owner uses instead of a Claude-given localhost link, since a cloud Claude Code session cannot open one on his machine). `RUN-DEV-SERVER.bat` sits inside the source project and runs `npm install` (first time only) + `npm run dev` for the live-editing version. When rebuilding for a handoff: after `npm run build`, copy the new `dist` contents over `1-WEBSITE-TO-HOST` so the no-install launcher shows the latest version too.

## 12. Possible next improvements (not requested yet)

- Monthly attendance summary per employee (days present, late count) for the owner.
- A daily email to the owner listing who is late or absent, or a digest of that day's work reports.
- Employees' leave balance.
- SEO pass (per-page titles/descriptions are hash-routed so crawlers see one page; consider moving to real paths and a static host redirect if SEO matters).
- A WhatsApp click-to-chat tracking tag, Google Analytics, and Search Console setup after the site is live.
- A way for the owner to export/download the Daily reports for a date (currently view-only in the portal; the Sheet itself can always be opened directly for that).

## 13. How the website is actually hosted (read this before touching deploys, 23 Oct 2026)

This is NOT what the original packaging recipe (section 11) assumed - it predates a live GitHub+Vercel setup. The real picture, found and set up in this session:

- **Domain:** `www.careerkadost.com`, already pointed at Vercel from before this session (DNS not touched).
- **Vercel project:** `career-ka-dost`, inside the Vercel **team "CKD"**, under the Vercel account **`akashkalamkar`** (the original developer's account - the owner does not have that Vercel login, but could operate the dashboard once someone is signed in to it; it was open and usable throughout this session).
- **GitHub repo it deploys from:** `careerkadost-commits/career-ka-dost` - a **brand new GitHub account the owner made himself** (`careerkadost-commits`, under careerkadost@gmail.com), **not** the original developer's `akashkalamkar/career-ka-dost` repo. The owner was later also given push access to the original `akashkalamkar/career-ka-dost` repo, but that is a **different, disconnected repo** now - pushing there does nothing for the live site. **Always push to `careerkadost-commits/career-ka-dost`.**
- **Environment Variables** are set directly in that Vercel project (Project > Environment Variables), type **Config** (not Secret - an already-saved Secret cannot be edited/viewed again, which caused real confusion in this session; Config can be viewed and re-saved). They must be set to the current `.env` values any time those links change (e.g. after the owner's Google Sheet is replaced).
- **To ship a future code change to the live site (no GitHub Desktop-literate dev required, but the owner now has both GitHub Desktop and a GitHub account):**
  1. Build/test here as normal (`npm run build`, run the tests, `npm run lint`).
  2. Hand the owner a zip of the updated project (same shape as the handoff zip, source only, no `node_modules`/`dist`/`.env`).
  3. The owner: unzip it, copy everything inside the `career-ka-dost` folder over the files in his existing local clone (`C:\Users\Administrator\Documents\GitHub\career-ka-dost`, the one cloned from `careerkadost-commits/career-ka-dost`), replacing when prompted.
  4. In **GitHub Desktop**: type a commit summary, **Commit to main**, **Push origin**.
  5. Vercel auto-builds and deploys within ~1-2 minutes (it is correctly connected - confirmed working 23 Oct 2026). No manual Vercel step needed unless Environment Variables also changed (see above).
- **Known trap already hit once:** the Vercel project's Git connection can silently become "disconnected" (shows a "Connect Git" button instead of the repo name on the Overview page) without the website going down - it just freezes on whatever was last built and stops noticing new pushes. If a push does not show up as a new Vercel deployment within a couple of minutes, check Project > Settings > Git first.
- The owner was told Vercel's free "Hobby" plan is technically for non-commercial use and Vercel's own terms would prefer the paid "Pro" plan (~$20/month, verify the current price on Vercel's own page) for a real business site; he has not decided whether to upgrade yet.


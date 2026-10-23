# Career Ka Dost - Website

Career guidance and admission counselling website for Career Ka Dost, Nagpur.
Built with React + Vite + Tailwind CSS. The booking form saves leads to a Google Sheet.

## Run it on your computer

1. Install **Node.js** (version 20 or newer) from nodejs.org.
2. Open this folder in **VS Code** (File > Open Folder, choose the folder that contains `package.json`).
3. Open the terminal in VS Code (Ctrl + `) and run:

```bash
npm install
npm run dev
```

4. Open http://localhost:5173 in your browser.

## Put it on the internet

```bash
npm run build
```

This creates a `dist` folder, which is the finished website. Upload that folder to any static host,
for example drag it onto **app.netlify.com/drop**. After any change, run `npm run build` again and upload the new `dist`.

If the site is served from a sub-folder, set `VITE_BASE_PATH` before building (see `vite.config.js`).

## Where to change things

| What | File |
|---|---|
| Phone numbers, email, address, social links | `src/config/site.js` |
| The two career tests (names and Google Form links) | `CAREER_TESTS` at the bottom of `src/config/site.js` |
| Prices of the services (empty price shows "Price on request") | `src/config/pricing.js` |
| Free Resources page (classes, subjects, PDF downloads) | `src/config/resources.js` (PDF files in `public/resources/class-10/` etc.) |
| FAQ questions | `src/config/faq.js` |
| Blog articles | `src/config/blog.js` |
| Refund Policy, Terms, Privacy | `src/config/legal.js` |
| Student testimonials | `src/config/testimonials.js` (photos in `public/images/testimonials/`) |
| CAP round achievers | `src/config/achievers.js` (photos in `public/images/achievers/`) |
| Colours and font | `src/index.css` |
| Button styles | `src/config/ui.js` |
| The booking form (pop-up and Contact page use the same one) | `src/components/LeadCard.jsx`, `src/components/LeadFields.jsx` |

Pages are in `src/components/` and are connected in `src/App.jsx`.

## Google Sheet for leads

Leads are saved by a Google Apps Script web app.

1. Open the spreadsheet > **Extensions > Apps Script** (or script.google.com > New project).
2. Paste the whole file `scripts/leads-google-apps-script.gs`. Check `SHEET_ID` and `TAB_GID` at the top.
3. Run **`setupLeadSheet`** once (approve the permissions). Run **`repairSourceColumn`** only if older rows are misplaced.
4. **Deploy > New deployment > Web app** (Execute as: Me, Who has access: Anyone). Copy the `/exec` address.
5. Copy `.env.example` to `.env` and set `VITE_LEADS_WEBHOOK_URL` to that address. Restart `npm run dev` and rebuild.
6. Opening the `/exec` address in a browser should show the script version (for example "v5").

New leads appear at the top of the tab, with the date and time added automatically and a **Status** dropdown:
New lead (red), Contacted (orange), Converted (green), Dead lead (black).

If you change the script later, publish it with **Deploy > New deployment** and update `.env` with the new address.

## Staff portal (login and attendance)

The Staff login page is at `#/admin` (there is a small "Staff login" link at the bottom of every page). Staff log in with a
username and password, then press **Check-in done** when they arrive and **Check-out done** when they leave. The time is saved
automatically from the server clock (India time). Check-in before 10:10 AM is green, from 10:10 AM it is red. The owner
(Bharat Rai) also sees the whole team, all records by month, and can reset anyone's password.

The website has no server of its own, so the portal runs on a Google Sheet plus a Google Apps Script, the same way the lead form does:

1. Create a NEW Google Sheet (for example "CKD Staff Portal"), open **Extensions > Apps Script**, paste `scripts/staff-portal-google-apps-script.gs`.
2. Put the first passwords in `DEFAULT_PASSWORDS`, run **`setupPortal`** once, then delete the passwords from the script again.
3. **Deploy > New deployment > Web app** (Execute as: Me, Who has access: Anyone). Copy the `/exec` address.
4. Put it in `.env` as `VITE_ADMIN_API_URL=...`, then `npm run build` and upload again.

Passwords are stored only as salted hashes in the sheet's "Staff" tab. Do not share that sheet with the whole team: keep it with the owner.
Attendance is in the "Attendance" tab (red rows are late, green rows are on time).

## Before launching, please check

- Service prices in `src/config/pricing.js` (currently "Price on request").
- Add the LinkedIn link in `src/config/site.js` (`linkedinUrl`) and confirm the YouTube link.
- Read the Refund Policy, Terms, Privacy, FAQ and blog posts. They are drafts.
- The achievers' college names are copied as printed on the poster. Please check the spelling.

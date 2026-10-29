# Career Ka Dost - instructions for Claude Code

This project is the website and staff portal of **Career Ka Dost** (career counselling, Nagpur). It was built and redesigned over a long earlier session. You are continuing that work.

**Before doing anything, read these two files completely:**
1. `HANDOFF.md` - full history, current state, staff portal rules, open items, decisions that are final, gotchas.
2. `HOSTING-GUIDE.md` - what every folder/file is for and how to put the site online.

Then confirm the project works:
```bash
npm install
npm run dev                                   # http://localhost:5173
node scripts/portal-tests/run-all.cjs         # expect: TOTAL: 246 passed, 0 failed
```

## Rules
- The owner (Kalpak) is non-technical and does not want to open VS Code. Give short, copy-paste, click-by-click steps in plain English. Ask before anything that sends email, publishes the site, or changes his Google account.
- Do not change anything under "Decisions that are final" in `HANDOFF.md` without asking (fixed usernames, first password = `username@123`, owner does not check in/out, only the owner resets passwords, no security questions, 10:10 AM late rule, admin = lock icon only, no Instagram gate, no black in the design).
- The backend of the staff portal is `scripts/staff-portal-google-apps-script.gs` (version `portal-v13`). Google runs `portal-v12` until the owner pastes v13 in (see HANDOFF.md section 6). If you change it further, bump `SCRIPT_VERSION`, run the tests, and tell the owner to paste it into Apps Script and deploy **New version** (same `/exec` link).
- `.env` holds the two live Google links and is baked into the site at build time. Never commit or publish it. Never leave a `.env.local` pointing at `http://localhost:8787` when building for production.
- Windows PowerShell 5.1 is the shell: no `&&`; write helper scripts to files instead of long inline quoting; use full paths when writing files.
- The website is English-only. A Hindi/Marathi version was built and then removed at the owner's request (29 Oct 2026); do not add it back without asking.
- Before creating a new file, check that the path does not already exist (a utility file was once overwritten by mistake this way).
- Verify changes in the browser/dev server and with the tests before saying they are done. Report plainly what was and was not tested.

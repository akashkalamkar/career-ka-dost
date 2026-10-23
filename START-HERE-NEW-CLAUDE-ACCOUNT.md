# START HERE - continuing Career Ka Dost in Claude Code on another account

You are using a different Gmail / Claude account, so the new Claude has no memory of the earlier work. Everything it needs is in this package. Follow these steps exactly.

## What you have

```
Career-Ka-Dost-FOR-CLAUDE-CODE.zip
├── START-HERE-NEW-CLAUDE-ACCOUNT.md     (this file)
├── RUN-WEBSITE-LOCALHOST.bat            double-click: shows the website on localhost (no install)
├── serve-website.ps1                    used by the .bat file
├── 1-WEBSITE-TO-HOST/                   the finished website (this is also what you upload to a host)
├── career-ka-dost/                      the full project (this is the folder Claude Code opens)
│   ├── CLAUDE.md                        Claude Code reads this automatically
│   ├── HANDOFF.md                       complete history and current state
│   ├── HOSTING-GUIDE.md                 which folder/file is for what, and how to host
│   ├── RUN-DEV-SERVER.bat               double-click: editable version on localhost (needs Node.js)
│   ├── package.json, src/, public/, scripts/ ...
│   └── .env                             the two live Google links (private)
└── Staff-Portal-Setup/
    ├── Code.gs                          staff portal backend (paste into Google Apps Script)
    └── STEPS.txt                        update steps + first usernames/passwords (private)
```

## FIRST: see the website on your computer (localhost) without Claude

If the new Claude does not give you a localhost link, you do not need it. After unzipping:

- **Fastest, nothing to install:** double-click `RUN-WEBSITE-LOCALHOST.bat` (in the unzipped folder, next to `1-WEBSITE-TO-HOST`). A black window opens and your browser shows the website, for example `http://localhost:5173/` (if that number is busy it uses 5174, and so on; the window tells you the exact address). The staff portal is the same address plus `#/admin`. Keep the black window open; close it to stop. If Windows says "protected your PC", click **More info**, then **Run anyway**.
- **Editable version** (needs Node.js, see Step 2): open the `career-ka-dost` folder and double-click `RUN-DEV-SERVER.bat`. It installs once, then opens `http://localhost:5173/` and updates live when files change.

Claude running in the cloud or on the web cannot open a localhost page on your computer. These two files are the way to see it yourself. Ask Claude to change things, then refresh the page. After changes that Claude makes in the source, the first launcher still shows the OLD built site; use `RUN-DEV-SERVER.bat` to see changes live, or ask Claude to rebuild (`npm run build`) and copy the new `dist` into `1-WEBSITE-TO-HOST`.

## Step 1 - Unzip

Right-click `Career-Ka-Dost-FOR-CLAUDE-CODE.zip`, choose **Extract All**, and pick a short, simple place such as `C:\CKD` (long folder names can break Windows paths). You will get the folders shown above.

## Step 2 - Install Node.js (once)

Download the LTS version from nodejs.org and install it (Next, Next, Finish). Needed only to edit, run the dev server, or rebuild the site.

## Step 3 - Open the project in Claude Code

- Open Claude Code (the Claude desktop app, Code tab, or `claude` in a terminal).
- Sign in with the new Gmail account.
- Choose the folder `career-ka-dost` (the one that contains `package.json` and `CLAUDE.md`), not the zip and not its parent.

## Step 4 - Paste this as the first message

> Read CLAUDE.md, then HANDOFF.md and HOSTING-GUIDE.md completely before doing anything. They are the full history and current state of the Career Ka Dost website and staff portal, built in an earlier session on another account. Then run npm install, npm run dev, and node scripts/portal-tests/run-all.cjs, and tell me in simple words: (1) what is finished, (2) what is still pending, (3) what you recommend we do first. I am not technical, so give me copy-paste steps and never ask me to open VS Code. Do not change anything listed under "Decisions that are final" without asking me.

Claude should answer with a short summary and 176 tests passing. If it does, you are fully set up.

## Step 5 - What to ask it next (pick what you need)

- "Help me host the website. I want to use ___ (Netlify / my domain's cPanel / GitHub Pages)." (all steps are in `HOSTING-GUIDE.md`)
- "Add the Maths Basic / Maths Standard / Hindi PDFs" (send the PDFs; they go into `public/resources/class-10/`).
- "Give Mallika, Samiksha and Nandini real usernames" (tell it the usernames).
- "Add my LinkedIn link", "Change prices", "Add a blog article", "Change phone number".
- "Add a monthly attendance summary for Bharat Rai" or "email me every day who was late".

## Things to know

- The staff portal is already live on Google (`portal-v7`). The new Claude does not need to redo the Google setup unless it changes `Code.gs`. If it does, it will tell you to paste the new code into Apps Script and deploy New version (the link stays the same).
- The two Google links in `.env` are private. Do not post them publicly. Keep `STEPS.txt` private and delete it once everyone has logged in once.
- Bharat Rai's username is `brxxckd1010` (two x), first password `brxxckd1010@123`. Everyone sets their own password at first login.
- If Claude Code asks permission to run commands (npm, node), allow them. They only run inside this folder.
- Nothing from the old chat is lost: `HANDOFF.md` holds all rules and decisions. If you change something important later, ask Claude to "update HANDOFF.md" so the next session stays in sync.

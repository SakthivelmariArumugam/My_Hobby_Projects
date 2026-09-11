# DSA Sheet 📘

A clean, offline **Data Structures & Algorithms tracker** with a login screen.
Built with plain HTML, CSS, and JavaScript — no build tools, no server needed.

## Features
- 🔐 **Login / Sign up** — mock auth stored in the browser (localStorage)
- 🛡️ **Admin panel** — manage users, add/edit/delete problems, view global stats
- ✅ **Status tracking** — click the circle to cycle: Unsolved → Solved → Revisit
- 🗂️ **Topics & difficulty** — problems grouped by topic, tagged Easy/Medium/Hard
- 🔎 **Filters & search** — filter by topic, difficulty, status, or search by name
- 📊 **Progress tracking** — overall progress bar + per-topic progress + stat cards
- 📝 **Notes & links** — add personal notes per problem; each links to LeetCode
- 👤 **Per-user data** — every account keeps its own progress

## How to run
Just open **`index.html`** in your browser. That's it.

1. Open `index.html`
2. Click **Sign Up** and create an account
3. Start tracking problems on the dashboard

### Admin login
Log in with the preset admin account to reach the admin panel. The credentials
are set in `js/data.js` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — change them there.

The admin panel (`admin.html`) has three tabs:
- **Overview** — total users, problems, solves, average progress, most-solved ranking
- **Users** — every registered account with their progress; delete accounts
- **Problems** — add / edit / delete problems (changes appear on every user's dashboard)

> Tip (optional): for a nicer local server, run `npx serve` in this folder,
> or in VS Code use the **Live Server** extension.

## Project structure
```
Learning_Sheet/
├── index.html        # Login / signup page
├── dashboard.html    # Main DSA sheet (users)
├── admin.html        # Admin panel
├── css/
│   └── styles.css    # All styling
└── js/
    ├── auth.js       # Login / signup logic (+ admin login)
    ├── data.js       # Seed problems + shared problem store + admin creds
    ├── dashboard.js  # User app: status, filters, progress, notes
    └── admin.js      # Admin app: users, problems, stats
```

## Add your own problems
Open `js/data.js` and add entries to the `DSA_SHEET` array:
```js
{ id: "arr9", topic: "Arrays", name: "3Sum", difficulty: "Medium", link: "https://leetcode.com/problems/3sum/" }
```
Each `id` must be unique. New topics appear in the filter automatically.

## ⚠️ Security note
Authentication is a **client-side demo** — passwords are lightly hashed but data
lives in the browser only. The admin credentials are hardcoded in `js/data.js`,
so anyone can read them in dev tools. Do **not** use this for real accounts.
To make it production-ready you'd add a backend (Node/Express, etc.) with real
password hashing, a database, and server-enforced admin roles.

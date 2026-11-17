# Spec

A small Node.js and Express site that shows the CV of Igors Volohovs as a one-page portfolio, renders the CV's PDF in the page with PDF.js, and lets the owner replace that PDF after logging in. It also carries the lab tooling: `recipe.ps1`, git and Claude Code hooks, and Gitea workflows.

Every `##` section below is one task. `Status` is one of To Do, In Progress, In Review, Done. The whole file is one ticket in Jira project KAN (the `Jira` line below), where every task is a checkbox: tick it there and the sync marks the task Done here; add one there and it is appended here.

Jira: KAN-57

## Portfolio page
Status: Done

`public/index.html` is a static one-page portfolio styled with Tailwind from its CDN; `GET /` gets it from the `express.static` middleware in `app.js`, which answers before the `GET /` route in `routes/cvRoutes.js` that sends the same file. It has About, Work Experience, Skills, Education, CV and Contact sections behind a sticky anchor-link navigation bar, the portrait `public/images/photo.jpg` (stored in Git LFS) with a placeholder image if it fails to load, and links to email, Telegram, GitHub and LinkedIn.

## In-page CV viewer
Status: Done

An inline module script in `public/index.html` loads PDF.js from `/pdfjs/pdf.mjs`, which `app.js` serves from `node_modules/pdfjs-dist/build`, and draws `/uploads/cv.pdf` one page at a time on a canvas at scale 1.5. Previous and Next buttons with a page counter switch pages, queueing a request that arrives during a render, and a spinner shows while a page renders. If the PDF fails to load, an error message is shown and the controls and viewer are hidden; a link offers the same file for download.

## Admin login and logout
Status: Done

`GET /login` renders `views/login.ejs`, and `POST /login` in `routes/cvRoutes.js` compares the submitted name and password with `ADMIN_USERNAME` and `ADMIN_PASSWORD`, sets `isAuthenticated` in an `express-session` session and redirects to `/upload`; a failure redirects back with a one-time message. `middleware/auth.js` sends a visitor without that flag to `/login`, and `POST /logout` destroys the session. The session cookie lasts one day and is `secure` when `NODE_ENV` is `production`.

## CV PDF upload
Status: Done

`GET /upload` and `POST /upload` in `routes/cvRoutes.js` sit behind `middleware/auth.js`. multer takes one file from the `cvFile` field, accepts only the `application/pdf` MIME type up to 5 MB, creates `public/uploads/` if it is missing and writes the file as `cv.pdf` over the previous one. Success renders `views/upload_success.ejs`; a missing file, a wrong type or an oversize file redirects to `/upload`, where `views/upload_form.ejs` shows the error.

## Server startup and configuration
Status: Done

`app.js` loads `.env` through dotenv, listens on `PORT` (3001 by default), serves `public/` as static files and mounts the routes. Without `SESSION_SECRET` it generates a random secret at each start, sessions sit in the default in-memory store of `express-session` and so end at every restart, and it warns on the console when `ADMIN_USERNAME` or `ADMIN_PASSWORD` is unset. Unmatched paths get a plain-text 404 and errors a plain-text 500; `npm start` runs it with node and `npm run dev` with nodemon.

## Lab recipe, hooks and workflows
Status: Done

`recipe.ps1` is the repository's interface: `test` points `core.hooksPath` at `.claude/hooks/git` and runs pytest, `ruff check` and `ruff format` over `.claude`, `info` prints name, code, version and summary, `clean` removes Python caches, and the other verbs print `nothing to <verb>`. The git hooks `.claude/hooks/git/commit-msg.ps1` and `.claude/hooks/git/pre-push.ps1` enforce a signed-off `<type>(<scope>): ...` subject and `ps-<issue>/<type>/<slug>` branch names from the recipe's lists, and `.claude/hooks/gate.ps1` denies Claude Code a recursive delete outside `$env:TEMP`, a force-push, a history rewrite on `test` or `release` and an unreadable tool call, logging to `.claude/logs/ai.jsonl`. `.gitea/workflows/` holds the propose, release-gate, release, test and sweep workflows.

## Automated tests for the routes
Status: To Do

The README states that nothing here runs or checks the JavaScript, and `recipe.ps1 test` only runs pytest and ruff over `.claude`, so a broken login or upload route reaches `test` unnoticed; `app.js` also calls `app.listen` on load and exports nothing a test could import. Done when a test suite (for example `node --test` with supertest) checks that `GET /` returns 200, `GET /upload` without a session redirects to `/login`, a wrong password redirects back to `/login`, and a non-PDF or a file over 5 MB is refused, and `recipe.ps1 test` runs it and exits non-zero when it fails.

## Keep the current CV when an upload is refused
Status: To Do

The multer disk storage in `routes/cvRoutes.js` writes every upload straight to `public/uploads/cv.pdf`, so a file over the 5 MB limit truncates the live CV and multer then deletes the partial file. On a local run, a 6 MB upload after a good one left `public/uploads/` empty and `/uploads/cv.pdf` answering 404. Done when an upload is written under a temporary name and renamed to `cv.pdf` only after it passes the size and type checks, so a refused upload leaves the previous `cv.pdf` unchanged.

## Remove the unused front-end leftovers
Status: To Do

`public/js/main.js` is loaded by no page and requests `/api/cv`, a route `routes/cvRoutes.js` does not define. `views/upload_form.html` and `views/upload_success.html` are older copies of the EJS views that `res.render` never picks, the first posting a `cvfile` field that `upload.single('cvFile')` refuses; `public/css/style.css` is linked only from those two files, and `public/js/pdfjs/build/` is a 2.8 MB copy of PDF.js that `public/index.html` does not use because it loads `/pdfjs/` from `node_modules/pdfjs-dist`. Done when these files are deleted and, after `npm install`, `npm start` and a PDF upload through `/upload`, the CV still renders on `/` and downloads from `/uploads/cv.pdf`.

## Hash the admin password and limit login attempts
Status: To Do

`POST /login` in `routes/cvRoutes.js` compares the password with `ADMIN_PASSWORD` in plain text using `===`, next to the code's own comment "For production, consider using password hashing (e.g., bcrypt)", and it places no limit on failed attempts. Done when `.env` holds only a bcrypt hash (for example `ADMIN_PASSWORD_HASH`), the check uses `bcrypt.compare`, and after 5 failed attempts from one address within 15 minutes `POST /login` answers 429.

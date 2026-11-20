# portfolio-site - software requirements specification

Reverse-engineered from the code on 2026-11-18 (branch `release`, commit
`8ba71c6`) and checked on 2026-11-20 against branch `ps-57/docs/spec-md`
(commit `8ec8c69`, based on `test` at `14d2a49`); the two trees differ only in
this file (`git diff --stat release HEAD`). Every requirement names the file
and line it was read from. Nothing here was taken from intent that the code
does not carry; gaps are in [section 9](#9-open-questions). The documentation
hub is [docs/README.md](docs/README.md).

The task list of this specification mirrors Jira ticket KAN-57: each `### 3.N`
subsection of section 3 is a feature the code implements, and each row of the
table in [section 3.8](#38-declared-but-not-implemented) is work that is
declared or proposed but not done in the code. This file merges the
requirements specification with the first `SPEC.md` of 2026-11-17: that
file's six done tasks are covered by sections 3.1 to 3.7, its four open tasks
are rows of section 3.8.

<!-- jira-sync:start -->
Jira: KAN-57

## Tasks

This list is one ticket in Jira project KAN, [KAN-57](https://igorsvolohovs.atlassian.net/browse/KAN-57). Each line is a checkbox there: tick it in Jira and the sync ticks it here; add a checkbox there and it is appended here. Done items are the features described in section 3; open items are what the project declares but the code does not do yet.

- [x] Server start and configuration (section 3.1) <!-- spec-server-start-and-configuration -->
- [x] Portfolio page and static content (section 3.2) <!-- spec-portfolio-page-and-static-content -->
- [x] PDF viewer (browser side) (section 3.3) <!-- spec-pdf-viewer-browser-side -->
- [x] Authentication (section 3.4) <!-- spec-authentication -->
- [x] CV upload (section 3.5) <!-- spec-cv-upload -->
- [x] Repository interface (section 3.6) <!-- spec-repository-interface -->
- [x] Development hooks and workflows (section 3.7) <!-- spec-development-hooks-and-workflows -->
- [ ] Automated tests for the routes (declared, not implemented) <!-- spec-automated-tests-for-the-routes -->
- [ ] Keep the current CV when an upload is refused (declared, not implemented) <!-- spec-keep-the-current-cv-when-an-upload-is-refused -->
- [ ] Remove the unused front-end leftovers (declared, not implemented) <!-- spec-remove-the-unused-front-end-leftovers -->
- [ ] Hash the admin password and limit login attempts (declared, not implemented) <!-- spec-hash-the-admin-password-and-limit-login-attempts -->
- [ ] One-time messages on the login and upload forms (declared, not implemented) <!-- spec-one-time-messages-on-the-login-and-upload-forms -->
- [ ] Lab requirements R-02, R-09, R-37, R-41, R-42 (declared, not implemented) <!-- spec-lab-requirements-r-02-r-09-r-37-r-41-r-42 -->
- [ ] Installer build, install/uninstall proof, wiki regeneration (declared, not implemented) <!-- spec-installer-build-install-uninstall-proof-wiki-regen -->
- [ ] Manual test list (declared, not implemented) <!-- spec-manual-test-list -->

<!-- jira-sync:end -->

## 1. Purpose and scope

The system is a single-process Node.js / Express web server that publishes a
portfolio page with the owner's CV and lets one administrator replace the CV's
PDF (`package.json:4`, `recipe.ps1:12`).

In scope:

- the server: `app.js`, `routes/cvRoutes.js`, `middleware/auth.js`;
- the pages: `public/index.html` and its inline PDF viewer, `views/*.ejs`;
- the repository's command interface `recipe.ps1` and the git hooks it
  installs (`.claude/hooks/git/`);
- the Claude Code hooks and the Gitea workflows (`.claude/hooks/*.ps1`,
  `.gitea/workflows/`) as development infrastructure: section 3.7 states what
  they do, sections 4.3 and 6 list their triggers and limits. They are not
  product behaviour.

Out of scope (not implemented, or not part of the product):

- editing the page's text through the site: the content is hard-coded in
  `public/index.html`;
- more than one account, user registration, password change;
- persistence other than the one PDF file: there is no database;
- TLS termination, process supervision, hosting: nothing in the repository
  configures them.

## 2. Context

Actors:

| Actor | How the code knows it | Source |
|---|---|---|
| Visitor | Anonymous; reads `/` and `/uploads/cv.pdf` | `app.js:18`, `routes/cvRoutes.js:46-49` |
| Administrator (owner) | The one name/password pair in `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `routes/cvRoutes.js:62-73` |
| Developer | Runs `recipe.ps1`, commits through the git hooks | `recipe.ps1`, `CLAUDE.md` |

External systems:

| System | Used by | Source |
|---|---|---|
| `cdn.tailwindcss.com` | Every page, in the browser | `public/index.html:8`, `views/*.ejs` |
| Google Fonts (Inter) | Every page, in the browser | `public/index.html:9-11` |
| `placehold.co` | Fallback portrait when `photo.jpg` fails to load | `public/index.html:88` |
| E-mail, phone, Telegram, GitHub, LinkedIn links | Contact links on the page (values not repeated here) | `public/index.html:97-108`, `253-277` |
| Gitea server (Actions, API) | The five workflows | `.gitea/workflows/*.yaml` |

Runtime environment:

- Node.js; no `engines` field in `package.json`. The locked `pdfjs-dist`
  4.10.38 declares `node >=20` (`package-lock.json:1318-1320`). The run of
  2026-11-20 (section 3) used Node v23.11.0.
- Operating system: not stated for the server. The tooling targets Windows
  PowerShell (`runs-on: windows` in every workflow;
  `.gitea/pull_request_template.md` asks for PowerShell 5.1 compatibility).
- No hardware dependencies.

## 3. Functional requirements

Verification "no test" means no automated test exists; manual checks are in
section 8. "Run 2026-11-20" gives what a black-box run showed: the server
files of this branch (`app.js`, `routes/`, `middleware/`, `views/`,
`public/index.html`, `package.json`, `package-lock.json`, taken with
`git archive HEAD`) were copied to a temporary directory, the dependencies
installed with `npm ci --omit=dev` from the lockfile, the server started with
`node app.js` on Node v23.11.0 and driven with curl. No browser was used, so
nothing that runs in the page was checked.

FR-1 to FR-39 keep their numbers of 2026-11-18; requirements added since take
the next free number and stand in the subsection they belong to.

### 3.1 Server start and configuration

- **FR-1.** The system shall load environment variables from a `.env` file at
  start. Source: `app.js:6`. Verification: no test.
- **FR-2.** The system shall listen on the port in `PORT`, or on 3001 when
  `PORT` is unset, and print `Server listening at http://localhost:<port>`.
  Source: `app.js:13`, `app.js:53-54`. Verification: no test. Run 2026-11-20
  with `PORT` set: the line was printed with that port.
- **FR-3.** The system shall sign the session cookie with `SESSION_SECRET`, or
  with 32 random bytes in hex generated at each start when it is unset.
  Source: `app.js:27`. Verification: no test.
- **FR-4.** The system shall print a warning at start when the session secret
  is shorter than 32 characters and `NODE_ENV` is not `production`, and a
  warning when `ADMIN_USERNAME` or `ADMIN_PASSWORD` is unset. Source:
  `app.js:55-60`. Verification: no test. Run 2026-11-20 without the two
  variables: the credentials warning was printed.
- **FR-5.** The system shall answer a request no route or static file matches
  with HTTP 404 and the text `Sorry, can't find that!`. Source: `app.js:64-66`.
  Verification: no test. Run 2026-11-20: `GET /nothing` gave exactly that.
- **FR-6.** The system shall answer an unhandled error with HTTP 500 and the
  text `Something broke!`, and log the error's stack. Source: `app.js:69-72`.
  Verification: no test.
- **FR-40.** The system shall keep sessions in the server process's memory:
  no `store` is passed to `express-session`, whose default is its in-memory
  store, so every session ends when the server restarts. Source:
  `app.js:28-36`. Verification: no test. Run 2026-11-20: after a restart with
  the same `SESSION_SECRET`, the cookie of a logged-in session was sent from
  `/upload` to `/login`.
- **FR-41.** `npm start` shall run `node app.js`, and `npm run dev` shall run
  `nodemon app.js`. Source: `package.json:7-8`. Verification: no test (the
  run of 2026-11-20 started `node app.js` directly).

### 3.2 Portfolio page and static content

- **FR-7.** The system shall serve the files under `public/` as static
  content. Source: `app.js:18`. Verification: no test.
- **FR-8.** The system shall answer `GET /` with `public/index.html`. Source:
  `routes/cvRoutes.js:46-49` (the static handler at `app.js:18` is mounted
  first and, by Express's default `index` option, serves the same file for `/`:
  an inference). Verification: no test. Run 2026-11-20: 200 with the
  25,835 bytes of `public/index.html`; which of the two handlers answered was
  not distinguished.
- **FR-9.** The system shall serve the PDF.js files of
  `node_modules/pdfjs-dist/build` under `/pdfjs` and of
  `node_modules/pdfjs-dist/web` under `/pdfjs/web`. Source: `app.js:20-21`.
  Verification: no test. Run 2026-11-20: `/pdfjs/pdf.mjs` and
  `/pdfjs/pdf.worker.mjs` answered 200 after `npm ci`.
- **FR-10.** The page shall show navigation links to the sections About,
  Experience, Skills, Education, CV (PDF) and Contact. Source:
  `public/index.html:71-76`. Verification: no test.
- **FR-11.** The page shall replace the portrait with a placeholder image from
  `placehold.co` when `/images/photo.jpg` fails to load. The portrait
  `public/images/photo.jpg` is stored in Git LFS. Source:
  `public/index.html:85-88`, `.gitattributes:10`. Verification: no test.
- **FR-12.** The page shall offer a link that opens `/uploads/cv.pdf` in a new
  tab. Source: `public/index.html:232`. Verification: no test.
- **FR-42.** The navigation bar shall stay at the top of the window while the
  page scrolls (`sticky top-0`), and its links shall lead to the sections
  `#about`, `#experience`, `#skills`, `#education`, `#cv` and `#contact`,
  headed About Me, Work Experience, Skills, Education & Courses,
  CV (PDF Document) and Contact. Source: `public/index.html:67-76`, `113-114`,
  `130-131`, `162-163`, `208-209`, `229-230`, `249-250`. Verification: no test.
- **FR-43.** The page shall show links to e-mail, Telegram, GitHub and
  LinkedIn under the owner's name, and links to e-mail, phone, Telegram,
  GitHub and LinkedIn in the Contact section (the addresses are not repeated
  here). Source: `public/index.html:96-108`, `253-277`. Verification: no test.
- **FR-44.** The portfolio page and the three EJS views shall load Tailwind
  CSS from `cdn.tailwindcss.com` and the Inter font from Google Fonts in the
  browser. Source: `public/index.html:8-11`, `views/login.ejs:7-10`,
  `views/upload_form.ejs:7-10`, `views/upload_success.ejs:7-10`.
  Verification: no test.

### 3.3 PDF viewer (browser side)

- **FR-13.** The page shall load `/uploads/cv.pdf` with PDF.js from
  `/pdfjs/pdf.mjs`, using `/pdfjs/pdf.worker.mjs` as the worker, and show the
  page count. Source: `public/index.html:287-295`, `409-414`. Verification: no
  test.
- **FR-14.** The page shall render one PDF page at a time onto one canvas at
  scale 1.5, starting at page 1, showing a loading indicator (a spinner,
  `public/index.html:238-241`) while rendering. Source:
  `public/index.html:313`, `319-356`. Verification: no test.
- **FR-15.** The page shall move one page back or forward on Previous / Next,
  disable Previous on page 1 and Next on the last page, and, when a page is
  requested during rendering, render the latest requested page after the
  current one. Source: `public/index.html:373-406`. Verification: no test.
- **FR-16.** When the PDF fails to load, the page shall hide the loading
  indicator, the controls and the viewer, and show `Failed to load PDF: `
  followed by the error message. Source: `public/index.html:415-424`.
  Verification: no test.
- **FR-17.** When a page fails to render, the page shall show
  `Error rendering page <n>: <message>`. Source: `public/index.html:359-366`.
  Verification: no test.

### 3.4 Authentication

- **FR-18.** The system shall answer `GET /login` with the login form,
  showing the message stored in the session, if any. The handler deletes the
  message only after `res.render` has sent the page (`routes/cvRoutes.js:55-56`),
  and that deletion does not reach the stored session, so the message is not
  shown once: it stays until another message replaces it. Source:
  `routes/cvRoutes.js:52-57`, `views/login.ejs:19-23`. Verification: no test.
  Run 2026-11-20: after one wrong password, `Invalid username or password.`
  appeared on three successive `GET /login` and on `/upload` after a
  successful login; with the deletion moved before `res.render` in the
  temporary copy, it appeared on the first `GET /login` only.
- **FR-19.** On `POST /login`, when `ADMIN_USERNAME` or `ADMIN_PASSWORD` is
  unset, the system shall store the message `Server configuration error.` and
  redirect to `/login`. Source: `routes/cvRoutes.js:65-69`. Verification: no
  test. Run 2026-11-20: 302 to `/login`, then the message on the form.
- **FR-20.** On `POST /login`, when `username` and `password` equal
  `ADMIN_USERNAME` and `ADMIN_PASSWORD` exactly, the system shall mark the
  session as authenticated, store the username in it, and redirect to
  `/upload`. Source: `routes/cvRoutes.js:73-79`. Verification: no test.
  Run 2026-11-20: 302 to `/upload`, which then answered 200.
- **FR-21.** On `POST /login` with any other pair, the system shall store the
  message `Invalid username or password.` and redirect to `/login`. Source:
  `routes/cvRoutes.js:80-85`. Verification: no test. Run 2026-11-20: 302 to
  `/login` with that message.
- **FR-22.** The system shall redirect a request to a protected route whose
  session is not authenticated to `/login`, storing the message
  `Please log in to access this page.`; `GET /upload` and `POST /upload` are
  protected. Source: `middleware/auth.js:5-13`, `routes/cvRoutes.js:90`, `98`.
  Verification: no test. Run 2026-11-20: `GET /upload` without a session gave
  302 to `/login` and that message.
- **FR-23.** On `POST /logout` the system shall destroy the session and
  redirect to `/login`, or to `/` when destroying the session fails. Source:
  `routes/cvRoutes.js:126-135`. Verification: no test. Run 2026-11-20: 302 to
  `/login`; `/upload` then redirected to `/login`.
- **FR-45.** The system shall keep the login state in an `express-session`
  session (fields `isAuthenticated`, `username`, `message`) whose cookie
  expires after 24 hours and is marked `secure` when `NODE_ENV` is
  `production` (NFR-3, NFR-4). Source: `app.js:28-36`,
  `routes/cvRoutes.js:75-76`, `middleware/auth.js:11`. Verification: no test.
  Run 2026-11-20: the cookie was named `connect.sid` (the library default);
  expiry and `secure` were not checked.

### 3.5 CV upload

- **FR-24.** The system shall answer an authenticated `GET /upload` with the
  upload form, showing the stored message. The handler deletes the message
  after rendering, as in FR-18, so the deletion does not persist. Source:
  `routes/cvRoutes.js:90-94`, `views/upload_form.ejs:20-24`. Verification: no
  test. Run 2026-11-20: 200; after a login that followed a wrong password, the
  form showed `Invalid username or password.`.
- **FR-25.** On an authenticated `POST /upload`, the system shall accept one
  file from the multipart field `cvFile`. Source: `routes/cvRoutes.js:98`.
  Verification: no test. Run 2026-11-20: a file in a field named `cvfile` was
  refused with `Upload error: Unexpected field`.
- **FR-26.** The system shall reject a file whose declared MIME type is not
  `application/pdf` with the error `Only PDF files are allowed!`. Source:
  `routes/cvRoutes.js:26-32`. Verification: no test. Run 2026-11-20: a
  `text/plain` file gave `Upload error: Only PDF files are allowed!`.
- **FR-27.** The system shall reject a file larger than 5 MiB
  (5 x 1024 x 1024 bytes). Source: `routes/cvRoutes.js:37-41`. Verification:
  no test. Run 2026-11-20: a 6 MiB file declared as `application/pdf` gave
  `Upload error: File too large`.
- **FR-28.** The system shall store an accepted file as
  `public/uploads/cv.pdf`, creating the directory if it is missing and
  replacing the previous file. Source: `routes/cvRoutes.js:12-23`.
  Verification: no test. Run 2026-11-20: a 193-byte PDF was stored and served
  at `/uploads/cv.pdf` with 200; before it, that path answered 404.
- **FR-29.** When the request carries no file, the system shall store the
  message `No file selected for upload.` and redirect to `/upload`. Source:
  `routes/cvRoutes.js:100-103`. Verification: no test. Run 2026-11-20: 302 to
  `/upload` with that message.
- **FR-30.** After a stored upload the system shall render the success page
  with links to `/` and `/upload` and a logout button. Source:
  `routes/cvRoutes.js:108`, `views/upload_success.ejs:21-33`. Verification: no
  test. Run 2026-11-20: 200.
- **FR-31.** When the upload fails (a multer error or the type filter), the
  system shall store the message `Upload error: <message>` and redirect to
  `/upload`. Source: `routes/cvRoutes.js:110-122`. Verification: no test.
  Run 2026-11-20: 302 to `/upload` in the three cases of FR-25 to FR-27.
- **FR-46.** Current behaviour, recorded as a defect: an upload refused for
  its size also removes the previous CV. multer writes the incoming file
  under the final name `cv.pdf` (`routes/cvRoutes.js:19-22`) and deletes what
  it wrote when the limit is reached, so no CV remains. Source:
  `routes/cvRoutes.js:12-23`, `35-41`. Verification: no test. Run 2026-11-20:
  after an accepted PDF, a 6 MiB upload left `public/uploads/` empty and
  `/uploads/cv.pdf` answering 404. The open task is the row "Keep the current
  CV when an upload is refused" in section 3.8.

### 3.6 Repository interface

- **FR-32.** `recipe.ps1` shall accept exactly one of the verbs `build`,
  `install`, `uninstall`, `clean`, `run`, `publish`, `info`, `test`. Source:
  `recipe.ps1:1-7`. Verification: no test.
- **FR-33.** `recipe.ps1` shall load the variables of `.claude/.env`, when the
  file exists, into the environment, leaving variables that are already set
  unchanged. Source: `recipe.ps1:30-38`. Verification: no test.
- **FR-34.** `recipe.ps1 test` shall set `core.hooksPath` to
  `.claude/hooks/git`, run pytest (accepting exit code 5, no tests collected),
  `ruff check` and `ruff format` over `.claude`, and exit 1 on the first
  failure. Source: `recipe.ps1:41-55`. Verification: no test (on 2026-11-20
  `python -m pytest .claude --collect-only` printed `no tests collected`,
  exit 5; the verb itself was not run).
- **FR-35.** `recipe.ps1 info` shall print the name, code, version and summary.
  Source: `recipe.ps1:56-62`. Verification: no test (run on 2026-11-20 on this
  branch: four lines, exit 0).
- **FR-36.** `recipe.ps1 clean` shall delete every `__pycache__`,
  `.pytest_cache` and `.ruff_cache` directory under the repository. Source:
  `recipe.ps1:63-68`. Verification: no test.
- **FR-37.** `recipe.ps1 build`, `install`, `uninstall`, `run` and `publish`
  shall print `nothing to <verb>` and exit 0. Source: `recipe.ps1:69-73`.
  Verification: no test (run on 2026-11-20 for `build`: `nothing to build`,
  exit 0).
- **FR-38.** The `commit-msg` hook shall refuse a commit whose subject does not
  match `<type>(<scope>): <text>` with a type and scope from `recipe.ps1`
  (case-sensitive), or that has no `Signed-off-by:` trailer with a name and an
  address in angle brackets, or whose message starts with a UTF-8 BOM; a
  subject starting with `Merge ` while git is merging passes unjudged. Source:
  `.claude/hooks/git/commit-msg.ps1:2-3`, `21-28`, `34-35`, `40-53`.
  Verification: no test.
- **FR-39.** The `pre-push` hook shall refuse a branch name outside the
  `<code>-<issue>/<type>/<slug>` grammar, and a push to `release` without the
  recipe's override phrase on a line of its own and a `Why:` line; pushes to
  `test` or `from-*`, deletions of other branches and tags are not judged.
  Source: `.claude/hooks/git/pre-push.ps1:1-7`, `39-95`. Verification: no test.

### 3.7 Development hooks and workflows

- **FR-47.** The Claude Code `PreToolUse` hook `.claude/hooks/gate.ps1`,
  attached to Bash and PowerShell calls, shall deny a call it cannot read, a
  recursive delete whose paths are not all under `$env:TEMP`, a force-push
  (`--force`, `-f`, `--mirror` or a `+ref`; `--force-with-lease` passes), and,
  on the branches `test` and `release`, a history rewrite (`reset --hard`
  other than back to `origin/<branch>` or the upstream, `clean -f`,
  `commit --amend`, `rebase`, `filter-branch`). Source:
  `.claude/settings.json:10-12`, `.claude/hooks/gate.ps1:34-36`, `137-154`,
  `155-163`, `164-177`. Verification: no test.
- **FR-48.** The Claude Code hooks shall append one JSON line without BOM per
  event to `.claude/logs/ai.jsonl`; at session start the hook shall move a log
  larger than 10 MB aside as `ai.jsonl.<timestamp>.bak` and set
  `core.hooksPath` to `.claude/hooks/git`. Source:
  `.claude/settings.json:8-18`, `.claude/hooks/log.ps1:14-24`,
  `.claude/hooks/gate.ps1:6-23`, `.claude/hooks/session-start-stop.ps1:26-36`.
  Verification: no test.
- **FR-49.** The repository shall carry five Gitea Actions workflows, each on
  a `windows` runner: `propose` on pull requests into `test`, `release-gate`
  on pull requests into `release`, `release` on pushes to `release`, `sweep`
  every Monday (cron `0 4 * * 1`), and `test` on pushes to `test`, every night
  (cron `0 3 * * *`) and by hand. Section 4.3 lists what each does. Source:
  `.gitea/workflows/propose.yaml:2-5`, `release-gate.yaml:2-5`,
  `release.yaml:2-4`, `sweep.yaml:2-4`, `test.yaml:2-7`. Verification: no
  test; whether a runner serves this repository is open (section 9,
  question 9).

### 3.8 Declared but not implemented

Rows from the code and the repository's documents name the file where the
item is declared; rows from the first `SPEC.md` are tasks proposed in Jira
KAN-57.

| Item | What is missing or proposed | Where it is declared |
|---|---|---|
| Automated tests for the routes | Nothing tests the JavaScript (`recipe.ps1 test` runs pytest and ruff over `.claude` only, and `app.js` calls `app.listen` on load and exports nothing), so the task is a suite, for example `node --test` with supertest, run by `recipe.ps1 test` and failing it, that checks `GET /` answers 200, `GET /upload` without a session and a wrong password redirect to `/login`, and a non-PDF or a file over 5 MB is refused. | Jira KAN-57 (task proposed 2026-11-17) |
| Keep the current CV when an upload is refused | multer writes every upload straight to `public/uploads/cv.pdf` (`routes/cvRoutes.js:19-22`), so a refused oversize upload deletes the live CV (FR-46), and the task is to write under a temporary name and rename to `cv.pdf` only after the size and type checks pass. | Jira KAN-57 (task proposed 2026-11-17) |
| Remove the unused front-end leftovers | `public/js/main.js` (loaded by no page, requests `/api/cv`, a route that does not exist, `public/js/main.js:9`), `views/upload_form.html` and `views/upload_success.html` (never rendered, the first posting a `cvfile` field that multer refuses), `public/css/style.css` (linked only from those two) and the vendored `public/js/pdfjs/build/` (2,868,101 bytes, not used by `public/index.html`) are to be deleted, after which the CV must still render on `/` and download from `/uploads/cv.pdf`. | Jira KAN-57 (task proposed 2026-11-17) |
| Hash the admin password and limit login attempts | `POST /login` compares the password with `ADMIN_PASSWORD` as plain text with `===` (`routes/cvRoutes.js:73`, below the comment at line 72 that suggests bcrypt) and does not limit failed attempts, and the task is to keep only a bcrypt hash in `.env` (for example `ADMIN_PASSWORD_HASH`), check it with `bcrypt.compare`, and answer 429 after 5 failed attempts from one address within 15 minutes. | Jira KAN-57 (task proposed 2026-11-17) |
| One-time messages on the login and upload forms | The handlers delete the stored message after rendering it, but the deletion is not saved, so a message stays on the forms until another one replaces it (FR-18, FR-24). | Comment "Clear the message after displaying it" at `routes/cvRoutes.js:56`, also `routes/cvRoutes.js:93` |
| Lab requirements R-02, R-09, R-37, R-41, R-42 | Listed as exceptions. R-02 and R-09 are explained in `CLAUDE.md` (rule 4, "Where this repository is deliberately relaxed"); the content of R-37, R-41 and R-42 is not in this repository. | `README.md`, "Lab requirements" (issues #7-#11) |
| Installer build, install/uninstall proof, wiki regeneration | `recipe.ps1` defines no `$App` and an empty `$Provides` (`recipe.ps1:16-17`), so these steps are skipped or print `nothing to build`. | `.gitea/workflows/release-gate.yaml:55-75`, `test.yaml:59-110` |
| Manual test list | The file does not exist; an empty list counts as passed (`release-gate.yaml:139-140`). | `.gitea/workflows/release-gate.yaml:107-137` reads `tests/manual/tests.json` |

## 4. Interfaces

### 4.1 HTTP endpoints

| Method | Path | Auth | Request | Response | Source |
|---|---|---|---|---|---|
| GET | `/` | no | - | `public/index.html` | `routes/cvRoutes.js:46-49`, `app.js:18` |
| GET | `/<file under public/>` | no | - | static file (`/css/style.css`, `/images/photo.jpg`, `/js/...`) | `app.js:18` |
| GET | `/uploads/cv.pdf` | no | - | the current CV, 404 before the first upload | `app.js:18`, `routes/cvRoutes.js:14-21` |
| GET | `/pdfjs/<file>` | no | - | `node_modules/pdfjs-dist/build/<file>` | `app.js:20` |
| GET | `/pdfjs/web/<file>` | no | - | `node_modules/pdfjs-dist/web/<file>` | `app.js:21` |
| GET | `/login` | no | - | login form (EJS) | `routes/cvRoutes.js:52-57` |
| POST | `/login` | no | form: `username`, `password` | 302 to `/upload` or `/login` | `routes/cvRoutes.js:60-86` |
| GET | `/upload` | yes | - | upload form (EJS), else 302 to `/login` | `routes/cvRoutes.js:90-94` |
| POST | `/upload` | yes | multipart: `cvFile` (PDF, at most 5 MiB) | success page, or 302 to `/upload` / `/login` | `routes/cvRoutes.js:98-122` |
| POST | `/logout` | no | - | 302 to `/login` (or `/`) | `routes/cvRoutes.js:126-135` |
| any | anything else | - | - | 404 `Sorry, can't find that!` | `app.js:64-66` |

Request bodies of forms are parsed as `application/x-www-form-urlencoded`
(`app.js:24`). Session cookie: `express-session` defaults for name
(`connect.sid`, seen on the run of 2026-11-20) and store (in memory, FR-40),
`maxAge` 24 h, `secure` when `NODE_ENV=production` (`app.js:28-36`).

### 4.2 Command line

| Command | Effect | Source |
|---|---|---|
| `npm start` | `node app.js` | `package.json:7` |
| `npm run dev` | `nodemon app.js` | `package.json:8` |
| `.\recipe.ps1 <verb>` | see FR-32 to FR-37 | `recipe.ps1` |

The server takes no command-line arguments.

### 4.3 Development hooks and workflows

The requirements are FR-38, FR-39 and FR-47 to FR-49.

| Item | Trigger | What it does | Source |
|---|---|---|---|
| `.claude/hooks/gate.ps1` | Claude Code `PreToolUse` on Bash/PowerShell | Denies recursive deletes outside `$env:TEMP`, force-pushes, history rewrites on `test`/`release`, and unreadable tool calls | `.claude/settings.json:10-12`, `gate.ps1:35`, `137`, `161`, `175` |
| `.claude/hooks/log.ps1`, `session-start-stop.ps1` | Other Claude Code events | Append one JSON line per event to `.claude/logs/ai.jsonl` | `.claude/settings.json:8-18`, `log.ps1` |
| `propose` | Pull request into `test` | Branch name, commit wording, `recipe.ps1 test` + `git diff --exit-code`, review request | `.gitea/workflows/propose.yaml` |
| `release-gate` | Pull request into `release` | Only from `test`; tests; installer if an app; manual test gate | `.gitea/workflows/release-gate.yaml` |
| `release` | Push to `release` | Version from `recipe.ps1`, release notes, override record, release, SBOM, close issues, sync `test` | `.gitea/workflows/release.yaml` |
| `sweep` | Cron `0 4 * * 1` | Deletes merged work branches; nudges pull requests idle 30 days, closes them at 60 | `.gitea/workflows/sweep.yaml:4`, `65-77` |
| `test` | Push to `test`, cron `0 3 * * *`, manual | Runner health, tests, build, pack if an app, wiki if it ships | `.gitea/workflows/test.yaml` |

## 5. Data

| Entity | Storage | Format and lifetime | Source |
|---|---|---|---|
| CV | `public/uploads/cv.pdf` (gitignored directory) | One PDF, overwritten by each upload; removed by an upload refused for its size (FR-46) | `routes/cvRoutes.js:12-23`, `.gitignore:29` |
| Session | `express-session` default store, in the process's memory (FR-40) | Fields `isAuthenticated`, `username`, `message`; cookie 24 h; lost at restart | `app.js:28-36`, `routes/cvRoutes.js:75-76`, `middleware/auth.js:11` |
| Administrator credentials | `ADMIN_USERNAME`, `ADMIN_PASSWORD` in `.env` or the environment | Plain text | `routes/cvRoutes.js:62-63`, `.gitignore:28` |
| Page content | `public/index.html` | Hard-coded HTML | `public/index.html` |
| Portrait | `public/images/photo.jpg` | JPEG in Git LFS | `.gitattributes:10` |
| Hook event log | `.claude/logs/ai.jsonl` (gitignored) | JSON lines, UTF-8 without BOM; moved to `.bak` over 10 MB at session start | `.claude/hooks/log.ps1`, `session-start-stop.ps1:27-30`, `.gitignore:17` |

## 6. Non-functional requirements

- **NFR-1.** Uploads are limited to 5 MiB per file. Source:
  `routes/cvRoutes.js:39`.
- **NFR-2.** Only files declared as `application/pdf` are stored. Source:
  `routes/cvRoutes.js:27`.
- **NFR-3.** The session cookie expires after 24 hours. Source: `app.js:34`.
- **NFR-4.** The session cookie is marked `secure` when `NODE_ENV=production`.
  Source: `app.js:33`.
- **NFR-5.** Sessions are not saved unless modified and not created until
  something is stored. Source: `app.js:30-31`.
- **NFR-6.** No key is committed: `.env` and `.claude/.env` are gitignored.
  Source: `.gitignore:24`, `.gitignore:28`, `CLAUDE.md` rule 4.
- **NFR-7.** Text files are checked out with LF line endings; `.ps1`, `.bat`
  and `.cmd` files with CRLF (`.ps1` with UTF-8 working-tree encoding); PDF,
  PNG, JPG, ZIP and 7z files go through Git LFS. Source: `.gitattributes:1-13`.
- **NFR-8.** ruff must be version 0.16.1. Source: `.claude/ruff.toml:2`.
- **NFR-9.** Workflow job limits: 60 minutes for `propose`, `release-gate`
  checks, `release` and `test`; 170 minutes for the manual gate, which waits
  up to 150 minutes for a verdict; 15 minutes for `sweep`. Source:
  `propose.yaml:15`, `release-gate.yaml:19`, `91`, `101`, `release.yaml:14`,
  `test.yaml:17`, `sweep.yaml:14`.
- **NFR-10.** The `test` workflow fails when the runner has less than 5 GB
  free on `C:` and warns below 20 GB. Source: `.gitea/workflows/test.yaml:32-36`.
- **NFR-11.** Hook log writes retry up to 20 times with 10, 20, ... ms waits
  when the file is in use. Source: `.claude/hooks/log.ps1:20-24`.

No performance, availability or capacity targets are stated anywhere in the
repository.

## 7. Constraints and dependencies

| Package | Declared (`package.json`) | Locked (`package-lock.json`) | Role |
|---|---|---|---|
| express | `^4.18.2` | 4.21.2 | HTTP server, routing, static files |
| express-session | `^1.17.3` | 1.18.1 | Sessions |
| ejs | `^3.1.8` | 3.1.10 | View templates |
| multer | `^1.4.5-lts.1` | 1.4.5-lts.2 | Multipart upload |
| dotenv | `^16.0.3` | 16.5.0 | `.env` loading |
| pdfjs-dist | `^4.4.168` | 4.10.38 (`node >=20`, Apache-2.0) | PDF.js served under `/pdfjs` |
| nodemon (dev) | `^3.1.10` | 3.1.10 | `npm run dev` |

Other constraints:

- `public/js/pdfjs/build/` is a vendored PDF.js 4.10.38
  (`public/js/pdfjs/build/pdf.mjs:21521`).
- The Tailwind script is loaded from its CDN without a version
  (`public/index.html:8`).
- Licence: `LICENSE` is MIT; `package.json:17` says ISC.
- Tooling: PowerShell for `recipe.ps1` and the hooks; Python with pytest and
  ruff for `recipe.ps1 test`; Git LFS for binaries (`.gitattributes`,
  `.claude/hooks/git/pre-push`).
- Process rules (branch grammar, commit format, sign-off, review by
  `$Reviewers`) are in `CLAUDE.md` and `recipe.ps1:19-23`.

## 8. Acceptance

Automated: `.\recipe.ps1 test` must exit 0 (`CLAUDE.md` rule 3). It covers
only `.claude/` and currently collects no tests, so it says nothing about
FR-1 to FR-31 or FR-40 to FR-46.

Manual checks, one per group. None has been recorded as run by a tester. On
2026-11-20 checks 1, 3, 4, 5 and 7, and the `/nothing` part of check 2, were
run with curl against a temporary copy of this branch's server code
(section 3, "Run 2026-11-20"), with `node app.js` and a `PORT` of its own
instead of `npm start` on 3001; check 6 and the page part of check 2 need a
browser and were not run; check 8 was run on this branch.

1. With `.env` holding `ADMIN_USERNAME`, `ADMIN_PASSWORD`, run `npm install`
   and `npm start`; the console prints `Server listening at
   http://localhost:3001` (FR-1, FR-2). Without the two variables it also
   prints the credentials warning (FR-4).
2. Open `/` before any upload: the CV section shows `Failed to load PDF: ...`
   and hides the viewer (FR-16). `/nothing` returns 404 with
   `Sorry, can't find that!` (FR-5).
3. Open `/upload` without logging in: redirected to `/login` with
   `Please log in to access this page.` (FR-22).
4. Log in with a wrong password: `Invalid username or password.` (FR-21).
   Log in with the right pair: redirected to `/upload` (FR-20).
5. Upload a non-PDF: `Upload error: Only PDF files are allowed!` (FR-26,
   FR-31). Upload a PDF over 5 MiB: `Upload error: File too large` (FR-27;
   seen on 2026-11-20). Upload a valid PDF: success page, and
   `public/uploads/cv.pdf` is replaced (FR-28, FR-30).
6. Open `/`: the PDF renders page 1 with a page count; Previous is disabled on
   page 1, Next on the last page (FR-13 to FR-15). The download link opens the
   same PDF (FR-12).
7. Press "Log Out": redirected to `/login`; `/upload` again redirects to
   `/login` (FR-23, FR-22).
8. `.\recipe.ps1 info` prints four lines; `.\recipe.ps1 build` prints
   `nothing to build` (FR-35, FR-37).

## 9. Open questions

1. Who the intended visitors are, and where and how the site is deployed
   (host, HTTPS, reverse proxy, process manager, `NODE_ENV`). Nothing in the
   repository configures a deployment.
2. Which Node.js version is required. There is no `engines` field; only the
   dependency `pdfjs-dist` declares `>=20`.
3. Whether `public/js/main.js` and its `/api/cv` endpoint are planned work or
   leftovers, and whether `views/*.html`, `public/css/style.css` and the
   vendored `public/js/pdfjs/build/` are to be kept. The task "Remove the
   unused front-end leftovers" (section 3.8), proposed on 2026-11-17, deletes
   them; no decision of the owner on it is recorded in the repository.
4. Whether in-memory sessions are acceptable in production: no store is
   configured, and on 2026-11-20 a restart ended a logged-in session (FR-40).
5. Answered on 2026-11-20: an upload refused for its size deletes the
   existing `cv.pdf`, because the file is written straight to its final name
   (`routes/cvRoutes.js:21`); see FR-46 and the task "Keep the current CV
   when an upload is refused" in section 3.8. A refused wrong-type upload
   keeps it: in a second run on 2026-11-20, after an accepted PDF, a
   `text/plain` upload was refused and `/uploads/cv.pdf` still answered 200
   with the same bytes.
6. Whether a secure cookie behind a proxy is expected to work: no
   `trust proxy` setting exists (inference; not tested).
7. Whether the 5 MiB limit and the PDF-only rule are requirements or code
   defaults; the code comment says "e.g., 5MB" (`routes/cvRoutes.js:39`).
8. What R-37, R-41 and R-42 of the lab requirements demand, and how issues
   #7-#11 are to be closed: the requirements document is linked at a
   `127.0.0.1` address and is not in this repository.
9. Whether a Gitea Actions runner serves this repository. The README says the
   old Node.js CI/CD had no runner; `CLAUDE.md` covers both cases.
10. Answered: the licence is MIT. `README.md` says MIT ("License") and notes
    ("What is here") that `package.json` "still says ISC"; the `license` field at
    `package.json:17` is the one place that disagrees with `LICENSE`.
11. Answered on 2026-11-20: the `SPEC.md` of 2026-11-17 on this branch
    (commit `8ec8c69`) and this specification are merged into this file.
    Its six done tasks are covered by sections 3.1 to 3.7, and its four open
    tasks are the rows of section 3.8 marked "Jira KAN-57". The rows
    "`GET /api/cv` returning the PDF", "Password hashing" and "Older upload
    pages" of the 2026-11-18 table are folded into the tasks "Remove the
    unused front-end leftovers" and "Hash the admin password and limit login
    attempts", so that no piece of work is listed twice.
